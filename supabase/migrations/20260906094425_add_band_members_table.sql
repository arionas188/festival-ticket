-- Νέος πίνακας: band_members
-- Σκοπός: λίστα μελών μπάντας (όνομα + ρόλος/όργανο + φωτογραφία) για το
-- section "Τα μέλη μας" στο /about. Ξεχωριστός πίνακας (όχι πολυμορφικός με
-- μελλοντικά venue photos) — απόφαση με τον χρήστη: καθαρότερο, ίδιο naming
-- pattern με products/tickets, καμία εξάρτηση από μελλοντικό schema που δεν
-- έχει ακόμα σχεδιαστεί.
--
-- Rendering rule (αποφασισμένο με τον χρήστη): ΔΕΝ προστίθεται πεδίο "type"
-- στο tenants τώρα. Το section εμφανίζεται στο frontend ΜΟΝΟ όταν υπάρχουν
-- πραγματικά rows εδώ για το tenant — καθαρά data-driven, όχι tenant-type-driven.
-- Ένα venue tenant απλά δεν θα έχει ποτέ rows σε αυτόν τον πίνακα.

begin;

create table if not exists public.band_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  role text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists band_members_tenant_id_idx
  on public.band_members (tenant_id);

alter table public.band_members enable row level security;

-- Public read (ίδιο pattern με events/products/tickets) — καμία write policy
-- ακόμα, θα προστεθεί μαζί με το μελλοντικό Tenant Admin Dashboard.
create policy "Public read access to active band members"
  on public.band_members
  for select
  using (is_active = true);

commit;

-- Οδηγίες προς τον χρήστη (τρέξε στο Supabase SQL editor):
-- Μετά το migration, πρόσθεσε χειροκίνητα 2-3 δοκιμαστικά μέλη π.χ.:
--
-- insert into public.band_members (tenant_id, name, role, image_url, sort_order)
-- values
--   ('<villagers-tenant-id>', 'Στέλιος Σαλβαδόρ', 'Φωνή / Μπάσο', 'https://.../photo1.jpg', 1),
--   ('<villagers-tenant-id>', 'Δημήτρης Μπάννυ', 'Κιθάρα', 'https://.../photo2.jpg', 2);
--
-- Sanity check (πρέπει να γυρίσει τα rows που μόλις έβαλες):
-- select id, name, role, sort_order from public.band_members order by sort_order;
