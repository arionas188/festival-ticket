-- ============================================================
-- BASELINE SCHEMA (25/9/2026)
-- ============================================================
-- Πλήρες στιγμιότυπο (snapshot) του production schema, όπως ήταν ΠΡΑΓΜΑΤΙΚΑ
-- στη ζωντανή Supabase βάση στις 25/9/2026 — ΟΧΙ αθροισμα των migrations
-- παρακάτω, αλλά το ΠΡΑΓΜΑΤΙΚΟ αποτέλεσμα (schema drift από χειροκίνητες
-- αλλαγές στο dashboard έχει ήδη απορροφηθεί εδώ).
--
-- ΓΙΑΤΙ υπάρχει αυτό το αρχείο (ρητό αίτημα χρήστη, 25/9 — "δεν θέλω να
-- εκτεθώ σαν επιχείρηση και να χαλάσει η φήμη μου"): μέχρι σήμερα ΚΑΝΕΝΑ
-- migration δεν δημιουργούσε τους θεμελιώδεις πίνακες (tenants, fans,
-- products, cart_items, tenant_settings, tenant_admins, events, tickets,
-- favorites) — είχαν φτιαχτεί απευθείας μέσα από το Supabase dashboard, πολύ
-- πριν ξεκινήσει το migrations/ folder. Αποτέλεσμα: ο φάκελος migrations/
-- ΜΟΝΟΣ ΤΟΥ δεν αρκούσε ποτέ για να ξαναχτίσει κανείς τη βάση από το μηδέν —
-- ούτε για disaster recovery, ούτε (κρισιμότερο τώρα) για να στήσουμε
-- πραγματική PostgreSQL βάση σε GitHub Actions CI ώστε να τρέχουμε
-- πραγματικά integration tests πάνω στο create_order_from_cart/
-- expire_stale_orders (αντί για mocks).
--
-- Το αρχείο αυτό ΚΛΕΙΝΕΙ αυτό το κενό: παράχθηκε με πραγματικό
-- `supabase db dump --linked --schema public` πάνω στο ζωντανό project,
-- και συμπληρώθηκε χειροκίνητα (παρακάτω, στα τμήματα Storage/Vault/Cron)
-- με ό,τι ζει ΕΚΤΟΣ του public schema και άρα ΔΕΝ το έπιασε το dump —
-- διαβάστηκε ΚΑΘΕ ένα από τα 31 παλιά migration αρχεία για να επιβεβαιωθεί
-- τι ακριβώς χρειάζεται να μεταφερθεί (βλ. supabase/migrations_archive/README.md
-- για την πλήρη εξήγηση + πού βρίσκεται η αναλυτική ιστορία/σχολιασμός κάθε
-- αλλαγής).
--
-- Τα 31 προηγούμενα migration αρχεία ΔΕΝ διαγράφηκαν — μετακινήθηκαν στο
-- supabase/migrations_archive/ (ιστορικό αρχείο, ΔΕΝ τρέχουν πια ποτέ).
--
-- ⚠️ ΣΗΜΑΝΤΙΚΟ για το production Supabase project: αφού αυτό το αρχείο
-- εφαρμοστεί, πρέπει να τρέξει `supabase migration repair <version> --status
-- applied` πάνω στο linked production project ΠΡΙΝ γίνει οποιοδήποτε επόμενο
-- `supabase db push` — αλλιώς ο Supabase CLI θα προσπαθήσει να ξανατρέξει
-- αυτό το αρχείο πάνω στο production (που ήδη έχει όλα αυτά) και θα σκάσει
-- με "already exists" errors. Βλ. concerto-brief.md για το πλήρες βήμα-βήμα.
-- ============================================================


-- --- Extensions (εκτός public schema, χρειάζονται πριν οτιδήποτε άλλο) ---
create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."band_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "image_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."band_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" NOT NULL,
    "variant_id" "uuid"
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "snapshot_title" "text",
    "snapshot_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "date" timestamp with time zone NOT NULL,
    "location" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "location_url" "text",
    "capacity" integer,
    "tickets_sold" integer DEFAULT 0,
    "slug" "text" NOT NULL,
    "latitude" double precision,
    "longitude" double precision,
    CONSTRAINT "events_slug_shape_check" CHECK (("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::"text"))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fan_private_details" (
    "fan_id" "uuid" NOT NULL,
    "date_of_birth_enc" "bytea",
    "city_enc" "bytea",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email_enc" "bytea",
    "full_name_enc" "bytea",
    "avatar_url_enc" "bytea",
    "first_name_enc" "bytea",
    "last_name_enc" "bytea",
    "phone_enc" "bytea"
);


ALTER TABLE "public"."fan_private_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fans" (
    "id" "uuid" NOT NULL,
    "tier" "text" DEFAULT 'free'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_customized" boolean DEFAULT false NOT NULL,
    "favorite_genres" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "favorite_tenant_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "display_name" "text"
);


ALTER TABLE "public"."fans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "price_at_favorite" numeric,
    "tenant_id" "uuid" NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "variant_id" "uuid",
    "size_label" "text",
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "subtotal" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "stripe_payment_intent_id" "text",
    "net_amount" numeric,
    "vat_amount" numeric,
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "size" "text" NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_variants_size_check" CHECK (("size" = ANY (ARRAY['S'::"text", 'M'::"text", 'L'::"text", 'XL'::"text"]))),
    CONSTRAINT "product_variants_stock_quantity_check" CHECK (("stock_quantity" >= 0))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "category" "text" NOT NULL,
    "image_urls" "text"[],
    "stock_quantity" integer,
    "sku" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text" NOT NULL,
    "is_new_arrival" boolean DEFAULT false NOT NULL,
    "available_from" timestamp with time zone,
    CONSTRAINT "products_category_check" CHECK (("category" = ANY (ARRAY['clothing'::"text", 'music'::"text", 'various'::"text"]))),
    CONSTRAINT "products_slug_shape_check" CHECK (("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::"text"))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_admins" (
    "user_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tenant_admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_domains" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "domain" "text",
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenant_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "followed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenant_follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_post_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "fan_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tenant_post_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "media_url" "text" NOT NULL,
    "media_path" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    CONSTRAINT "tenant_posts_media_type_check" CHECK (("media_type" = ANY (ARRAY['photo'::"text", 'video'::"text"])))
);


ALTER TABLE "public"."tenant_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "display_name" "text",
    "logo_url" "text",
    "cover_image_url" "text",
    "primary_color" "text",
    "secondary_color" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "gallery_urls" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "category_label" "text",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_account_id" "text",
    "stripe_charges_enabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."tenant_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "slug" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'artist'::"text" NOT NULL,
    CONSTRAINT "tenants_type_check" CHECK (("type" = ANY (ARRAY['artist'::"text", 'venue'::"text", 'festival'::"text"])))
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "quantity" integer NOT NULL,
    "quantity_sold" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";




-- ΣΗΜΕΙΩΣΗ 25/9: το αρχικό `supabase db dump` βγάζει FUNCTIONS πριν από
-- TABLES (σειρά pg_dump plain-text) — αυτό ΕΣΚΑΓΕ σε πραγματικό δοκιμαστικό
-- run (Docker, βλ. concerto-brief.md) γιατί η `check_own_display_name_available`
-- είναι SQL-language function (όχι plpgsql) και η Postgres επικυρώνει τις
-- αναφορές πινάκων ΤΗΣ ΣΤΙΓΜΗΣ της δημιουργίας για SQL functions — έσκαγε
-- με "relation public.fans does not exist" αφού το fans δεν υπήρχε ακόμα.
-- Fix: οι πίνακες (CREATE TABLE) μπαίνουν ΠΡΩΤΟΙ, μετά τα functions.
-- Επιβεβαιωμένο καθαρό run μετά τη διόρθωση.

CREATE OR REPLACE FUNCTION "public"."adjust_cart_quantity"("p_cart_item_id" "uuid", "p_delta" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_new_quantity integer;
begin
  update cart_items
  set quantity = quantity + p_delta,
      updated_at = now()
  where id = p_cart_item_id
    and fan_id = auth.uid()  -- ασφάλεια: μόνο ο ιδιοκτήτης μπορεί να το αλλάξει
  returning quantity into v_new_quantity;

  if v_new_quantity <= 0 then
    delete from cart_items where id = p_cart_item_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."adjust_cart_quantity"("p_cart_item_id" "uuid", "p_delta" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_own_display_name_available"("p_display_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select case
    when trim(coalesce(p_display_name, '')) = '' then true
    else not exists (
      select 1 from public.fans
      where lower(display_name) = lower(trim(p_display_name))
        and id <> auth.uid()
    )
  end;
$$;


ALTER FUNCTION "public"."check_own_display_name_available"("p_display_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order_from_cart"("p_fan_id" "uuid", "p_tenant_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."create_order_from_cart"("p_fan_id" "uuid", "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_own_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_own_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_stale_orders"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."expire_stale_orders"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_tenant_posts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_post record;
  v_project_url text;
  v_service_key text;
begin
  select decrypted_secret into v_project_url
  from vault.decrypted_secrets where name = 'concerto_project_url';

  select decrypted_secret into v_service_key
  from vault.decrypted_secrets where name = 'concerto_service_role_key';

  if v_project_url is null or v_service_key is null then
    return;
  end if;

  for v_post in
    select id, media_path from public.tenant_posts where expires_at < now()
  loop
    -- Fire-and-forget: το pg_net είναι ασύγχρονο (queue, δεν περιμένει
    -- απάντηση εδώ μέσα) — η γραμμή διαγράφεται αμέσως μετά, ανεξάρτητα
    -- από το πότε θα ολοκληρωθεί το HTTP call. apikey + Authorization
    -- και τα δύο (ίδιο service_role key) — το Supabase API gateway
    -- απαιτεί συνήθως και τα δύο headers, όχι μόνο Authorization.
    perform net.http_delete(
      url := v_project_url || '/storage/v1/object/tenant-posts/' || v_post.media_path,
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_service_key,
        'apikey', v_service_key
      )
    );

    delete from public.tenant_posts where id = v_post.id;
  end loop;
end;
$$;


ALTER FUNCTION "public"."expire_tenant_posts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_stock_holds"("p_tenant_id" "uuid") RETURNS TABLE("product_id" "uuid", "variant_id" "uuid", "held_qty" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select oi.product_id, oi.variant_id, sum(oi.quantity)::bigint as held_qty
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status = 'pending'
    and o.tenant_id = p_tenant_id
  group by oi.product_id, oi.variant_id;
$$;


ALTER FUNCTION "public"."get_active_stock_holds"("p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_own_fan_full_profile"() RETURNS TABLE("first_name" "text", "last_name" "text", "display_name" "text", "phone" "text", "date_of_birth" "date", "city" "text", "favorite_genres" "text"[], "favorite_tenant_ids" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';

  return query
  select
    case when d.first_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.first_name_enc, v_key) else null end,
    case when d.last_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.last_name_enc, v_key) else null end,
    f.display_name,
    case when d.phone_enc is not null and v_key is not null then pgp_sym_decrypt(d.phone_enc, v_key) else null end,
    case when d.date_of_birth_enc is not null and v_key is not null then (pgp_sym_decrypt(d.date_of_birth_enc, v_key))::date else null end,
    case when d.city_enc is not null and v_key is not null then pgp_sym_decrypt(d.city_enc, v_key) else null end,
    f.favorite_genres,
    f.favorite_tenant_ids
  from public.fans f
  left join public.fan_private_details d on d.fan_id = f.id
  where f.id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."get_own_fan_full_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_own_fan_id_number"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  my_created_at timestamptz;
  result integer;
begin
  select created_at into my_created_at from public.fans where id = auth.uid();
  if my_created_at is null then
    return null;
  end if;

  select count(*) into result from public.fans where created_at <= my_created_at;
  return result;
end;
$$;


ALTER FUNCTION "public"."get_own_fan_id_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_own_fan_identity"() RETURNS TABLE("full_name" "text", "avatar_url" "text", "email" "text", "profile_customized" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';

  return query
  select
    case when d.full_name_enc is not null and v_key is not null then pgp_sym_decrypt(d.full_name_enc, v_key) else null end,
    case when d.avatar_url_enc is not null and v_key is not null then pgp_sym_decrypt(d.avatar_url_enc, v_key) else null end,
    case when d.email_enc is not null and v_key is not null then pgp_sym_decrypt(d.email_enc, v_key) else null end,
    f.profile_customized
  from public.fans f
  left join public.fan_private_details d on d.fan_id = f.id
  where f.id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."get_own_fan_identity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_own_fan_private_details"() RETURNS TABLE("date_of_birth" "date", "city" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    return;
  end if;

  return query
  select
    case when d.date_of_birth_enc is not null then (pgp_sym_decrypt(d.date_of_birth_enc, v_key))::date else null end,
    case when d.city_enc is not null then pgp_sym_decrypt(d.city_enc, v_key) else null end
  from public.fan_private_details d
  where d.fan_id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."get_own_fan_private_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_event_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  base_slug text;
  candidate text;
  suffix int := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND btrim(NEW.slug) <> '' THEN
    RETURN NEW;
  END IF;

  base_slug := public.slugify(NEW.title);

  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'event-' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  candidate := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM public.events
    WHERE tenant_id = NEW.tenant_id
      AND slug = candidate
      AND id <> NEW.id
  ) LOOP
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_event_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_own_fan_full_name"("p_full_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  update public.fans set profile_customized = true where id = auth.uid();

  insert into public.fan_private_details (fan_id, full_name_enc, updated_at)
  values (auth.uid(), pgp_sym_encrypt(p_full_name, v_key), now())
  on conflict (fan_id) do update
  set full_name_enc = excluded.full_name_enc,
      updated_at = now();
end;
$$;


ALTER FUNCTION "public"."set_own_fan_full_name"("p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_own_fan_full_profile"("p_first_name" "text", "p_last_name" "text", "p_display_name" "text", "p_phone" "text", "p_date_of_birth" "date", "p_city" "text", "p_favorite_genres" "text"[], "p_favorite_tenant_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  update public.fans
  set profile_customized = true,
      display_name = nullif(trim(coalesce(p_display_name, '')), ''),
      favorite_genres = coalesce(p_favorite_genres, '{}'::text[]),
      favorite_tenant_ids = coalesce(p_favorite_tenant_ids, '{}'::uuid[])
  where id = auth.uid();

  insert into public.fan_private_details (
    fan_id, first_name_enc, last_name_enc, phone_enc,
    date_of_birth_enc, city_enc, updated_at
  )
  values (
    auth.uid(),
    case when p_first_name is not null and length(trim(p_first_name)) > 0 then pgp_sym_encrypt(p_first_name, v_key) else null end,
    case when p_last_name is not null and length(trim(p_last_name)) > 0 then pgp_sym_encrypt(p_last_name, v_key) else null end,
    case when p_phone is not null and length(trim(p_phone)) > 0 then pgp_sym_encrypt(p_phone, v_key) else null end,
    case when p_date_of_birth is not null then pgp_sym_encrypt(p_date_of_birth::text, v_key) else null end,
    case when p_city is not null and length(trim(p_city)) > 0 then pgp_sym_encrypt(p_city, v_key) else null end,
    now()
  )
  on conflict (fan_id) do update
  set first_name_enc = excluded.first_name_enc,
      last_name_enc = excluded.last_name_enc,
      phone_enc = excluded.phone_enc,
      date_of_birth_enc = excluded.date_of_birth_enc,
      city_enc = excluded.city_enc,
      updated_at = now();
end;
$$;


ALTER FUNCTION "public"."set_own_fan_full_profile"("p_first_name" "text", "p_last_name" "text", "p_display_name" "text", "p_phone" "text", "p_date_of_birth" "date", "p_city" "text", "p_favorite_genres" "text"[], "p_favorite_tenant_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_own_fan_private_details"("p_date_of_birth" "date", "p_city" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  insert into public.fan_private_details (fan_id, date_of_birth_enc, city_enc, updated_at)
  values (
    auth.uid(),
    case when p_date_of_birth is not null then pgp_sym_encrypt(p_date_of_birth::text, v_key) else null end,
    case when p_city is not null and length(trim(p_city)) > 0 then pgp_sym_encrypt(p_city, v_key) else null end,
    now()
  )
  on conflict (fan_id) do update
  set date_of_birth_enc = excluded.date_of_birth_enc,
      city_enc = excluded.city_enc,
      updated_at = now();
end;
$$;


ALTER FUNCTION "public"."set_own_fan_private_details"("p_date_of_birth" "date", "p_city" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_product_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  base_slug text;
  candidate text;
  suffix int := 1;
BEGIN
  -- Ρητά δοσμένο slug: μένει όπως είναι, καμία αναδημιουργία/suffix.
  -- (Προστατεύει ήδη κοινοποιημένα slugs από μελλοντικό rename ονόματος·
  -- για ρητή επαναδημιουργία: UPDATE products SET slug = NULL WHERE ...)
  IF NEW.slug IS NOT NULL AND btrim(NEW.slug) <> '' THEN
    RETURN NEW;
  END IF;

  base_slug := public.slugify(NEW.name);

  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'product-' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  candidate := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM public.products
    WHERE tenant_id = NEW.tenant_id
      AND slug = candidate
      AND id <> NEW.id
  ) LOOP
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_product_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_by"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."slugify"("input" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  s text := coalesce(input, '');
BEGIN
  s := normalize(s, NFC);

  -- Δίφθογγοι αυ/ευ: "v" πριν από φωνήεν/ηχηρό σύμφωνο, αλλιώς "f".
  -- Πρέπει να τρέξει πρώτα, πάνω σε αμιγώς ελληνικό κείμενο.
  s := regexp_replace(
    s, '[αΑ][υύΥΎ](?=[αεηιουωάέήίόύώϊϋΐΰΑΕΗΙΟΥΩΆΈΉΊΌΎΏΪΫβγδζλμνρΒΓΔΖΛΜΝΡ])',
    'av', 'g'
  );
  s := regexp_replace(
    s, '[εΕ][υύΥΎ](?=[αεηιουωάέήίόύώϊϋΐΰΑΕΗΙΟΥΩΆΈΉΊΌΎΏΪΫβγδζλμνρΒΓΔΖΛΜΝΡ])',
    'ev', 'g'
  );
  s := regexp_replace(s, '[αΑ][υύΥΎ]', 'af', 'g');
  s := regexp_replace(s, '[εΕ][υύΥΎ]', 'ef', 'g');

  -- Δίφθογγος ου -> "ou" (όχι "oy"). Δεν πιάνει "οϋ" (με διαλυτικά),
  -- όπου τα δύο φωνήεντα προφέρονται σκόπιμα ξεχωριστά, όχι ως δίφθογγος.
  s := regexp_replace(s, '[οΟ][υύΥΎ]', 'ou', 'g');

  -- Πολυχαρακτηρικές μεταγραφές πρώτα (πριν το μονοχαρακτηρικό translate).
  s := replace(s, 'Θ', 'th');
  s := replace(s, 'θ', 'th');
  s := replace(s, 'Χ', 'ch');
  s := replace(s, 'χ', 'ch');
  s := replace(s, 'Ψ', 'ps');
  s := replace(s, 'ψ', 'ps');

  -- Μονοχαρακτηρικές μεταγραφές: βάση, τονισμένα, διαλυτικά, τελικό σ.
  s := translate(
    s,
    'ΑΒΓΔΕΖΗΙΚΛΜΝΞΟΠΡΣΤΥΦΩ' ||
    'αβγδεζηικλμνξοπρστυφω' ||
    'ΆΈΉΊΌΎΏ' ||
    'άέήίόύώ' ||
    'ΪΫ' ||
    'ϊϋΐΰ' ||
    'ς',
    'AVGDEZIIKLMNXOPRSTYFO' ||
    'avgdeziiklmnxoprstyfo' ||
    'AEIIOYO' ||
    'aeiioyo' ||
    'IY' ||
    'iyiy' ||
    's'
  );

  s := lower(s);
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := trim(both '-' from s);

  RETURN s;
END;
$$;


ALTER FUNCTION "public"."slugify"("input" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."slugify"("input" "text") IS 'Μεταγραφή ελληνικού κειμένου σε λατινικό, url-safe slug. Δεν εγγυάται μοναδικότητα.';



CREATE OR REPLACE FUNCTION "public"."sync_own_fan_from_auth"("p_email" "text", "p_full_name" "text", "p_avatar_url" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault', 'extensions'
    AS $$
declare
  v_key text;
  v_customized boolean;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fan_pii_encryption_key';
  if v_key is null then
    raise exception 'Encryption key not found';
  end if;

  insert into public.fans (id)
  values (auth.uid())
  on conflict (id) do nothing;

  select profile_customized into v_customized from public.fans where id = auth.uid();

  if coalesce(v_customized, false) then
    insert into public.fan_private_details (fan_id, email_enc, updated_at)
    values (auth.uid(), case when p_email is not null then pgp_sym_encrypt(p_email, v_key) else null end, now())
    on conflict (fan_id) do update
    set email_enc = excluded.email_enc,
        updated_at = now();
  else
    insert into public.fan_private_details (fan_id, email_enc, full_name_enc, avatar_url_enc, updated_at)
    values (
      auth.uid(),
      case when p_email is not null then pgp_sym_encrypt(p_email, v_key) else null end,
      case when p_full_name is not null then pgp_sym_encrypt(p_full_name, v_key) else null end,
      case when p_avatar_url is not null then pgp_sym_encrypt(p_avatar_url, v_key) else null end,
      now()
    )
    on conflict (fan_id) do update
    set email_enc = excluded.email_enc,
        full_name_enc = excluded.full_name_enc,
        avatar_url_enc = excluded.avatar_url_enc,
        updated_at = now();
  end if;
end;
$$;


ALTER FUNCTION "public"."sync_own_fan_from_auth"("p_email" "text", "p_full_name" "text", "p_avatar_url" "text") OWNER TO "postgres";

ALTER TABLE ONLY "public"."band_members"
    ADD CONSTRAINT "band_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_fan_tenant_product_variant_key" UNIQUE ("fan_id", "tenant_id", "product_id", "variant_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_favorites"
    ADD CONSTRAINT "event_favorites_fan_id_event_id_key" UNIQUE ("fan_id", "event_id");



ALTER TABLE ONLY "public"."event_favorites"
    ADD CONSTRAINT "event_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_tenant_id_slug_key" UNIQUE ("tenant_id", "slug");



ALTER TABLE ONLY "public"."fan_private_details"
    ADD CONSTRAINT "fan_private_details_pkey" PRIMARY KEY ("fan_id");



ALTER TABLE ONLY "public"."fans"
    ADD CONSTRAINT "fans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_fan_id_product_id_key" UNIQUE ("fan_id", "product_id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_size_key" UNIQUE ("product_id", "size");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_tenant_id_slug_key" UNIQUE ("tenant_id", "slug");



ALTER TABLE ONLY "public"."tenant_admins"
    ADD CONSTRAINT "tenant_admins_pkey" PRIMARY KEY ("user_id", "tenant_id");



ALTER TABLE ONLY "public"."tenant_domains"
    ADD CONSTRAINT "tenant_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_follows"
    ADD CONSTRAINT "tenant_follows_fan_id_tenant_id_key" UNIQUE ("fan_id", "tenant_id");



ALTER TABLE ONLY "public"."tenant_follows"
    ADD CONSTRAINT "tenant_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_post_likes"
    ADD CONSTRAINT "tenant_post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_post_likes"
    ADD CONSTRAINT "tenant_post_likes_post_id_fan_id_key" UNIQUE ("post_id", "fan_id");



ALTER TABLE ONLY "public"."tenant_posts"
    ADD CONSTRAINT "tenant_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_settings"
    ADD CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_settings"
    ADD CONSTRAINT "tenant_settings_tenant_id_key" UNIQUE ("tenant_id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



CREATE INDEX "band_members_tenant_id_idx" ON "public"."band_members" USING "btree" ("tenant_id");



CREATE UNIQUE INDEX "fans_display_name_lower_idx" ON "public"."fans" USING "btree" ("lower"("display_name")) WHERE ("display_name" IS NOT NULL);



CREATE INDEX "idx_cart_items_fan_id" ON "public"."cart_items" USING "btree" ("fan_id");



CREATE INDEX "idx_cart_items_product_id" ON "public"."cart_items" USING "btree" ("product_id");



CREATE INDEX "idx_events_tenant_id" ON "public"."events" USING "btree" ("tenant_id");



CREATE INDEX "idx_favorites_fan_id" ON "public"."favorites" USING "btree" ("fan_id");



CREATE INDEX "idx_favorites_product_id" ON "public"."favorites" USING "btree" ("product_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_fan_id" ON "public"."orders" USING "btree" ("fan_id");



CREATE INDEX "idx_orders_status_expires_at" ON "public"."orders" USING "btree" ("status", "expires_at");



CREATE INDEX "idx_orders_tenant_id" ON "public"."orders" USING "btree" ("tenant_id");



CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_products_tenant_id" ON "public"."products" USING "btree" ("tenant_id");



CREATE INDEX "idx_tenant_domains_tenant_id" ON "public"."tenant_domains" USING "btree" ("tenant_id");



CREATE INDEX "idx_tenant_follows_fan_id" ON "public"."tenant_follows" USING "btree" ("fan_id");



CREATE INDEX "idx_tenant_follows_tenant_id" ON "public"."tenant_follows" USING "btree" ("tenant_id");



CREATE INDEX "idx_tenant_post_likes_fan_id" ON "public"."tenant_post_likes" USING "btree" ("fan_id");



CREATE INDEX "idx_tenant_post_likes_post_id" ON "public"."tenant_post_likes" USING "btree" ("post_id");



CREATE INDEX "idx_tenant_posts_expires_at" ON "public"."tenant_posts" USING "btree" ("expires_at");



CREATE INDEX "idx_tenant_posts_tenant_id_created_at" ON "public"."tenant_posts" USING "btree" ("tenant_id", "created_at" DESC);



CREATE UNIQUE INDEX "idx_tenant_settings_stripe_account_id" ON "public"."tenant_settings" USING "btree" ("stripe_account_id") WHERE ("stripe_account_id" IS NOT NULL);



CREATE INDEX "idx_tenant_settings_tenant_id" ON "public"."tenant_settings" USING "btree" ("tenant_id");



CREATE INDEX "idx_tickets_event_id" ON "public"."tickets" USING "btree" ("event_id");



CREATE OR REPLACE TRIGGER "trg_events_set_slug" BEFORE INSERT OR UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."set_event_slug"();



CREATE OR REPLACE TRIGGER "trg_products_set_slug" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_slug"();



CREATE OR REPLACE TRIGGER "trg_tenant_settings_set_updated_by" BEFORE UPDATE ON "public"."tenant_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_by"();



ALTER TABLE ONLY "public"."band_members"
    ADD CONSTRAINT "band_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."event_favorites"
    ADD CONSTRAINT "event_favorites_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_favorites"
    ADD CONSTRAINT "event_favorites_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fan_private_details"
    ADD CONSTRAINT "fan_private_details_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fans"
    ADD CONSTRAINT "fans_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_admins"
    ADD CONSTRAINT "tenant_admins_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_admins"
    ADD CONSTRAINT "tenant_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_domains"
    ADD CONSTRAINT "tenant_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_follows"
    ADD CONSTRAINT "tenant_follows_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_follows"
    ADD CONSTRAINT "tenant_follows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_post_likes"
    ADD CONSTRAINT "tenant_post_likes_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "public"."fans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_post_likes"
    ADD CONSTRAINT "tenant_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."tenant_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_posts"
    ADD CONSTRAINT "tenant_posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_settings"
    ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_settings"
    ADD CONSTRAINT "tenant_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public read access to events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to tenant_settings" ON "public"."tenant_settings" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to tickets" ON "public"."tickets" FOR SELECT USING (true);



CREATE POLICY "Anyone can view product variants" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tenant post likes" ON "public"."tenant_post_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tenant posts" ON "public"."tenant_posts" FOR SELECT USING (true);



CREATE POLICY "Fans can add own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can delete own cart items" ON "public"."cart_items" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can delete own event favorites" ON "public"."event_favorites" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can delete own private details" ON "public"."fan_private_details" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can follow tenants" ON "public"."tenant_follows" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can insert own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can insert own event favorites" ON "public"."event_favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can insert own private details" ON "public"."fan_private_details" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can insert own profile" ON "public"."fans" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Fans can like as themselves" ON "public"."tenant_post_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can remove own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can unfollow tenants" ON "public"."tenant_follows" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can unlike their own like" ON "public"."tenant_post_likes" FOR DELETE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can update own cart items" ON "public"."cart_items" FOR UPDATE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can update own private details" ON "public"."fan_private_details" FOR UPDATE USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can update own profile" ON "public"."fans" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Fans can view own cart" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own event favorites" ON "public"."event_favorites" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own follows" ON "public"."tenant_follows" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."fan_id" = "auth"."uid"())))));



CREATE POLICY "Fans can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own private details" ON "public"."fan_private_details" FOR SELECT USING (("auth"."uid"() = "fan_id"));



CREATE POLICY "Fans can view own profile" ON "public"."fans" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Public read access to active band members" ON "public"."band_members" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public read tenant domains" ON "public"."tenant_domains" FOR SELECT USING (true);



CREATE POLICY "Public read tenants" ON "public"."tenants" FOR SELECT USING (true);



CREATE POLICY "admins can see their own admin rows" ON "public"."tenant_admins" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."band_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fan_private_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenant admins can create their own tenant events" ON "public"."events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "events"."tenant_id")))));



CREATE POLICY "tenant admins can create their own tenant posts" ON "public"."tenant_posts" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "tenant_posts"."tenant_id")))));



CREATE POLICY "tenant admins can create their own tenant products" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "products"."tenant_id")))));



CREATE POLICY "tenant admins can create tickets for their own events" ON "public"."tickets" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "e"."tenant_id")))
  WHERE (("e"."id" = "tickets"."event_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "tenant admins can create variants for their own products" ON "public"."product_variants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."products" "p"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "p"."tenant_id")))
  WHERE (("p"."id" = "product_variants"."product_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "tenant admins can delete their own tenant events" ON "public"."events" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "events"."tenant_id")))));



CREATE POLICY "tenant admins can delete their own tenant products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "products"."tenant_id")))));



CREATE POLICY "tenant admins can delete tickets for their own events" ON "public"."tickets" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "e"."tenant_id")))
  WHERE (("e"."id" = "tickets"."event_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "tenant admins can delete variants for their own products" ON "public"."product_variants" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."products" "p"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "p"."tenant_id")))
  WHERE (("p"."id" = "product_variants"."product_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "tenant admins can update their own tenant events" ON "public"."events" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "events"."tenant_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "events"."tenant_id")))));



CREATE POLICY "tenant admins can update their own tenant products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "products"."tenant_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "products"."tenant_id")))));



