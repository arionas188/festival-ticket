-- Βελτιώσεις πλήρους φόρμας προφίλ (9/9, β' πέρασμα):
-- 1) "Αγαπημένο tenant" -> "Αγαπημένα tenants" (πολλαπλή επιλογή).
-- 2) Display name γίνεται ΑΠΛΟ (ΟΧΙ πια κρυπτογραφημένο) πεδίο — ρητή
--    απόφαση χρήστη: ήθελε PRAGMATIKO unique constraint στη βάση (όχι
--    decrypt-and-compare function), για να είναι στιγμιαίος ο έλεγχος
--    ακόμα κι αν γίνει μεγάλη προσέλευση fans ταυτόχρονα. Το migration
--    20260909120000 είχε προσθέσει display_name_enc (κρυπτογραφημένο,
--    στο fan_private_details) — ΕΔΩ αναιρείται: display_name μετακομίζει
--    ΑΠΛΟ στο fans, με πραγματικό unique index. Το όνομα/επίθετο/τηλέφωνο/
--    ημ. γέννησης/πόλη ΠΑΡΑΜΕΝΟΥΝ κρυπτογραφημένα, ανεπηρέαστα.

alter table public.fans
  add column if not exists favorite_tenant_ids uuid[] not null default '{}'::uuid[];

update public.fans
set favorite_tenant_ids = array[favorite_tenant_id]
where favorite_tenant_id is not null
  and favorite_tenant_ids = '{}'::uuid[];

alter table public.fans drop column if exists favorite_tenant_id;

-- Display name: ΑΠΛΟ πεδίο στο fans (όχι πια encrypted στο
-- fan_private_details) — case-insensitive πραγματικό unique index στη
-- βάση (η ίδια η Postgres εγγυάται τη μοναδικότητα, ΚΑΝΕΝΑ race condition
-- δυνατό πλέον, χωρίς manual "check πριν το insert" λογική).
alter table public.fans add column if not exists display_name text;

create unique index if not exists fans_display_name_lower_idx
  on public.fans (lower(display_name))
  where display_name is not null;

-- Το encrypted display_name_enc (από το 20260909120000) δεν χρειάζεται πια.
alter table public.fan_private_details drop column if exists display_name_enc;

-- Αλλάζουν signature (return type / παράμετροι) — DROP πρώτα.
drop function if exists public.get_own_fan_full_profile();
drop function if exists public.set_own_fan_full_profile(text, text, text, text, date, text, text[], uuid);
drop function if exists public.check_own_display_name_available(text);

-- Γρήγορος, στιγμιαίος έλεγχος διαθεσιμότητας — απλό indexed lookup στο
-- fans (RLS στο fans περιορίζει τον client σε ΜΟΝΟ τη δική του γραμμή σε
-- ένα κανονικό SELECT, γι' αυτό χρειάζεται SECURITY DEFINER εδώ — αλλά
-- ΚΑΜΙΑ κρυπτογράφηση/Vault εμπλέκεται πια, γρήγορο ακόμα και με χιλιάδες
-- fans ταυτόχρονα, γιατί χρησιμοποιεί το unique index από πάνω).
create or replace function public.check_own_display_name_available(p_display_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when trim(coalesce(p_display_name, '')) = '' then true
    else not exists (
      select 1 from public.fans
      where lower(display_name) = lower(trim(p_display_name))
        and id <> auth.uid()
    )
  end;
$$;

grant execute on function public.check_own_display_name_available(text) to authenticated;
revoke execute on function public.check_own_display_name_available(text) from anon;

create or replace function public.get_own_fan_full_profile()
returns table (
  first_name text,
  last_name text,
  display_name text,
  phone text,
  date_of_birth date,
  city text,
  favorite_genres text[],
  favorite_tenant_ids uuid[]
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
    f.display_name,
    case when d.phone_enc is not null and v_key is not null then pgp_sym_decrypt(d.phone_enc, v_key) else null end,
    case when d.date_of_birth_enc is not null and v_key is not null then (pgp_sym_decrypt(d.date_of_birth_enc, v_key))::date else null end,
    case when d.city_enc is not null and v_key is not null then pgp_sym_decrypt(d.city_enc, v_key) else null end,
    f.favorite_genres,
    f.favorite_tenant_ids
  from public.fans f
  left join public.fan_private_details d on d.fan_id = f.id
  where f.id = auth.uid();
end;
$$;

grant execute on function public.get_own_fan_full_profile() to authenticated;
revoke execute on function public.get_own_fan_full_profile() from anon;

-- ΚΑΜΙΑ χειροκίνητη "check if exists" λογική πια εδώ (αφαιρέθηκε, ρητό
-- αίτημα χρήστη: "αφαίρεσε περιττές συναρτήσεις") — το ίδιο το unique
-- index στο fans εγγυάται τη μοναδικότητα. Αν συμβεί race condition (δύο
-- ταυτόχρονα saves με το ίδιο display name), η update παρακάτω απλά
-- αποτυγχάνει με unique_violation (SQLSTATE 23505) — ο client το πιάνει
-- και δείχνει μήνυμα (βλ. FanProfileRoute.jsx).
create or replace function public.set_own_fan_full_profile(
  p_first_name text,
  p_last_name text,
  p_display_name text,
  p_phone text,
  p_date_of_birth date,
  p_city text,
  p_favorite_genres text[],
  p_favorite_tenant_ids uuid[]
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
      display_name = nullif(trim(coalesce(p_display_name, '')), ''),
      favorite_genres = coalesce(p_favorite_genres, '{}'::text[]),
      favorite_tenant_ids = coalesce(p_favorite_tenant_ids, '{}'::uuid[])
  where id = auth.uid();

  insert into public.fan_private_details (
    fan_id, first_name_enc, last_name_enc, phone_enc,
    date_of_birth_enc, city_enc, updated_at
  )
  values (
    auth.uid(),
    case when p_first_name is not null and length(trim(p_first_name)) > 0 then pgp_sym_encrypt(p_first_name, v_key) else null end,
    case when p_last_name is not null and length(trim(p_last_name)) > 0 then pgp_sym_encrypt(p_last_name, v_key) else null end,
    case when p_phone is not null and length(trim(p_phone)) > 0 then pgp_sym_encrypt(p_phone, v_key) else null end,
    case when p_date_of_birth is not null then pgp_sym_encrypt(p_date_of_birth::text, v_key) else null end,
    case when p_city is not null and length(trim(p_city)) > 0 then pgp_sym_encrypt(p_city, v_key) else null end,
    now()
  )
  on conflict (fan_id) do update
  set first_name_enc = excluded.first_name_enc,
      last_name_enc = excluded.last_name_enc,
      phone_enc = excluded.phone_enc,
      date_of_birth_enc = excluded.date_of_birth_enc,
      city_enc = excluded.city_enc,
      updated_at = now();
end;
$$;

grant execute on function public.set_own_fan_full_profile(text, text, text, text, date, text, text[], uuid[]) to authenticated;
revoke execute on function public.set_own_fan_full_profile(text, text, text, text, date, text, text[], uuid[]) from anon;
