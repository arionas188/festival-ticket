-- Follow-up του 20260915130000_tighten_function_execute_grants.sql.
--
-- Το query που έτρεξε ο χρήστης μετά το προηγούμενο migration έδειξε ότι το
-- expire_stale_orders() είχε ακόμα EXECUTE grant σε authenticated (πιθανόν
-- από τα default privileges του Supabase όταν δημιουργήθηκε η συνάρτηση) --
-- το προηγούμενο migration αφαίρεσε μόνο public/anon, όχι αυτό ειδικά.
--
-- Η πρόθεση ήταν να μην είναι καλέσιμη ΚΑΘΟΛΟΥ από το frontend -- τρέχει
-- μόνο μέσω pg_cron (εκτελείται ως owner, ανεξάρτητα από role grants).
-- Δεν ήταν ενεργό ρίσκο (δεν εκθέτει δεδομένα συγκεκριμένου fan), απλή
-- τακτοποίηση ώστε τα grants να ταιριάζουν πλήρως με την πρόθεση.

revoke execute on function public.expire_stale_orders() from authenticated;