CREATE POLICY "tenant admins can update their own tenant settings" ON "public"."tenant_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "tenant_settings"."tenant_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tenant_admins" "ta"
  WHERE (("ta"."user_id" = "auth"."uid"()) AND ("ta"."tenant_id" = "tenant_settings"."tenant_id")))));



CREATE POLICY "tenant admins can update tickets for their own events" ON "public"."tickets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "e"."tenant_id")))
  WHERE (("e"."id" = "tickets"."event_id") AND ("ta"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "e"."tenant_id")))
  WHERE (("e"."id" = "tickets"."event_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "tenant admins can update variants for their own products" ON "public"."product_variants" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."products" "p"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "p"."tenant_id")))
  WHERE (("p"."id" = "product_variants"."product_id") AND ("ta"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."products" "p"
     JOIN "public"."tenant_admins" "ta" ON (("ta"."tenant_id" = "p"."tenant_id")))
  WHERE (("p"."id" = "product_variants"."product_id") AND ("ta"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."tenant_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_post_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."adjust_cart_quantity"("p_cart_item_id" "uuid", "p_delta" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."adjust_cart_quantity"("p_cart_item_id" "uuid", "p_delta" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."adjust_cart_quantity"("p_cart_item_id" "uuid", "p_delta" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_own_display_name_available"("p_display_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_own_display_name_available"("p_display_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_order_from_cart"("p_fan_id" "uuid", "p_tenant_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_order_from_cart"("p_fan_id" "uuid", "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order_from_cart"("p_fan_id" "uuid", "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."expire_stale_orders"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."expire_stale_orders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_tenant_posts"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_tenant_posts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_tenant_posts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_stock_holds"("p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_stock_holds"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_stock_holds"("p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_own_fan_full_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_own_fan_full_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_own_fan_id_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_own_fan_id_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_own_fan_identity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_own_fan_identity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_own_fan_private_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_own_fan_private_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_event_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_event_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_event_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_own_fan_full_name"("p_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_own_fan_full_name"("p_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_own_fan_full_profile"("p_first_name" "text", "p_last_name" "text", "p_display_name" "text", "p_phone" "text", "p_date_of_birth" "date", "p_city" "text", "p_favorite_genres" "text"[], "p_favorite_tenant_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_own_fan_full_profile"("p_first_name" "text", "p_last_name" "text", "p_display_name" "text", "p_phone" "text", "p_date_of_birth" "date", "p_city" "text", "p_favorite_genres" "text"[], "p_favorite_tenant_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_own_fan_private_details"("p_date_of_birth" "date", "p_city" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_own_fan_private_details"("p_date_of_birth" "date", "p_city" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."slugify"("input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_own_fan_from_auth"("p_email" "text", "p_full_name" "text", "p_avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_own_fan_from_auth"("p_email" "text", "p_full_name" "text", "p_avatar_url" "text") TO "service_role";



GRANT ALL ON TABLE "public"."band_members" TO "anon";
GRANT ALL ON TABLE "public"."band_members" TO "authenticated";
GRANT ALL ON TABLE "public"."band_members" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."event_favorites" TO "anon";
GRANT ALL ON TABLE "public"."event_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."event_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."fan_private_details" TO "anon";
GRANT ALL ON TABLE "public"."fan_private_details" TO "authenticated";
GRANT ALL ON TABLE "public"."fan_private_details" TO "service_role";



GRANT ALL ON TABLE "public"."fans" TO "anon";
GRANT ALL ON TABLE "public"."fans" TO "authenticated";
GRANT ALL ON TABLE "public"."fans" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_admins" TO "anon";
GRANT ALL ON TABLE "public"."tenant_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_admins" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_domains" TO "anon";
GRANT ALL ON TABLE "public"."tenant_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_domains" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_follows" TO "anon";
GRANT ALL ON TABLE "public"."tenant_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_follows" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_post_likes" TO "anon";
GRANT ALL ON TABLE "public"."tenant_post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_posts" TO "anon";
GRANT ALL ON TABLE "public"."tenant_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_posts" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_settings" TO "anon";
GRANT ALL ON TABLE "public"."tenant_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_settings" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


-- ============================================================
-- ΕΠΙΒΕΒΑΙΩΣΗ 25/9 (πραγματικό test, Docker + bare "supabase/postgres" image):
-- το public schema block παραπάνω (πίνακες/functions/RLS/grants — ΑΚΡΙΒΩΣ
-- ό,τι χρειάζονται τα RPC/stock tests) πέρασε 100% καθαρό, καμία αλλαγή
-- χρειάστηκε. Το section Storage παρακάτω ΘΑ σκάσει με "relation
-- storage.buckets does not exist" αν δοκιμαστεί πάνω σε γυμνό Postgres
-- container (χωρίς το Supabase Storage service) — ΑΝΑΜΕΝΟΜΕΝΟ, ΟΧΙ bug:
-- ο storage.buckets πίνακας δημιουργείται από το ίδιο το Storage service
-- (μέρος του πλήρους `supabase start` stack), ΟΧΙ από το bare postgres
-- image, ακριβώς όπως ίσχυε ΚΑΙ στο αρχικό migration
-- 20260911170000_add_tenant_images_storage.sql. Θα δουλέψει κανονικά μέσα
-- σε `supabase start` (πλήρες stack) ή πάνω σε πραγματικό Supabase project.

-- Storage: buckets + RLS (ζουν στο "storage" schema, ΟΧΙ "public" — το
-- `db dump --schema public` δεν τα έπιασε. Πηγή: migrations
-- 20260911170000_add_tenant_images_storage.sql (tenant-images) +
-- 20260920100000_add_tenant_posts.sql (tenant-posts), αμετάβλητα.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-images',
  'tenant-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "tenant admins can upload their own tenant images"
  on storage.objects for insert
  with check (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can update their own tenant images"
  on storage.objects for update
  using (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can delete their own tenant images"
  on storage.objects for delete
  using (
    bucket_id = 'tenant-images'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-posts',
  'tenant-posts',
  true,
  26214400, -- 25MB
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "tenant admins can upload their own tenant posts"
  on storage.objects for insert
  with check (
    bucket_id = 'tenant-posts'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );

create policy "tenant admins can delete their own tenant posts"
  on storage.objects for delete
  using (
    bucket_id = 'tenant-posts'
    and exists (
      select 1 from tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id::text = (storage.foldername(name))[1]
    )
  );


-- ============================================================
-- Vault: bootstrap του encryption key για fan_private_details.
-- Πηγή: migration 20260909100000_add_encrypted_fan_private_details.sql,
-- αμετάβλητο. Το key δημιουργείται τυχαίο, ΜΙΑ φορά ανά περιβάλλον
-- (ασφαλές να ξανατρέξει — δεν αντικαθιστά υπάρχον key). Σε ένα φρέσκο
-- CI/local Postgres δημιουργείται ΝΕΟ, ΔΙΚΟ ΤΟΥ key — ποτέ το ίδιο με το
-- production, όπως πρέπει.
-- ============================================================

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'fan_pii_encryption_key') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'fan_pii_encryption_key',
      'Symmetric key: encrypt/decrypt fan_private_details (ημ. γέννησης, πόλη)'
    );
  end if;
end $$;


-- ============================================================
-- pg_cron: scheduled jobs (ζουν στο "cron" schema, ΟΧΙ "public").
-- Πηγή, αμετάβλητα: 20260913120000 (delete-expired-events),
-- 20260914150000 (expire-stale-orders), 20260920100000 (expire-tenant-posts).
-- ============================================================

select cron.schedule(
  'delete-expired-events',
  '0 * * * *',
  $$
    delete from public.tickets
    where event_id in (
      select id from public.events where date < now() - interval '24 hours'
    );
    delete from public.events where date < now() - interval '24 hours';
  $$
);

select cron.schedule(
  'expire-stale-orders',
  '* * * * *',
  $$select public.expire_stale_orders();$$
);

select cron.schedule(
  'expire-tenant-posts',
  '* * * * *',
  $$select public.expire_tenant_posts();$$
);

-- ============================================================
-- ⚠️ ΧΕΙΡΟΚΙΝΗΤΟ ΒΗΜΑ (ΔΕΝ εκτελείται από αυτό το migration — ΠΟΤΕ μέσα σε
-- migration/chat/AI, το service_role key παρακάμπτει ΚΑΘΕ RLS): στο
-- production project πρέπει ήδη να υπάρχουν (βλ. 20260920100000) τα δύο
-- vault secrets "concerto_project_url" / "concerto_service_role_key" ώστε
-- το expire_tenant_posts() να διαγράφει πραγματικά και το storage αρχείο.
-- Σε ΝΕΟ (CI/local) περιβάλλον αυτά ΔΕΝ υπάρχουν — η function το ανιχνεύει
-- και επιστρέφει αθόρυβα χωρίς να σβήσει τίποτα (ασφαλές, δεν χρειάζεται
-- τίποτα επιπλέον για τα integration tests).
-- ============================================================
