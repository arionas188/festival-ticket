-- FIX (8/9): το FanIdCard.jsx χρειάζεται να μετρήσει ΠΟΣΟΙ fans γράφτηκαν
-- πριν από τον τρέχοντα (created_at <=), αλλά το fans table έχει RLS σαν
-- όλα τα υπόλοιπα σε αυτό το project (μόνο η δική σου γραμμή ορατή μέσω
-- anon key) — ένα απλό cross-row select/count από τον client θα γύριζε
-- πάντα 1 (μόνο τη δική σου γραμμή), δηλαδή "00001" σε ΚΑΘΕ fan. Ίδιο
-- pattern με το delete_own_account (βλ. 20260907120000): μικρή SECURITY
-- DEFINER function, self-scoped μέσω auth.uid() — τρέχει με αυξημένα
-- δικαιώματα ώστε να δει όλες τις γραμμές ΜΟΝΟ για να μετρήσει, χωρίς να
-- επιστρέφει ποτέ δεδομένα άλλου fan στον client (μόνο έναν ακέραιο).
create or replace function public.get_own_fan_id_number()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  my_created_at timestamptz;
  result integer;
begin
  select created_at into my_created_at from public.fans where id = auth.uid();
  if my_created_at is null then
    return null;
  end if;

  select count(*) into result from public.fans where created_at <= my_created_at;
  return result;
end;
$$;

grant execute on function public.get_own_fan_id_number() to authenticated;
revoke execute on function public.get_own_fan_id_number() from anon;
