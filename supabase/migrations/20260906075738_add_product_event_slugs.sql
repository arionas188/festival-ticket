-- =====================================================================
-- Concerto: πραγματικά, "όμορφα" URLs για products/events μέσω slug.
--
-- ΤΡΕΞΕ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ ΜΙΑ ΦΟΡΑ στο Supabase SQL editor του project.
-- Δεν μπορεί να τρέξει αυτόματα από το Claude sandbox (δεν υπάρχει δίκτυο
-- προς το production Supabase project από εκεί) — ίδιος λόγος που το
-- `git push` έπρεπε επίσης να τρέξει χειροκίνητα νωρίτερα.
--
-- Ασφαλές να ξανατρέξεις τα CREATE OR REPLACE FUNCTION / DROP TRIGGER IF
-- EXISTS / ADD COLUMN IF NOT EXISTS κομμάτια, ΟΧΙ όμως τα δύο ADD
-- CONSTRAINT στο τέλος κάθε table block — αυτά θα αποτύχουν με
-- "already exists" αν ξανατρέξει ολόκληρο το αρχείο μετά την πρώτη φορά.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. slugify(): Ελληνικά -> λατινικά, url-safe.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  s text := coalesce(input, '');
BEGIN
  -- Normalize πρώτα σε NFC ώστε precomposed ΚΑΙ decomposed ελληνικό
  -- input (π.χ. τονισμένο φωνήεν ως ένας χαρακτήρας ή ως βάση+τόνος) να
  -- πιάνονται σωστά από τα mappings παρακάτω.
  s := normalize(s, NFC);

  -- Δίφθογγοι αυ/ευ: "v" πριν από φωνήεν/ηχηρό σύμφωνο, αλλιώς "f".
  -- Πρέπει να τρέξει πρώτα, πάνω σε αμιγώς ελληνικό κείμενο. Bracket
  -- character classes αντί για case-insensitive regex flag, ώστε να μη
  -- βασιζόμαστε σε Unicode case-folding που εξαρτάται από το locale.
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
  -- όπου τα δύο φωνήεντα προφέρονται σκόπιμα ξεχωριστά.
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

  -- Κάθε run μη [a-z0-9] -> ένα '-' (μαζεύει και επαναλαμβανόμενα
  -- κενά/σημεία στίξης/παύλες σε ένα πέρασμα).
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');

  s := trim(both '-' from s);

  RETURN s;
END;
$$;

COMMENT ON FUNCTION public.slugify(text) IS
  'Μεταγραφή ελληνικού κειμένου σε λατινικό, url-safe slug. Δεν εγγυάται μοναδικότητα.';


-- ---------------------------------------------------------------------
-- 2. products
-- ---------------------------------------------------------------------

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

DROP TRIGGER IF EXISTS trg_products_set_slug ON public.products;
CREATE TRIGGER trg_products_set_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_slug();

-- Deterministic backfill (set-based, όχι μέσω trigger).
WITH base AS (
  SELECT
    id,
    tenant_id,
    created_at,
    COALESCE(
      NULLIF(public.slugify(name), ''),
      'product-' || substr(replace(id::text, '-', ''), 1, 8)
    ) AS base_slug
  FROM public.products
  WHERE slug IS NULL
),
numbered AS (
  SELECT
    id,
    base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, base_slug
      ORDER BY created_at, id
    ) AS rn
  FROM base
)
UPDATE public.products p
SET slug = n.base_slug || CASE WHEN n.rn = 1 THEN '' ELSE '-' || n.rn::text END
FROM numbered n
WHERE p.id = n.id;

ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.products
  ADD CONSTRAINT products_tenant_id_slug_key UNIQUE (tenant_id, slug);

ALTER TABLE public.products
  ADD CONSTRAINT products_slug_shape_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');


-- ---------------------------------------------------------------------
-- 3. events (ίδιο pattern, κλειδί: title)
-- ---------------------------------------------------------------------

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.set_event_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

DROP TRIGGER IF EXISTS trg_events_set_slug ON public.events;
CREATE TRIGGER trg_events_set_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_event_slug();

WITH base AS (
  SELECT
    id,
    tenant_id,
    created_at,
    COALESCE(
      NULLIF(public.slugify(title), ''),
      'event-' || substr(replace(id::text, '-', ''), 1, 8)
    ) AS base_slug
  FROM public.events
  WHERE slug IS NULL
),
numbered AS (
  SELECT
    id,
    base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, base_slug
      ORDER BY created_at, id
    ) AS rn
  FROM base
)
UPDATE public.events e
SET slug = n.base_slug || CASE WHEN n.rn = 1 THEN '' ELSE '-' || n.rn::text END
FROM numbered n
WHERE e.id = n.id;

ALTER TABLE public.events ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.events
  ADD CONSTRAINT events_tenant_id_slug_key UNIQUE (tenant_id, slug);

ALTER TABLE public.events
  ADD CONSTRAINT events_slug_shape_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

COMMIT;

-- =====================================================================
-- Sanity checks (τρέξε ξεχωριστά, ΜΕΤΑ το COMMIT — read-only):
--
--   SELECT id, name FROM public.products WHERE slug IS NULL OR slug = '';
--   SELECT id, title FROM public.events WHERE slug IS NULL OR slug = '';
--   -- πρέπει να επιστρέψουν 0 rows και στα δύο.
--
--   SELECT id, name, slug FROM public.products ORDER BY created_at DESC LIMIT 20;
--   SELECT id, title, slug FROM public.events ORDER BY created_at DESC LIMIT 20;
--   -- οπτικός έλεγχος ποιότητας μεταγραφής.
-- =====================================================================
