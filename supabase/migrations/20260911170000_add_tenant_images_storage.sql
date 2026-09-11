-- ============================================================
-- Tenant Admin Dashboard / inline editing — βήμα 2: πραγματικό
-- image upload (αντί για paste URL), με ασφάλεια σε δύο επίπεδα
-- (12/9, ρητό αίτημα χρήστη — "τήρησε όλους τους κανόνες ασφαλείας").
-- ============================================================

-- Bucket ειδικά για εικόνες tenants (cover/logo). public = true ώστε
-- να είναι ορατές σε ΟΛΟΥΣ (fans, χωρίς login) μέσω του public URL —
-- το read path παρακάμπτει εντελώς το RLS για public buckets, οπότε
-- ΔΕΝ χρειάζεται ξεχωριστό SELECT policy παρακάτω.
--
-- Επίπεδο 1 ασφάλειας (server-side, ΟΧΙ μόνο το frontend μας):
-- allowed_mime_types + file_size_limit επιβάλλονται από το ίδιο το
-- Supabase Storage σε ΚΑΘΕ upload, ό,τι client και να το προσπαθήσει
-- (ακόμα κι αν κάποιος παρακάμψει το UI μας και χτυπήσει το API
-- απευθείας). 5MB όριο, μόνο πραγματικοί τύποι εικόνας.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-images',
  'tenant-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Επίπεδο 2 ασφάλειας: ΠΟΙΟΣ επιτρέπεται να γράψει ΠΟΥ. Κάθε αρχείο
-- αποθηκεύεται σε path της μορφής "<tenant_id>/cover-<timestamp>.<ext>"
-- — το storage.foldername(name) δίνει τον πρώτο φάκελο (το tenant_id)
-- και ελέγχουμε ότι ο συνδεδεμένος χρήστης είναι admin ΑΚΡΙΒΩΣ αυτού
-- του tenant (ίδιος μηχανισμός/πίνακας tenant_admins με το
-- tenant_settings write policy — βλ. tenant_admins migration).
create policy "tenant admins can upload their own tenant images"
  on storage.objects for insert
  with check (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can update their own tenant images"
  on storage.objects for update
  using (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can delete their own tenant images"
  on storage.objects for delete
  using (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );
