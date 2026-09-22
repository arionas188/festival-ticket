-- ============================================================
-- "New" tab (20/9, ρητό αίτημα χρήστη): νέο tab ανά tenant, δίπλα σε
-- Πληροφορίες/Εκδηλώσεις/Merch Store — instagram-stories στυλ feed όπου
-- ο tenant admin ανεβάζει ΕΙΤΕ φωτογραφία ΕΙΤΕ video (ρητή απόφαση
-- χρήστη — ποτέ και τα δύο μαζί στην ίδια ανάρτηση), π.χ. "πάμε live σε
-- 1 ώρα" πριν ανέβει η μπάντα στη σκηνή. Οι fans βλέπουν το feed και
-- μπορούν ΜΟΝΟ να κάνουν like (καμία δυνατότητα σχολίου/απάντησης).
--
-- Λήξη: ο admin διαλέγει διάρκεια κατά την ανάρτηση (3/6/12/24/48
-- ώρες) και η ανάρτηση ΔΙΑΓΡΑΦΕΤΑΙ ΜΟΝΙΜΑ όταν περάσει — ρητή απόφαση
-- χρήστη (όχι απλή απόκρυψη/φιλτράρισμα), ίδια φιλοσοφία με το ήδη
-- υπάρχον expire_stale_orders (βλ. migration 20260914150000). Μόνιμη
-- διαγραφή είναι ακόμα πιο σημαντική εδώ απ' ό,τι στα orders, επειδή
-- video files "βαραίνουν" το storage πολύ περισσότερο από αριθμητικές
-- γραμμές stock.
-- ============================================================

-- Νέο, ΞΕΧΩΡΙΣΤΟ bucket "tenant-posts" (ΟΧΙ το ήδη υπάρχον
-- "tenant-images") — σκόπιμα ξεχωριστό, τρεις λόγοι:
--   1) Μεγαλύτερο file_size_limit (video 20", ΔΕΝ συμπιέζεται εύκολα
--      client-side σε αντίθεση με τη φωτογραφία, βλ. useCreateTenantPost.js).
--   2) Επιπλέον επιτρεπόμενοι mime types (video, όχι μόνο εικόνα).
--   3) ΕΝΤΕΛΩΣ διαφορετικός κύκλος ζωής — εδώ αυτόματη ΜΟΝΙΜΗ διαγραφή
--      μετά από ώρες, στο tenant-images ΠΟΤΕ. Καμία αλλαγή στο ήδη
--      υπάρχον tenant-images bucket/RLS/όριο.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-posts',
  'tenant-posts',
  true,
  26214400, -- 25MB — αρκετό για 20" video κινητού σε λογική ποιότητα
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS — ΙΔΙΟ ΑΚΡΙΒΩΣ μηχανισμό με tenant-images (βλ. migration
-- 20260911170000_add_tenant_images_storage.sql): μόνο πραγματικός admin
-- ΤΟΥ tenant μπορεί να γράψει στο δικό του path "<tenant_id>/...".
-- Χωρίς UPDATE policy — μια ανάρτηση δεν επεξεργάζεται ποτέ μετά τη
-- δημιουργία της, μόνο δημιουργείται/λήγει. Το DELETE policy εδώ
-- καλύπτει τον admin (π.χ. αν μελλοντικά προστεθεί χειροκίνητη
-- διαγραφή) — η αυτόματη λήξη παρακάτω τρέχει ούτως ή άλλως ως
-- SECURITY DEFINER, δεν χρειάζεται αυτό το policy.
create policy "tenant admins can upload their own tenant posts"
  on storage.objects for insert
  with check (
    bucket_id = 'tenant-posts'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can delete their own tenant posts"
  on storage.objects for delete
  using (
    bucket_id = 'tenant-posts'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- tenant_posts
-- ============================================================
create table public.tenant_posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- Πλήρες public URL — ίδια σύμβαση με products.image_urls/
  -- events.image_url/tenant_settings.cover_image_url (πάντα το πλήρες
  -- URL αποθηκεύεται, ΠΟΤΕ bare path, βλ. useUploadTenantImage.js).
  media_url text not null,
  -- Bare path ΜΕΣΑ στο bucket tenant-posts (π.χ. "<tenant_id>/<uuid>.jpg")
  -- — χρειάζεται ΞΕΧΩΡΙΣΤΑ από το media_url ΜΟΝΟ για το πραγματικό
  -- Storage API delete call στο expire_tenant_posts() παρακάτω (να μην
  -- κάνουμε fragile parsing πάνω στο public URL μέσα σε SQL).
  media_path text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.tenant_posts enable row level security;

-- Δημόσιο SELECT (χωρίς login) — ίδιο μοτίβο με products/events, το "New"
-- tab πρέπει να είναι ορατό και σε αποσυνδεδεμένο επισκέπτη. ΔΕΝ
-- χρειάζεται φιλτράρισμα expires_at εδώ: με ΜΟΝΙΜΗ διαγραφή (βλ.
-- expire_tenant_posts() παρακάτω) μια ληγμένη γραμμή απλά ΔΕΝ υπάρχει
-- πια στον πίνακα.
create policy "Anyone can view tenant posts"
  on public.tenant_posts for select using (true);

create policy "tenant admins can create their own tenant posts"
  on public.tenant_posts for insert
  with check (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = tenant_posts.tenant_id
    )
  );

create index idx_tenant_posts_tenant_id_created_at on public.tenant_posts(tenant_id, created_at desc);
create index idx_tenant_posts_expires_at on public.tenant_posts(expires_at);

-- ============================================================
-- tenant_post_likes — fans μπορούν ΜΟΝΟ να κάνουν like (ρητό αίτημα
-- χρήστη), ίδιο μοτίβο με favorites (toggle μέσω insert/delete).
-- ============================================================
create table public.tenant_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.tenant_posts(id) on delete cascade,
  fan_id uuid not null references public.fans(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, fan_id)
);

alter table public.tenant_post_likes enable row level security;

create policy "Anyone can view tenant post likes"
  on public.tenant_post_likes for select using (true);

create policy "Fans can like as themselves"
  on public.tenant_post_likes for insert
  with check (auth.uid() = fan_id);

create policy "Fans can unlike their own like"
  on public.tenant_post_likes for delete
  using (auth.uid() = fan_id);

create index idx_tenant_post_likes_post_id on public.tenant_post_likes(post_id);
create index idx_tenant_post_likes_fan_id on public.tenant_post_likes(fan_id);

-- ============================================================
-- Αυτόματη, ΜΟΝΙΜΗ λήξη. Ρητή απόφαση χρήστη (μετά από ρητή συζήτηση
-- για το technical trade-off): pg_net καλεί το ΠΡΑΓΜΑΤΙΚΟ Supabase
-- Storage HTTP API ώστε να ελευθερώνεται ΚΑΙ ο χώρος (όχι μόνο η
-- γραμμή) — μια απλή SQL διαγραφή πάνω στο storage.objects θα άφηνε το
-- πραγματικό αρχείο "ορφανό" στο backend για πάντα (συνεχίζει να
-- μετράει storage/κόστος, ειδικά κρίσιμο για video).
-- ============================================================

create extension if not exists pg_net;

-- ⚠️ ΧΕΙΡΟΚΙΝΗΤΟ ΒΗΜΑ ΤΟΥ ΧΡΗΣΤΗ, ΞΕΧΩΡΙΣΤΑ (βλ. οδηγίες στο τέλος
-- αυτού του αρχείου) — αυτό το migration ΔΕΝ αποθηκεύει το project URL
-- ούτε το service_role key. Μέχρι να μπουν τα δύο αυτά Vault secrets
-- (ίδιος μηχανισμός με fan_pii_encryption_key, βλ. migration
-- 20260909100000), η function παρακάτω επιστρέφει αθόρυβα χωρίς να
-- σβήσει ΤΙΠΟΤΑ — ΔΕΝ σβήνουμε ποτέ τη γραμμή βάσης χωρίς να έχουμε
-- προσπαθήσει να καθαρίσουμε ΚΑΙ το πραγματικό αρχείο πρώτα (αλλιώς θα
-- έμεναν ορφανά αρχεία στο storage χωρίς κανένα ίχνος στη βάση για να
-- τα εντοπίσουμε αργότερα).
create or replace function public.expire_tenant_posts()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post record;
  v_project_url text;
  v_service_key text;
begin
  select decrypted_secret into v_project_url
  from vault.decrypted_secrets where name = 'concerto_project_url';

  select decrypted_secret into v_service_key
  from vault.decrypted_secrets where name = 'concerto_service_role_key';

  if v_project_url is null or v_service_key is null then
    return;
  end if;

  for v_post in
    select id, media_path from public.tenant_posts where expires_at < now()
  loop
    -- Fire-and-forget: το pg_net είναι ασύγχρονο (queue, δεν περιμένει
    -- απάντηση εδώ μέσα) — η γραμμή διαγράφεται αμέσως μετά, ανεξάρτητα
    -- από το πότε θα ολοκληρωθεί το HTTP call. apikey + Authorization
    -- και τα δύο (ίδιο service_role key) — το Supabase API gateway
    -- απαιτεί συνήθως και τα δύο headers, όχι μόνο Authorization.
    perform net.http_delete(
      url := v_project_url || '/storage/v1/object/tenant-posts/' || v_post.media_path,
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_service_key,
        'apikey', v_service_key
      )
    );

    delete from public.tenant_posts where id = v_post.id;
  end loop;
end;
$$;

select cron.schedule(
  'expire-tenant-posts',
  '* * * * *',
  $$select public.expire_tenant_posts();$$
);

-- ============================================================
-- ⚠️ ΧΕΙΡΟΚΙΝΗΤΟ ΒΗΜΑ ΤΟΥ ΧΡΗΣΤΗ — ΤΡΕΞΕ ΞΕΧΩΡΙΣΤΑ, ΑΠΕΥΘΕΙΑΣ ΣΤΟ
-- SUPABASE SQL EDITOR (ΠΟΤΕ μέσω chat/AI — το service_role key
-- παρακάμπτει ΚΑΘΕ RLS, είναι το πιο ευαίσθητο credential του project):
--
-- 1) Database → Extensions → ενεργοποίησε "pg_net" αν δεν είναι ήδη
--    (πιθανόν χρειάζεται και πριν το CREATE EXTENSION παραπάνω περάσει).
--
-- 2) select vault.create_secret(
--      'https://<το-project-ref-σου>.supabase.co',
--      'concerto_project_url',
--      'Base URL used by expire_tenant_posts() to call the Storage API'
--    );
--
-- 3) select vault.create_secret(
--      '<το service_role key σου — Project Settings → API → service_role>',
--      'concerto_service_role_key',
--      'Used by expire_tenant_posts() to permanently delete expired post media'
--    );
--
-- Μέχρι να τρέξουν τα 2)/3), οι αναρτήσεις ΔΕΝ θα διαγράφονται καθόλου
-- (ασφαλές, βλ. πάνω) — απλά θα συσσωρεύονται. Θα το καταλάβεις γρήγορα
-- αν δεις μια δοκιμαστική ανάρτηση με 3ωρη διάρκεια να μην εξαφανίζεται.
-- ============================================================
