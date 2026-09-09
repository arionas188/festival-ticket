-- Πλήρης φόρμα προφίλ fan (9/9): Όνομα, Επίθετο, Display name, Τηλέφωνο,
-- Ημ. γέννησης, Πόλη, Αγαπημένα είδη μουσικής, Αγαπημένο tenant.
--
-- Ζητήθηκε ρητά από τον χρήστη με ακριβή λίστα πεδίων. Δύο κατηγορίες:
-- (α) προσωπικά/αναγνωριστικά (όνομα/επίθετο/display name/τηλέφωνο) —
--     ΚΡΥΠΤΟΓΡΑΦΗΜΕΝΑ, ίδιο μοντέλο με ημ. γέννησης/πόλη (fan_private_details,
--     Vault+pgcrypto, SECURITY DEFINER RPCs) — βλ. 20260909100000/20260909110000.
-- (β) προτιμήσεις (αγαπημένα είδη μουσικής/αγαπημένο tenant) — ΑΠΛΑ,
--     αναζητήσιμα πεδία στο fans table (ρητή απόφαση χρήστη μετά από
--     ερώτηση: πιο χρήσιμα plain για μελλοντικά στατιστικά/recommendations
--     ανά tenant, π.χ. "πόσοι fans αγαπούν rock" — δεν είναι προσωπικά
--     αναγνωριστικά στοιχεία σαν το όνομα/τηλέφωνο).
--
-- Σχέση με τις ΠΑΛΙΕΣ functions (set_own_fan_full_name, set_own_fan_private_details,
-- get_own_fan_private_details, 20260909100000): ΔΕΝ διαγράφονται (ασφαλές να
-- μείνουν), αλλά ο client ΔΕΝ τις καλεί πια — αντικαταστάθηκαν από ΜΙΑ
-- ενιαία φόρμα/RPC ζεύγος παρακάτω. Το full_name_enc (auto-sync από Google,
-- βλ. sync_own_fan_from_auth) παραμένει ΞΕΧΩΡΙΣΤΟ και ΑΝΕΠΗΡΕΑΣΤΟ — εξακολουθεί
-- να τροφοδοτεί το ConcertoBar avatar/greeting όπως πριν, ανεξάρτητο από τα
-- πραγματικά first_name/last_name που ορίζει τώρα ο fan μέσω της φόρμας.

alter table public.fan_private_details
  add column if not exists first_name_enc bytea,
  add column if not exists last_name_enc bytea,
  add column if not exists display_name_enc bytea,
  add column if not exists phone_enc bytea;

alter table public.fans
  add column if not exists favorite_genres text[] not null default '{}'::text[],
  add column if not exists favorite_tenant_id uuid references public.tenants(id) on delete set null;

-- Ρητή αποθήκευση ΟΛΟΚΛΗΡΗΣ της φόρμας σε ΜΙΑ atomic ενέργεια — auth.uid()
-- μόνο, καμία παράμετρος fan_id. Σηκώνει profile_customized=true (ίδια
-- λογική με πριν: μόλις ο fan αποθηκεύσει πραγματική αλλαγή, το login
-- σταματά να πατάει πάνω με ό,τι έρχεται αυτόματα από το Google).
create or replace function public.set_own_fan_full_profile(
  p_first_name text,
  p_last_name text,
  p_display_name text,
  p_phone text,
  p_date_of_birth date,
  p_city text,
  p_favorite_genres text[],
  p_favorite_tenant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  update public.fans
  set profile_customized = true,
      favorite_genres = coalesce(p_favorite_genres, '{}'::text[]),
      favorite_tenant_id = p_favorite_tenant_id
  where id = auth.uid();

  insert into public.fan_private_details (
    fan_id, first_name_enc, last_name_enc, display_name_enc, phone_enc,
    date_of_birth_enc, city_enc, updated_at
  )
  values (
    auth.uid(),
    case when p_first_name is not null and length(trim(p_first_name)) > 0 then pgp_sym_encrypt(p_first_name, v_key) else null end,
    case when p_last_name is not null and length(trim(p_last_name)) > 0 then pgp_sym_encrypt(p_last_name, v_key) else null end,
    case when p_display_name is not null and length(trim(p_display_name)) > 0 then pgp_sym_encrypt(p_display_name, v_key) else null end,
    case when p_phone is not null and length(trim(p_phone)) > 0 then pgp_sym_encrypt(p_phone, v_key) else null end,
    case when p_date_of_birth is not null then pgp_sym_encrypt(p_date_of_birth::text, v_key) else null end,
    case when p_city is not null and length(trim(p_city)) > 0 then pgp_sym_encrypt(p_city, v_key) else null end,
    now()
  )
  on conflict (fan_id) do update
  set first_name_enc = excluded.first_name_enc,
      last_name_enc = excluded.last_name_enc,
      display_name_enc = excluded.display_name_enc,
      phone_enc = excluded.phone_enc,
      date_of_birth_enc = excluded.date_of_birth_enc,
      city_enc = excluded.city_enc,
      updated_at = now();
end;
$$;

grant execute on function public.set_own_fan_full_profile(text, text, text, text, date, text, text[], uuid) to authenticated;
revoke execute on function public.set_own_fan_full_profile(text, text, text, text, date, text, text[], uuid) from anon;

-- Ρητή ανάγνωση ΟΛΟΚΛΗΡΗΣ της φόρμας σε ΜΙΑ κλήση — τροφοδοτεί το
-- "Επεξεργασία" panel του FanProfileRoute.jsx.
create or replace function public.get_own_fan_full_profile()
returns table (
  first_name text,
  last_name text,
  display_name text,
  phone text,
  date_of_birth date,
  city text,
  favorite_genres text[],
  favorite_tenant_id uuid
)
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';

  return query
  select
    case when d.first_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.first_name_enc, v_key) else null end,
    case when d.last_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.last_name_enc, v_key) else null end,
    case when d.display_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.display_name_enc, v_key) else null end,
    case when d.phone_enc is not null and v_key is not null then pgp_sym_decrypt(d.phone_enc, v_key) else null end,
    case when d.date_of_birth_enc is not null and v_key is not null then (pgp_sym_decrypt(d.date_of_birth_enc, v_key))::date else null end,
    case when d.city_enc is not null and v_key is not null then pgp_sym_decrypt(d.city_enc, v_key) else null end,
    f.favorite_genres,
    f.favorite_tenant_id
  from public.fans f
  left join public.fan_private_details d on d.fan_id = f.id
  where f.id = auth.uid();
end;
$$;

grant execute on function public.get_own_fan_full_profile() to authenticated;
revoke execute on function public.get_own_fan_full_profile() from anon;
