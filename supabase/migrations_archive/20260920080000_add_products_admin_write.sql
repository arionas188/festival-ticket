-- ============================================================
-- Tenant Admin Dashboard — "Πρόσθεσε προϊόν" (20/9, ρητό αίτημα χρήστη):
-- ο tenant admin μπορεί πλέον να προσθέτει/επεξεργάζεται/διαγράφει merch
-- προϊόντα από πραγματική σελίδα στο ίδιο το tenant-site, αντί να το
-- κάνει χειροκίνητα μέσα από το Supabase table editor.
--
-- Μέχρι τώρα τα products/product_variants είχαν ΜΟΝΟ public read policy
-- (κανείς δεν μπορούσε ποτέ να γράψει από το frontend). Ίδιος ΑΚΡΙΒΩΣ
-- μηχανισμός με events/tickets (βλ. migration
-- 20260912180000_add_events_tickets_admin_write.sql) — μόνο πραγματικός
-- admin ΤΟΥ tenant (μέσω tenant_admins) μπορεί να γράψει. Για
-- product_variants δεν υπάρχει tenant_id απευθείας στη γραμμή —
-- ελέγχουμε μέσω του product_id ότι το ίδιο το προϊόν ανήκει σε tenant
-- που διαχειρίζεται ο χρήστης (ίδιο μοτίβο με tickets μέσω event_id).
--
-- Οι εικόνες προϊόντος ΔΕΝ χρειάζονται νέο storage bucket/RLS — ξαναχρησιμο-
-- ποιούν το ήδη υπάρχον "tenant-images" bucket (βλ.
-- 20260911170000_add_tenant_images_storage.sql), με path
-- "<tenant_id>/products/...". Η ήδη υπάρχουσα storage.objects RLS εκεί
-- ελέγχει ΜΟΝΟ το πρώτο φάκελο (tenant_id) — δουλεύει ήδη σωστά για
-- οποιοδήποτε sub-path, καμία αλλαγή χρειάζεται εκεί.
-- ============================================================

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- --- products: insert/update/delete μόνο από admin του ίδιου tenant ---

drop policy if exists "tenant admins can create their own tenant products" on public.products;
create policy "tenant admins can create their own tenant products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = products.tenant_id
    )
  );

drop policy if exists "tenant admins can update their own tenant products" on public.products;
create policy "tenant admins can update their own tenant products"
  on public.products for update
  using (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = products.tenant_id
    )
  )
  with check (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = products.tenant_id
    )
  );

drop policy if exists "tenant admins can delete their own tenant products" on public.products;
create policy "tenant admins can delete their own tenant products"
  on public.products for delete
  using (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = products.tenant_id
    )
  );

-- --- product_variants: ίδιο, αλλά μέσω του tenant_id του γονικού product ---

drop policy if exists "tenant admins can create variants for their own products" on public.product_variants;
create policy "tenant admins can create variants for their own products"
  on public.product_variants for insert
  with check (
    exists (
      select 1 from public.products p
      join public.tenant_admins ta on ta.tenant_id = p.tenant_id
      where p.id = product_variants.product_id
        and ta.user_id = auth.uid()
    )
  );

drop policy if exists "tenant admins can update variants for their own products" on public.product_variants;
create policy "tenant admins can update variants for their own products"
  on public.product_variants for update
  using (
    exists (
      select 1 from public.products p
      join public.tenant_admins ta on ta.tenant_id = p.tenant_id
      where p.id = product_variants.product_id
        and ta.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.tenant_admins ta on ta.tenant_id = p.tenant_id
      where p.id = product_variants.product_id
        and ta.user_id = auth.uid()
    )
  );

drop policy if exists "tenant admins can delete variants for their own products" on public.product_variants;
create policy "tenant admins can delete variants for their own products"
  on public.product_variants for delete
  using (
    exists (
      select 1 from public.products p
      join public.tenant_admins ta on ta.tenant_id = p.tenant_id
      where p.id = product_variants.product_id
        and ta.user_id = auth.uid()
    )
  );

-- Sanity check (τρέξε ξεχωριστά, read-only):
--   select policyname, cmd from pg_policies where tablename in ('products','product_variants') order by tablename, cmd;
--   -- πρέπει να δείξει: products → select/insert/update/delete, product_variants → select/insert/update/delete.
