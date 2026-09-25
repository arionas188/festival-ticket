-- BUG FIX (15/9), ζωντανά reproduced από τον χρήστη (409 Conflict στο
-- Network tab, live στο http://strafi.concerto.gr:5173): η προσθήκη ΕΝΟΣ
-- δεύτερου μεγέθους (π.χ. Medium) του ΙΔΙΟΥ προϊόντος στο καλάθι, ενώ ήδη
-- υπήρχε γραμμή για ΑΛΛΟ μέγεθος (Small) του ίδιου προϊόντος, σκάει με
-- 409 στο POST /rest/v1/cart_items.
--
-- Ρίζα του προβλήματος: το πίνακας cart_items δημιουργήθηκε ΠΡΙΝ το
-- variant_id υπάρξει καν (απευθείας στο Supabase dashboard, εκτός
-- tracked migrations -- βλ. 20260908130000_add_tenant_scoping_favorites_cart.sql
-- comment). Τότε ήταν λογικό να υπάρχει ΕΝΑ unique constraint που
-- επέτρεπε ΤΟ ΠΟΛΥ ΜΙΑ γραμμή καλαθιού ανά (fan_id, product_id[, tenant_id])
-- -- κάθε προϊόν ΜΙΑ γραμμή, δεν υπήρχαν μεγέθη. Το migration
-- 20260915120000_add_product_variants.sql πρόσθεσε το variant_id ΣΤΗ
-- ΣΤΗΛΗ αλλά ΔΕΝ άγγιξε το παλιό constraint -- οπότε αυτό συνέχισε να
-- μπλοκάρει ΔΕΥΤΕΡΗ γραμμή για το ΙΔΙΟ προϊόν, ΑΚΟΜΑ και με διαφορετικό
-- variant_id.
--
-- Fix, σε δύο βήματα:
-- 1) Αφαιρούμε ΔΥΝΑΜΙΚΑ (δεν ξέρουμε το ακριβές όνομα -- δημιουργήθηκε
--    εκτός migrations) οποιοδήποτε UNIQUE constraint/index στο cart_items
--    που περιλαμβάνει product_id αλλά ΟΧΙ variant_id.
-- 2) Το αντικαθιστούμε με ένα νέο unique constraint που περιλαμβάνει ΚΑΙ
--    το variant_id -- ίδια προστασία από διπλές γραμμές (DB-level safety
--    net, πέρα από το ήδη υπάρχον app-level "existing" matching στο
--    useCart.js), αλλά πλέον σωστά ΑΝΑ ΜΕΓΕΘΟΣ. ΣΗΜΕΙΩΣΗ: σε Postgres, δύο
--    NULL values ΔΕΝ θεωρούνται ίσες σε unique constraint -- άρα προϊόντα
--    ΧΩΡΙΣ μέγεθος (variant_id IS NULL) δεν προστατεύονται από αυτό το
--    constraint στο επίπεδο βάσης· ίδιο ακριβώς ρίσκο με πριν (το
--    app-level check στο useCart.js ήταν ΠΑΝΤΑ η πραγματική προστασία σε
--    αυτή την περίπτωση, δεν άλλαξε τίποτα εκεί).

do $$
declare
  con record;
begin
  -- Named unique CONSTRAINTs
  for con in
    select c.conname
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'cart_items'
      and c.contype = 'u'
      and exists (
        select 1 from unnest(c.conkey) as colnum
        join pg_attribute att on att.attrelid = c.conrelid and att.attnum = colnum
        where att.attname = 'product_id'
      )
      and not exists (
        select 1 from unnest(c.conkey) as colnum
        join pg_attribute att on att.attrelid = c.conrelid and att.attnum = colnum
        where att.attname = 'variant_id'
      )
  loop
    execute format('alter table public.cart_items drop constraint %I', con.conname);
  end loop;

  -- Unique INDEXes χωρίς named constraint (κάποια εργαλεία/UI τα φτιάχνουν
  -- έτσι απευθείας).
  for con in
    select ic.relname as indexname
    from pg_index idx
    join pg_class ic on ic.oid = idx.indexrelid
    join pg_class tc on tc.oid = idx.indrelid
    join pg_namespace nsp on nsp.oid = tc.relnamespace
    where nsp.nspname = 'public'
      and tc.relname = 'cart_items'
      and idx.indisunique
      and not exists (select 1 from pg_constraint c where c.conindid = idx.indexrelid)
      and exists (
        select 1 from unnest(idx.indkey::int2[]) as colnum
        join pg_attribute att on att.attrelid = tc.oid and att.attnum = colnum
        where att.attname = 'product_id'
      )
      and not exists (
        select 1 from unnest(idx.indkey::int2[]) as colnum
        join pg_attribute att on att.attrelid = tc.oid and att.attnum = colnum
        where att.attname = 'variant_id'
      )
  loop
    execute format('drop index public.%I', con.indexname);
  end loop;
end $$;

alter table public.cart_items
  add constraint cart_items_fan_tenant_product_variant_key
  unique (fan_id, tenant_id, product_id, variant_id);
