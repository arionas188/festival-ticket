-- Ρητή αναφορά χρήστη 19/9 (screenshot): μετά τη λήξη του (test) 1λεπτου
-- hold, το προϊόν έδειξε ΓΙΑ ΛΙΓΟ "Εξαντλημένο" (κόκκινο) πριν ξαναγίνει
-- "Διαθέσιμα" -- ενώ έπρεπε να πάει ΚΑΤΕΥΘΕΙΑΝ από "Μη διαθέσιμο" σε
-- "Διαθέσιμα", χωρίς ενδιάμεσο "Εξαντλημένο".
--
-- Αιτία: το get_active_stock_holds (migration 20260919090100) φιλτράριζε
-- με `o.expires_at > now()` -- δηλαδή "μόνο holds που ΔΕΝ έχουν ΑΚΟΜΑ
-- λήξει, βάσει ρολογιού". Το pg_cron job (expire_stale_orders) όμως τρέχει
-- ΜΟΝΟ μία φορά το λεπτό ('* * * * *') -- υπάρχει λοιπόν ένα φυσιολογικό
-- κενό (μέχρι ~60 δευτερόλεπτα) ΑΝΑΜΕΣΑ στη στιγμή που περνάει το
-- expires_at ΚΑΙ στη στιγμή που ο cron πραγματικά τρέχει και επαναφέρει
-- το stock. Μέσα σε αυτό το κενό: το order είναι ΑΚΟΜΑ status='pending'
-- (ο cron δεν έχει προλάβει), το stock_quantity είναι ΑΚΟΜΑ 0 (δεν έχει
-- ακόμα επιστραφεί) -- ΑΛΛΑ το get_active_stock_holds ΔΕΝ το μετρούσε
-- πια ως "ενεργό hold" (αφού expires_at < now() πλέον), οπότε το frontend
-- έβλεπε μηδέν stock ΧΩΡΙΣ καμία εξήγηση -> "Εξαντλημένο" λανθασμένα, για
-- όσο κράταγε το κενό μέχρι τον επόμενο cron tick.
--
-- Fix: αφαιρέθηκε η συνθήκη `expires_at > now()`. Όσο το order παραμένει
-- status='pending' (ανεξάρτητα αν το ρολόι λέει ότι "θα έπρεπε" να έχει
-- λήξει), το stock ΔΕΝ έχει ακόμα πραγματικά επιστραφεί -- άρα ΠΡΕΠΕΙ να
-- μετράει ως ενεργό hold. Ο cron αλλάζει status='pending' -> 'expired' ΚΑΙ
-- επαναφέρει το stock ΜΕΣΑ ΣΤΗΝ ΙΔΙΑ function call/transaction (βλ.
-- expire_stale_orders) -- άρα από τη στιγμή που ένα order πάψει να είναι
-- 'pending', το stock του ΕΙΝΑΙ ήδη σωστό/επαναφερμένο. Καμία πια ασυμφωνία.
create or replace function public.get_active_stock_holds(p_tenant_id uuid)
returns table(product_id uuid, variant_id uuid, held_qty bigint)
language sql
security definer
set search_path = public
stable
as $$
  select oi.product_id, oi.variant_id, sum(oi.quantity)::bigint as held_qty
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status = 'pending'
    and o.tenant_id = p_tenant_id
  group by oi.product_id, oi.variant_id;
$$;
