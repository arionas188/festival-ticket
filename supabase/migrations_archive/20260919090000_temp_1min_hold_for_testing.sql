-- ΠΡΟΣΩΡΙΝΗ αλλαγή, ΜΟΝΟ για δοκιμή (ρητό αίτημα χρήστη 19/9): το hold
-- κάθε νέας παραγγελίας μειώνεται από 10 λεπτά σε 1 λεπτό, ώστε ο χρήστης
-- να μπορεί να δει ζωντανά πώς επιστρέφει η διαθεσιμότητα μόλις λήξει το
-- hold -- μαζί με το νέο "Μη διαθέσιμο" vs "Εξαντλημένο" label (βλ.
-- migration 20260919090100_add_active_stock_holds_rpc.sql, ίδια συζήτηση).
-- ΚΑΜΙΑ άλλη αλλαγή στη λογική -- ίδιο ΑΚΡΙΒΩΣ function body με το
-- migration 20260919071300_add_order_vat_breakdown.sql, μόνο
-- interval '10 minutes' -> interval '1 minute'. Το pg_cron job
-- (expire-stale-orders) ήδη τρέχει κάθε λεπτό ('* * * * *', βλ. migration
-- 20260914150000) -- αρκετά συχνά ώστε να πιάνει και 1λεπτα holds χωρίς
-- αλλαγή στο ίδιο το cron schedule.
--
-- ⚠️ ΝΑ ΘΥΜΑΣΑΙ: αυτό ΠΡΕΠΕΙ να γυρίσει πίσω σε 10 λεπτά πριν η σελίδα
-- πάει σε πραγματικούς χρήστες/παραγγελίες -- 1 λεπτό είναι πολύ λίγο για
-- να προλάβει κανείς να πληρώσει σε πραγματικές συνθήκες. Θα σου το
-- θυμίσω όταν ξαναμιλήσουμε για αυτό το κομμάτι (Stripe integration).

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
  values (p_tenant_id, p_fan_id, 'pending', v_subtotal, v_net, v_vat, now() + interval '1 minute')
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
