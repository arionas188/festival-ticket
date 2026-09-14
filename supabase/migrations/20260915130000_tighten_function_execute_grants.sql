-- Σφίξιμο των δικαιωμάτων εκτέλεσης (EXECUTE) στις 3 RPC συναρτήσεις ώστε
-- τα grants να αντανακλούν την πρόθεση, όχι μόνο τους εσωτερικούς ελέγχους.
--
-- Σήμερα (default συμπεριφορά Postgres στο CREATE FUNCTION) και οι 3
-- συναρτήσεις έχουν EXECUTE grant στον ψευδο-ρόλο PUBLIC, που σημαίνει ότι
-- ΚΑΘΕ ρόλος -- άρα και ο anon (αποσυνδεδεμένος επισκέπτης) -- μπορεί
-- τεχνικά να τις καλέσει, ανεξάρτητα από τυχόν ξεχωριστό revoke σε
-- συγκεκριμένο ρόλο. Στην πράξη αυτό δεν είναι εκμεταλλεύσιμο σήμερα:
--   - create_order_from_cart κάνει auth.uid() = p_fan_id εσωτερικά
--   - adjust_cart_quantity κάνει fan_id = auth.uid() στο WHERE του update
--   - expire_stale_orders δεν επιστρέφει/εκθέτει δεδομένα συγκεκριμένου fan
-- Παρόλα αυτά, τα grants πρέπει να ταιριάζουν με την πρόθεση (defense in
-- depth) -- ώστε να μην βασιζόμαστε ΜΟΝΟ στον εσωτερικό έλεγχο.
--
-- Δεν αγγίζει καθόλου δεδομένα, tables, ή RLS policies. Δεν αλλάζει καμία
-- υπαρκτή, νόμιμη συμπεριφορά για ήδη συνδεδεμένους (authenticated) fans.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_order_from_cart', 'expire_stale_orders', 'adjust_cart_quantity')
  loop
    -- Αφαίρεση από PUBLIC (άρα και από anon, που δεν είχε ποτέ ξεχωριστό
    -- λόγο να το χρειάζεται) και ρητά από anon για σαφήνεια.
    execute format('revoke execute on function %s from public', r.sig);
    execute format('revoke execute on function %s from anon', r.sig);

    -- create_order_from_cart / adjust_cart_quantity: καλούνται από το
    -- frontend για λογαριασμό συνδεδεμένου fan -> χρειάζονται authenticated.
    if r.proname in ('create_order_from_cart', 'adjust_cart_quantity') then
      execute format('grant execute on function %s to authenticated', r.sig);
    end if;

    -- expire_stale_orders: καμία επαναχορήγηση. Τρέχει μόνο μέσω pg_cron
    -- (εκτελείται ως ο owner της συνάρτησης, ανεξάρτητα από role grants) --
    -- δεν χρειάζεται να είναι καλέσιμη από authenticated/anon καθόλου.
  end loop;
end $$;
