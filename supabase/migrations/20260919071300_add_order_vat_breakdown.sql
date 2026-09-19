-- Το καλάθι (CartRoute.jsx, 18/9) δείχνει ήδη Καθαρή αξία/ΦΠΑ 24%/Τελικό
-- σύνολο — αλλά μόνο στην οθόνη (lib/pricing.js). Το order.subtotal στη
-- βάση ήταν μέχρι τώρα ένας μονολιθικός αριθμός, χωρίς ανάλυση ΦΠΑ. 19/9,
-- ρητό αίτημα χρήστη: να αποθηκεύεται η ίδια ανάλυση και στη βάση, ώστε η
-- σελίδα παραγγελίας (OrderSummaryRoute.jsx) να δείχνει το ίδιο πράγμα με
-- το καλάθι, και για λογιστικούς λόγους (κάθε παραγγελία χρειάζεται
-- καταγεγραμμένη καθαρή αξία/ΦΠΑ ξεχωριστά, όχι μόνο ένα σύνολο).
--
-- ΡΗΤΑ ΕΚΤΟΣ SCOPE (ρητό αίτημα χρήστη, ίδια συζήτηση 19/9): έξοδα
-- αποστολής. Το πραγματικό κόστος δεν είναι ακόμα γνωστό — εκκρεμεί
-- συνεργασία με courier (BOX NOW/Skroutz Point, βλ. concerto-brief.md).
-- ΔΕΝ προστίθεται καμία στήλη/λογική αποστολής εδώ, σκόπιμα, ώστε να μην
-- "κλειδώσουμε" στη βάση έναν αριθμό που θα αλλάξει όταν κλείσει η
-- συνεργασία. Το net_amount/vat_amount παρακάτω παραμένουν ΧΩΡΙΣ
-- αποστολή — ο fan θα εξακολουθεί να βλέπει διαφορετικό "Σύνολο" εδώ
-- (χωρίς τα 3€) απ' ό,τι στο καλάθι (με τα 3€), μέχρι να προστεθεί η
-- αποστολή και στα δύο μαζί, μια φορά, όταν έχουμε πραγματικό αριθμό.
--
-- Σημείωση: net_amount + vat_amount == subtotal πάντα (οι τιμές
-- προϊόντων είναι ήδη ΦΠΑ-συμπεριλαμβανόμενες) — αυτό ΔΕΝ αλλάζει το
-- ποσό που θα χρεωθεί τελικά, μόνο προσθέτει την ανάλυση.
alter table public.orders add column net_amount numeric;
alter table public.orders add column vat_amount numeric;

create or replace function public.create_order_from_cart(p_fan_id uuid, p_tenant_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_net numeric;
  v_vat numeric;
  v_line record;
  v_updated_rows integer;
  -- ΙΔΙΟ rate με apps/tenant-site/src/lib/pricing.js (VAT_RATE) — δύο
  -- ξεχωριστές υλοποιήσεις (JS για την οθόνη του καλαθιού, SQL για την
  -- αποθήκευση της παραγγελίας) πρέπει να μείνουν συγχρονισμένες αν
  -- αλλάξει ποτέ το ΦΠΑ.
  v_vat_rate constant numeric := 0.24;
begin
  if auth.uid() != p_fan_id then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1 from public.cart_items where fan_id = p_fan_id and tenant_id = p_tenant_id
  ) then
    raise exception 'empty_cart';
  end if;

  select coalesce(sum(p.price * c.quantity), 0)
  into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.fan_id = p_fan_id and c.tenant_id = p_tenant_id;

  v_net := v_subtotal / (1 + v_vat_rate);
  v_vat := v_subtotal - v_net;

  insert into public.orders (tenant_id, fan_id, status, subtotal, net_amount, vat_amount, expires_at)
  values (p_tenant_id, p_fan_id, 'pending', v_subtotal, v_net, v_vat, now() + interval '10 minutes')
  returning id into v_order_id;

  for v_line in
    select
      c.product_id, c.variant_id, c.quantity, p.name, p.price,
      v.size as variant_size
    from public.cart_items c
    join public.products p on p.id = c.product_id
    left join public.product_variants v on v.id = c.variant_id
    where c.fan_id = p_fan_id and c.tenant_id = p_tenant_id
  loop
    if v_line.variant_id is not null then
      update public.product_variants
      set stock_quantity = stock_quantity - v_line.quantity
      where id = v_line.variant_id and stock_quantity >= v_line.quantity;
    else
      update public.products
      set stock_quantity = stock_quantity - v_line.quantity
      where id = v_line.product_id and stock_quantity >= v_line.quantity;
    end if;

    get diagnostics v_updated_rows = row_count;
    if v_updated_rows = 0 then
      raise exception 'insufficient_stock: %', v_line.name;
    end if;

    insert into public.order_items (order_id, product_id, variant_id, size_label, quantity, unit_price)
    values (v_order_id, v_line.product_id, v_line.variant_id, v_line.variant_size, v_line.quantity, v_line.price);
  end loop;

  delete from public.cart_items where fan_id = p_fan_id and tenant_id = p_tenant_id;

  return v_order_id;
end;
$$;
