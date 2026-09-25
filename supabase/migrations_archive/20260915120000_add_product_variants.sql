-- Stock ανά μέγεθος για ρούχα (15/9, ρητό αίτημα χρήστη, μετά από bug report
-- ότι το quantity stepper δεν είχε όριο σε σχέση με το πραγματικό stock).
-- Μέχρι τώρα το stock ήταν ΜΟΝΟ συνολικό ανά προϊόν (products.stock_quantity)
-- — αδύνατο να ξέρουμε πόσα Small/Medium/Large/XL υπάρχουν ξεχωριστά, τα
-- κουμπιά μεγέθους στο UI ήταν αμιγώς διακοσμητικά (PLACEHOLDER_SIZES).
--
-- Μόνο για category = 'clothing' (τα μοναδικά προϊόντα με πραγματικά μεγέθη
-- σήμερα). Προϊόντα ΧΩΡΙΣ variants (music/other, ή clothing πριν γίνει το
-- backfill παρακάτω) συνεχίζουν να δουλεύουν ΑΚΡΙΒΩΣ όπως πριν, με το
-- products.stock_quantity — καμία αλλαγή εκεί, πλήρως backward compatible.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, size)
);

alter table public.product_variants enable row level security;

-- Δημόσιο catalog data (ίδιο μοτίβο με το products — το merch store δουλεύει
-- και για αποσυνδεδεμένο επισκέπτη, βλ. ProductQuickShop.jsx/ProductOverviewRoute.jsx).
create policy "Anyone can view product variants"
  on public.product_variants for select using (true);

create index idx_product_variants_product_id on public.product_variants(product_id);

-- cart_items: ΠΟΙΟ μέγεθος διάλεξε ο fan. NULL = προϊόν χωρίς μεγέθη —
-- συμπεριφορά ΑΚΡΙΒΩΣ όπως σήμερα, backward compatible, καμία ήδη υπάρχουσα
-- γραμμή καλαθιού δεν επηρεάζεται από αυτό το ALTER.
alter table public.cart_items add column variant_id uuid references public.product_variants(id);

-- order_items: snapshot του μεγέθους τη στιγμή της παραγγελίας (ίδιο μοτίβο
-- με το ήδη υπάρχον unit_price) — on delete set null ώστε μια μελλοντική
-- διαγραφή ενός variant να μην σπάσει ιστορικές παραγγελίες.
alter table public.order_items add column variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column size_label text;

-- create_order_from_cart: ΙΔΙΟ signature/όνομα (create or replace — δεν
-- χρειάζεται re-grant). Μόνη αλλαγή: ανά γραμμή καλαθιού, αν υπάρχει
-- variant_id το atomic "δέσμευσε αν υπάρχει απόθεμα" πάει στο
-- product_variants.stock_quantity αντί στο products.stock_quantity —
-- ΑΚΡΙΒΩΣ η ίδια atomic εγγύηση (UPDATE ... WHERE stock_quantity >= qty),
-- απλά στο σωστό, πιο συγκεκριμένο σημείο. Χωρίς variant_id, συμπεριφορά
-- ΑΚΡΙΒΩΣ όπως πριν.
create or replace function public.create_order_from_cart(p_fan_id uuid, p_tenant_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_line record;
  v_updated_rows integer;
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

  insert into public.orders (tenant_id, fan_id, status, subtotal, expires_at)
  values (p_tenant_id, p_fan_id, 'pending', v_subtotal, now() + interval '10 minutes')
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

-- expire_stale_orders: ΙΔΙΟ όνομα, το pg_cron job ("expire-stale-orders",
-- ήδη active, τρέχει κάθε λεπτό) το καλεί με όνομα — create or replace
-- αρκεί, ΔΕΝ χρειάζεται κανένα re-schedule στο cron.job. Τώρα δύο UPDATE
-- αντί για ένα: ένα restore σε product_variants (όπου υπήρχε variant_id
-- στην παραγγελία), ένα σε products (όπου δεν υπήρχε — ΑΚΡΙΒΩΣ το σημερινό).
create or replace function public.expire_stale_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_variants v
  set stock_quantity = stock_quantity + oi.quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.variant_id = v.id
    and o.status = 'pending'
    and o.expires_at < now();

  update public.products p
  set stock_quantity = stock_quantity + oi.quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p.id
    and oi.variant_id is null
    and o.status = 'pending'
    and o.expires_at < now();

  update public.orders
  set status = 'expired'
  where status = 'pending' and expires_at < now();
end;
$$;
