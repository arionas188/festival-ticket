-- "Πλήρης διαγραφή προφίλ" (GDPR right to be forgotten, βλ. concerto-brief.md).
--
-- Ο client (anon key) δεν μπορεί να διαγράψει auth.users απευθείας — μόνο
-- service_role μπορεί, και δεν το εκθέτουμε ποτέ στο frontend (βλ. κανόνας
-- anon key vs service_role στο κύριο brief). Λύση: μια μικρή SECURITY
-- DEFINER function που τρέχει με αυξημένα δικαιώματα, αλλά επιτρέπει σε
-- κάθε χρήστη να διαγράψει ΜΟΝΟ τον εαυτό του (auth.uid()) — καθιερωμένο
-- Supabase pattern για self-service account deletion.
--
-- Επιβεβαιωμένο (7/9, pg_constraint query): fans -> auth.users, και
-- tenant_follows/favorites/cart_items -> fans, είναι ΟΛΑ ήδη
-- "on delete cascade". Άρα η διαγραφή του auth.users row καθαρίζει αυτόματα
-- ΟΛΑ τα σχετικά δεδομένα του fan — καμία επιπλέον χειροκίνητη διαγραφή
-- χρειάζεται μέσα στη function.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- Μόνο συνδεδεμένοι χρήστες μπορούν να την καλέσουν (RPC) — ανώνυμοι δεν έχουν
-- auth.uid(), οπότε το delete δεν θα ταίριαζε ούτως ή άλλως καμία γραμμή.
grant execute on function public.delete_own_account() to authenticated;
revoke execute on function public.delete_own_account() from anon;
