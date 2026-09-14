-- Merch checkout: reserve stock -> pending order, με λήξη χρόνου (14/9,
-- ρητό αίτημα χρήστη — "asxoloithoume me to merch kai na ftasoume mexri to
-- vima pou xreiazetai na kanw call to API tis stripe"). Υλοποιεί ό,τι είχε
-- ήδη σχεδιαστεί (χωρίς να χτιστεί) στο concerto-brief.md, "Race Conditions
-- & Overselling": atomic stock decrement + orders table με pending/
-- completed/expired + expires_at. Το πραγματικό Stripe API call ΔΕΝ είναι
-- εδώ — χρειάζεται δικό του serverless function (Netlify Functions ή
-- Supabase Edge Functions, κανένα από τα δύο δεν υπάρχει ακόμα στο repo),
-- σκόπιμα εκτός scope σήμερα. Βλ. OrderSummaryRoute.jsx για το ρητό TODO
-- σημείο όπου θα μπει.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  fan_id uuid not null references public.fans(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired', 'cancelled')),
  subtotal numeric not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  -- Γεμίζει όταν χτιστεί το πραγματικό Stripe integration (PaymentIntent id).
  stripe_payment_intent_id text
);

alter table public.orders enable row level security;

-- Μόνο SELECT για fans — κανένα insert/update policy εδώ επίτηδες. Όλες οι
-- εγγραφές/αλλαγές περνάνε ΑΠΟΚΛΕΙΣΤΙΚΑ από τα SECURITY DEFINER functions
-- παρακάτω, ώστε το atomic stock-check να μην μπορεί ποτέ να παρακαμφθεί
-- από απευθείας client-side insert.
create policy "Fans can view own orders"
on public.orders for select using (auth.uid() = fan_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  -- Snapshot της τιμής τη στιγμή της παραγγελίας — ίδιο μοτίβο με το ήδη
  -- υπάρχον favorites.price_at_favorite (βλ. migration 20260908110000). Αν
  -- αλλάξει αργότερα η τιμή του προϊόντος, ΔΕΝ επηρεάζει ήδη υπάρχουσες
  -- παραγγελίες.
  unit_price numeric not null,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Fans can view own order items"
on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.fan_id = auth.uid()
  )
);

create index idx_orders_fan_id on public.orders(fan_id);
create index idx_orders_tenant_id on public.orders(tenant_id);
create index idx_orders_status_expires_at on public.orders(status, expires_at);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);

-- Μετατρέπει το τρέχον καλάθι (cart_items) ενός fan, για ΕΝΑ tenant, σε μία
-- pending παραγγελία με 10λεπτο hold. Όλα μέσα σε ΜΙΑ function call — η
-- Postgres το τρέχει atomic: αν ΟΠΟΙΟΔΗΠΟΤΕ exception πεταχτεί (π.χ. ένα
-- μόνο προϊόν εξαντλημένο), ΟΛΕΣ οι προηγούμενες αλλαγές μέσα σε αυτή την
-- κλήση αναιρούνται αυτόματα — αδύνατο να μείνει μισο-δεσμευμένη παραγγελία.
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
  -- Defense in depth: το p_fan_id είναι απλή παράμετρος, θα μπορούσε να
  -- πλαστογραφηθεί από κάποιον που καλεί το RPC απευθείας (όχι μέσω του
  -- δικού μας frontend) — το SECURITY DEFINER παρακάμπτει το RLS, οπότε ο
  -- έλεγχος πρέπει να γίνει ρητά εδώ μέσα.
  if auth.uid() != p_fan_id then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1 from public.cart_items where fan_id = p_fan_id and tenant_id = p_tenant_id
  ) then
    raise exception 'empty_cart';
  end if;

  -- Πρώτα υπολογίζουμε subtotal + δημιουργούμε το order, ΠΡΙΝ αγγίξουμε
  -- stock, ώστε το order_id να υπάρχει ήδη για τα order_items παρακάτω.
  select coalesce(sum(p.price * c.quantity), 0)
  into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.fan_id = p_fan_id and c.tenant_id = p_tenant_id;

  insert into public.orders (tenant_id, fan_id, status, subtotal, expires_at)
  values (p_tenant_id, p_fan_id, 'pending', v_subtotal, now() + interval '10 minutes')
  returning id into v_order_id;

  -- Ανά γραμμή καλαθιού: atomic "δέσμευσε αν υπάρχει απόθεμα" (η ίδια η
  -- WHERE συνθήκη είναι η προστασία από overselling — βλ. concerto-brief.md,
  -- "Race Conditions & Overselling"). Αν μια γραμμή αποτύχει, το RAISE
  -- EXCEPTION παρακάτω ακυρώνει ΟΛΗ την function call, άρα και το ήδη
  -- εισαγμένο order/προηγούμενα stock updates αυτής της κλήσης.
  for v_line in
    select c.product_id, c.quantity, p.name, p.price, p.stock_quantity
    from public.cart_items c
    join public.products p on p.id = c.product_id
    where c.fan_id = p_fan_id and c.tenant_id = p_tenant_id
  loop
    update public.products
    set stock_quantity = stock_quantity - v_line.quantity
    where id = v_line.product_id and stock_quantity >= v_line.quantity;

    get diagnostics v_updated_rows = row_count;
    if v_updated_rows = 0 then
      raise exception 'insufficient_stock: %', v_line.name;
    end if;

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_order_id, v_line.product_id, v_line.quantity, v_line.price);
  end loop;

  delete from public.cart_items where fan_id = p_fan_id and tenant_id = p_tenant_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_from_cart(uuid, uuid) to authenticated;
revoke execute on function public.create_order_from_cart(uuid, uuid) from anon;

-- Τρέχει σε schedule (βλ. cron.schedule παρακάτω) — απελευθερώνει το
-- δεσμευμένο stock παραγγελιών που έληξαν χωρίς να ολοκληρωθεί η πληρωμή.
create or replace function public.expire_stale_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set stock_quantity = stock_quantity + oi.quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p.id
    and o.status = 'pending'
    and o.expires_at < now();

  update public.orders
  set status = 'expired'
  where status = 'pending' and expires_at < now();
end;
$$;

-- Δεν χρειάζεται grant σε authenticated/anon — καλείται ΜΟΝΟ από το
-- pg_cron schedule παρακάτω (τρέχει ως ο ιδιοκτήτης του function, δηλαδή
-- πάντα με πλήρη δικαιώματα, ανεξάρτητα από grants σε roles των χρηστών).

-- ΑΠΑΙΤΕΙ το extension "pg_cron" ενεργοποιημένο (Supabase dashboard ->
-- Database -> Extensions -> pg_cron -> Enable) ΠΡΙΝ τρέξει αυτό το SQL,
-- αλλιώς θα σκάσει το cron.schedule() παρακάτω. Πρώτη χρήση pg_cron σε αυτό
-- το project.
select cron.schedule(
  'expire-stale-orders',
  '* * * * *',
  $$select public.expire_stale_orders();$$
);
