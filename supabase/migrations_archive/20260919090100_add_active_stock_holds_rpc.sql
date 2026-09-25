-- Ρητό αίτημα χρήστη 19/9 (screenshot -- προϊόν "Εξαντλημένο" ενώ στην
-- ουσία είναι απλά δεσμευμένο μέσα σε ενεργό hold κάποιου άλλου fan που
-- βρίσκεται στο 10λεπτο/1λεπτο παράθυρο να ολοκληρώσει την πληρωμή του):
-- "μπορούμε να γράφουμε προσωρινά 'μη διαθέσιμο' και αν όντως γίνει η
-- πληρωμή να γράφει 'εξαντλημένο';"
--
-- Το frontend ΔΕΝ μπορεί να διαβάσει απευθείας orders/order_items άλλων
-- fans (RLS: "Fans can view own orders" -- auth.uid() = fan_id) -- ούτε θα
-- έπρεπε, θα εξέθετε ποιος/πόσα αγόρασε. Αυτό το SECURITY DEFINER RPC
-- εκθέτει ΜΟΝΟ ένα ασφαλές, ανώνυμο άθροισμα (product_id / variant_id /
-- held_qty) -- ΚΑΜΙΑ αναφορά σε fan_id/order_id/ποιος -- ώστε το frontend
-- να μπορεί να διαφοροποιήσει:
--   - stock_quantity <= 0 ΚΑΙ υπάρχει ενεργό (pending, μη ληγμένο) hold
--     γι' αυτό το προϊόν/variant -> "Μη διαθέσιμο" (προσωρινό, μπορεί να
--     επιστρέψει όταν λήξει/ακυρωθεί το hold -- δεν έχει ΠΡΑΓΜΑΤΙΚΑ
--     πουληθεί ακόμα, αφού το Stripe integration δεν υπάρχει ακόμα και
--     ΚΑΝΕΝΑ order δεν φτάνει σε status='completed' σήμερα).
--   - stock_quantity <= 0 ΚΑΙ ΚΑΝΕΝΑ ενεργό hold -> "Εξαντλημένο"
--     (πραγματικό/μόνιμο μηδέν -- π.χ. χειροκίνητη αλλαγή στο Supabase
--     dashboard, ή στο μέλλον: πραγματικά ολοκληρωμένη πληρωμή).
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
    and o.expires_at > now()
    and o.tenant_id = p_tenant_id
  group by oi.product_id, oi.variant_id;
$$;

-- Δημόσιο -- πρέπει να δουλεύει ΚΑΙ για αποσυνδεδεμένο επισκέπτη, ίδιο με
-- το products/product_variants SELECT (το merch store είναι δημόσιο
-- browsable, βλ. concerto-brief.md). Δεν εκθέτει τίποτα ευαίσθητο -- μόνο
-- αθροίσματα ποσότητας ανά προϊόν/variant.
grant execute on function public.get_active_stock_holds(uuid) to anon, authenticated;
