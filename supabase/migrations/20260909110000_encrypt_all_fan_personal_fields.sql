-- Επέκταση κρυπτογράφησης σε ΟΛΑ τα προσωπικά πεδία του fan (9/9):
-- email, full_name, avatar_url. Μέχρι τώρα ήταν plaintext στο fans table·
-- ίδιος μηχανισμός με το date_of_birth/city (βλ. 20260909100000) — Vault
-- key + pgcrypto, ΜΟΝΟ μέσα σε SECURITY DEFINER functions.
--
-- Απόφαση χρήστη μετά από ρητή ερώτηση: "Ναι, όλα τα προσωπικά πεδία".
-- ΣΗΜΑΝΤΙΚΟ (να το θυμάσαι/το εξηγήσαμε στον χρήστη): αυτό προστατεύει
-- από EXTERNAL leak/hack (π.χ. leaked anon key, RLS bug) — ΔΕΝ κρύβει τα
-- δεδομένα από τον admin του project, γιατί ο admin ελέγχει το Vault key
-- και το SQL editor. Το auth.users table του ίδιου του Supabase Auth
-- (email/name/avatar από Google OAuth) παραμένει plaintext ό,τι κι αν
-- κάνουμε εδώ — το διαχειρίζεται το Supabase, όχι εμείς, και είναι
-- απαραίτητο plaintext για να δουλέψει το login. Ορατό μόνο από
-- Authentication → Users στο Supabase dashboard, στον owner/admin του
-- project — ίδιο επίπεδο πρόσβασης που έχει έτσι κι αλλιώς.
create extension if not exists pgcrypto;

alter table public.fan_private_details
  add column if not exists email_enc bytea,
  add column if not exists full_name_enc bytea,
  add column if not exists avatar_url_enc bytea;

-- Backfill: ό,τι υπάρχει ήδη plaintext στο fans γίνεται encrypted εδώ,
-- ΠΡΙΝ διαγραφούν οι παλιές στήλες. Τρέχει μία φορά, με τον ίδιο τρόπο
-- που δημιουργήθηκε το ίδιο το Vault key (top-level DO block, όχι μέσα σε
-- function) — ασφαλές να ξανατρέξει (ON CONFLICT DO UPDATE).
do $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found — τρέξε πρώτα το migration 20260909100000';
  end if;

  insert into public.fan_private_details (fan_id, email_enc, full_name_enc, avatar_url_enc, updated_at)
  select
    f.id,
    case when f.email is not null then pgp_sym_encrypt(f.email, v_key) else null end,
    case when f.full_name is not null then pgp_sym_encrypt(f.full_name, v_key) else null end,
    case when f.avatar_url is not null then pgp_sym_encrypt(f.avatar_url, v_key) else null end,
    now()
  from public.fans f
  on conflict (fan_id) do update
  set email_enc = excluded.email_enc,
      full_name_enc = excluded.full_name_enc,
      avatar_url_enc = excluded.avatar_url_enc,
      updated_at = now();
end $$;

-- Οι παλιές plaintext στήλες φεύγουν οριστικά — από εδώ και πέρα το μόνο
-- μέρος που τα δεδομένα αυτά υπάρχουν (εκτός auth.users, βλ. πάνω) είναι
-- κρυπτογραφημένα στο fan_private_details.
alter table public.fans drop column if exists email;
alter table public.fans drop column if exists full_name;
alter table public.fans drop column if exists avatar_url;

-- Αντικαθιστά το client-side upsert του syncFanFromAuth.js. auth.uid()
-- μόνο, καμία παράμετρος fan_id — δομικά αδύνατο να γράψεις πάνω σε
-- άλλον fan. Ίδια λογική με πριν: αν ο fan έχει κάνει profile_customized,
-- ΔΕΝ ξαναγράφουμε full_name/avatar_url πάνω από τη δική του αλλαγή σε
-- κάθε login — μόνο το email συγχρονίζεται πάντα (μπορεί να αλλάξει στο
-- Google του χρήστη).
create or replace function public.sync_own_fan_from_auth(
  p_email text,
  p_full_name text,
  p_avatar_url text
)
returns void
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_key text;
  v_customized boolean;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  insert into public.fans (id)
  values (auth.uid())
  on conflict (id) do nothing;

  select profile_customized into v_customized from public.fans where id = auth.uid();

  if coalesce(v_customized, false) then
    insert into public.fan_private_details (fan_id, email_enc, updated_at)
    values (auth.uid(), case when p_email is not null then pgp_sym_encrypt(p_email, v_key) else null end, now())
    on conflict (fan_id) do update
    set email_enc = excluded.email_enc,
        updated_at = now();
  else
    insert into public.fan_private_details (fan_id, email_enc, full_name_enc, avatar_url_enc, updated_at)
    values (
      auth.uid(),
      case when p_email is not null then pgp_sym_encrypt(p_email, v_key) else null end,
      case when p_full_name is not null then pgp_sym_encrypt(p_full_name, v_key) else null end,
      case when p_avatar_url is not null then pgp_sym_encrypt(p_avatar_url, v_key) else null end,
      now()
    )
    on conflict (fan_id) do update
    set email_enc = excluded.email_enc,
        full_name_enc = excluded.full_name_enc,
        avatar_url_enc = excluded.avatar_url_enc,
        updated_at = now();
  end if;
end;
$$;

grant execute on function public.sync_own_fan_from_auth(text, text, text) to authenticated;
revoke execute on function public.sync_own_fan_from_auth(text, text, text) from anon;

-- Αντικαθιστά το client-side select του useFanAccount.js. Ίδιο σχήμα
-- επιστροφής (full_name, avatar_url, profile_customized) ώστε το
-- ConcertoBar.jsx/FanProfileRoute.jsx/FanIdCard.jsx να ΜΗΝ χρειάζονται
-- καμία αλλαγή. left join γιατί στο ΠΡΩΤΟ login μπορεί να μην υπάρχει
-- ακόμα γραμμή στο fan_private_details (race με sync_own_fan_from_auth).
create or replace function public.get_own_fan_identity()
returns table (full_name text, avatar_url text, email text, profile_customized boolean)
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
    case when d.full_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.full_name_enc, v_key) else null end,
    case when d.avatar_url_enc is not null and v_key is not null then pgp_sym_decrypt(d.avatar_url_enc, v_key) else null end,
    case when d.email_enc is not null and v_key is not null then pgp_sym_decrypt(d.email_enc, v_key) else null end,
    f.profile_customized
  from public.fans f
  left join public.fan_private_details d on d.fan_id = f.id
  where f.id = auth.uid();
end;
$$;

grant execute on function public.get_own_fan_identity() to authenticated;
revoke execute on function public.get_own_fan_identity() from anon;

-- Αντικαθιστά το client-side update του useUpdateFanProfile (useFanAccount.js).
create or replace function public.set_own_fan_full_name(p_full_name text)
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

  update public.fans set profile_customized = true where id = auth.uid();

  insert into public.fan_private_details (fan_id, full_name_enc, updated_at)
  values (auth.uid(), pgp_sym_encrypt(p_full_name, v_key), now())
  on conflict (fan_id) do update
  set full_name_enc = excluded.full_name_enc,
      updated_at = now();
end;
$$;

grant execute on function public.set_own_fan_full_name(text) to authenticated;
revoke execute on function public.set_own_fan_full_name(text) from anon;
