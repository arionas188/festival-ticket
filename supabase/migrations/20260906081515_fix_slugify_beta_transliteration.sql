-- =====================================================================
-- Fix: το slugify() είχε λάθος μεταγραφή για το ελληνικό Β/β (βήτα).
-- Στα νέα ελληνικά το βήτα προφέρεται "v" (π.χ. Βασίλης -> Vasilis), όχι
-- "b" — η προηγούμενη έκδοση της translate() το χαρτογραφούσε λάθος σε
-- 'b'/'B'. Εντοπίστηκε στην πράξη: "Βινύλιο" έβγαλε "binylio" αντί για
-- "vinylio".
--
-- Αυτό το αρχείο: (1) διορθώνει τη function, (2) μηδενίζει το slug σε
-- ΟΛΑ τα products/events ώστε το trigger να τα ξαναφτιάξει με τη σωστή
-- μεταγραφή. Ασφαλές τώρα: το migration μόλις έτρεξε, κανένα slug link
-- δεν έχει ακόμα μοιραστεί δημόσια εκτός του σημερινού testing.
--
-- ΤΡΕΞΕ ΤΟ ΣΤΟ SUPABASE SQL EDITOR, μία φορά.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  s text := coalesce(input, '');
BEGIN
  s := normalize(s, NFC);

  s := replace(s, 'Θ', 'th');
  s := replace(s, 'θ', 'th');
  s := replace(s, 'Χ', 'ch');
  s := replace(s, 'χ', 'ch');
  s := replace(s, 'Ψ', 'ps');
  s := replace(s, 'ψ', 'ps');

  s := translate(
    s,
    'ΑΒΓΔΕΖΗΙΚΛΜΝΞΟΠΡΣΤΥΦΩ' ||
    'αβγδεζηικλμνξοπρστυφω' ||
    'ΆΈΉΊΌΎΏ' ||
    'άέήίόύώ' ||
    'ΪΫ' ||
    'ϊϋΐΰ' ||
    'ς',
    'AVGDEZIIKLMNXOPRSTYFO' ||   -- Β -> V (διορθώθηκε, ήταν 'B')
    'avgdeziiklmnxoprstyfo' ||   -- β -> v (διορθώθηκε, ήταν 'b')
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

-- Μηδένισε το slug παντού -> το trigger (BEFORE UPDATE) το ξαναφτιάχνει
-- αυτόματα με τη διορθωμένη slugify(), ίδια collision-suffix λογική.
UPDATE public.products SET slug = NULL;
UPDATE public.events SET slug = NULL;

COMMIT;

-- Sanity check μετά (πρέπει να δείξει "vinylio", όχι "binylio"):
--   SELECT id, name, slug FROM public.products ORDER BY created_at DESC LIMIT 20;
--   SELECT id, title, slug FROM public.events ORDER BY created_at DESC LIMIT 20;
