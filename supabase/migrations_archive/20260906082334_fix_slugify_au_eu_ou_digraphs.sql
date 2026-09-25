-- =====================================================================
-- Fix: το slugify() δεν χειριζόταν ειδικά τους διφθόγγους αυ/ευ/ου.
--
-- - αυ/ευ: στα ελληνικά το "υ" τους προφέρεται "v" πριν από φωνήεν ή
--   ηχηρό σύμφωνο, αλλιώς "f" (πριν από άηχο σύμφωνο ή στο τέλος
--   λέξης) — π.χ. "Ελευθερία" έπρεπε να δώσει "eleftheria", όχι
--   "eleytheria" (που έδινε η απλή γράμμα-προς-γράμμα μεταγραφή).
-- - ου: καθιερωμένη μεταγραφή "ou" (π.χ. "ούζο" -> "ouzo"), όχι "oy"
--   που θα προέκυπτε από απλή γράμμα-προς-γράμμα μετατροπή αφού το
--   μεμονωμένο "υ" μεταγράφεται αλλού σε "y".
--
-- Τα bracket character classes (π.χ. [αΑ][υύΥΎ]) χρησιμοποιούνται αντί
-- για case-insensitive regex flag, ώστε να μη βασιζόμαστε σε Unicode
-- case-folding που εξαρτάται από το locale της βάσης — ίδια λογική
-- ασφάλειας με το ήδη υπάρχον translate() στη function.
--
-- Καμία αλλαγή στα ήδη σωστά slugs (π.χ. "villagers-hoodie",
-- "villagers-live-at-gazi-vinylio") — το reset+regenerate παρακάτω
-- είναι ασφαλές, ίδιο pattern με το προηγούμενο Β/β fix.
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

UPDATE public.products SET slug = NULL;
UPDATE public.events SET slug = NULL;

COMMIT;

-- Sanity check μετά:
--   SELECT id, name, slug FROM public.products ORDER BY created_at DESC LIMIT 20;
--   SELECT id, title, slug FROM public.events ORDER BY created_at DESC LIMIT 20;
-- Τα ήδη γνωστά slugs (villagers-hoodie, villagers-live-at-gazi-vinylio,
-- villagers-studio-sessions-cd, villagers-t-shirt-black, villagers-live-at-gazi)
-- πρέπει να παραμείνουν ΑΚΡΙΒΩΣ ίδια — κανένα δεν περιέχει αυ/ευ/ου.
