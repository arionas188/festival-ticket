-- Ασφαλής αποθήκευση ευαίσθητων πεδίων προφίλ (8/9→9/9): ημερομηνία
-- γέννησης + πόλη ΜΑΖΙ μπορούν να βοηθήσουν στην αναγνώριση ενός
-- συγκεκριμένου ατόμου, οπότε πάνε σε ΞΕΧΩΡΙΣΤΟ table, ΚΡΥΠΤΟΓΡΑΦΗΜΕΝΑ
-- (όχι απλό RLS όπως το υπόλοιπο project) — απόφαση χρήστη μετά από
-- ρητή συζήτηση GDPR/ασφάλειας, επιλέχθηκε ρητά η επιλογή "encryption
-- για τα ευαίσθητα πεδία" (tier 2 σε ιεράρχηση 5 επιλογών).
--
-- Επίθετο/display name ΔΕΝ μπαίνουν εδώ — παραμένουν σκόπιμα plain
-- (απλή, συνηθισμένη PII, ίδιο επίπεδο με το ήδη υπάρχον fans.full_name),
-- τα ακριβή τους πεδία/στήλες θα οριστούν σε άλλο πέρασμα.
--
-- Μηχανισμός: Supabase Vault (vault.create_secret/vault.decrypted_secrets)
-- κρατάει το symmetric encryption key — ΠΟΤΕ ορατό σε plain SQL, μόνο
-- μέσα σε SECURITY DEFINER functions. pgcrypto (pgp_sym_encrypt/decrypt)
-- κάνει το actual encrypt/decrypt. Αν "schema vault does not exist":
-- Database → Extensions → ενεργοποίησε το "vault" από το Supabase dashboard
-- πρώτα, μετά ξανατρέξε αυτό το migration.
create extension if not exists pgcrypto;

-- Το key δημιουργείται ΜΙΑ φορά, τυχαίο (κανείς, ούτε εγώ, δεν το βλέπει
-- ποτέ σε plaintext εκτός βάσης) — ασφαλές να ξανατρέξει το migration,
-- δεν αντικαθιστά υπάρχον key.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'fan_pii_encryption_key') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'fan_pii_encryption_key',
      'Symmetric key: encrypt/decrypt fan_private_details (ημ. γέννησης, πόλη)'
    );
  end if;
end $$;

create table if not exists public.fan_private_details (
  fan_id uuid primary key references public.fans(id) on delete cascade,
  date_of_birth_enc bytea,
  city_enc bytea,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fan_private_details enable row level security;

-- Defense-in-depth: ακόμα κι αν κάποιος πάρει πρόσβαση με το anon key,
-- βλέπει μόνο τη ΔΙΚΗ ΤΟΥ γραμμή, ΚΑΙ αυτή κρυπτογραφημένη (bytea, όχι
-- αναγνώσιμο κείμενο) — δύο ανεξάρτητα επίπεδα προστασίας.
create policy "Fans can view own private details"
on public.fan_private_details for select
using (auth.uid() = fan_id);

create policy "Fans can insert own private details"
on public.fan_private_details for insert
with check (auth.uid() = fan_id);

create policy "Fans can update own private details"
on public.fan_private_details for update
using (auth.uid() = fan_id);

create policy "Fans can delete own private details"
on public.fan_private_details for delete
using (auth.uid() = fan_id);

-- Ρητή αποθήκευση (μόνο για τον εαυτό σου, auth.uid() — καμία παράμετρος
-- fan_id από τον client, ώστε να είναι δομικά αδύνατο να γράψεις πάνω σε
-- άλλον fan). Encryption γίνεται server-side, το plaintext ΔΕΝ φεύγει
-- ποτέ σε log/response.
create or replace function public.set_own_fan_private_details(
  p_date_of_birth date,
  p_city text
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

  insert into public.fan_private_details (fan_id, date_of_birth_enc, city_enc, updated_at)
  values (
    auth.uid(),
    case when p_date_of_birth is not null then pgp_sym_encrypt(p_date_of_birth::text, v_key) else null end,
    case when p_city is not null and length(trim(p_city)) > 0 then pgp_sym_encrypt(p_city, v_key) else null end,
    now()
  )
  on conflict (fan_id) do update
  set date_of_birth_enc = excluded.date_of_birth_enc,
      city_enc = excluded.city_enc,
      updated_at = now();
end;
$$;

grant execute on function public.set_own_fan_private_details(date, text) to authenticated;
revoke execute on function public.set_own_fan_private_details(date, text) from anon;

-- Ρητή ανάγνωση (μόνο για τον εαυτό σου) — επιστρέφει ΗΔΗ αποκρυπτογραφημένα
-- πεδία, ΜΟΝΟ στο δικό σου request/response, ποτέ αποθηκευμένα plaintext
-- πουθενά.
create or replace function public.get_own_fan_private_details()
returns table (date_of_birth date, city text)
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    return;
  end if;

  return query
  select
    case when d.date_of_birth_enc is not null then (pgp_sym_decrypt(d.date_of_birth_enc, v_key))::date else null end,
    case when d.city_enc is not null then pgp_sym_decrypt(d.city_enc, v_key) else null end
  from public.fan_private_details d
  where d.fan_id = auth.uid();
end;
$$;

grant execute on function public.get_own_fan_private_details() to authenticated;
revoke execute on function public.get_own_fan_private_details() from anon;
