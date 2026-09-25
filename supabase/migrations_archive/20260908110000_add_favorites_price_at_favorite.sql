-- Fan Dashboard — "Αγαπημένα merch" συγκεντρωτικά + ειδοποίηση πτώσης τιμής
-- (βλ. concerto-react-router-brief.md).
--
-- Αποθηκεύουμε την τιμή τη ΣΤΙΓΜΗ που έγινε favorite (ProductList.jsx). Η
-- σύγκριση με τη ΣΗΜΕΡΙΝΗ products.price γίνεται ζωντανά στο query
-- (useFanFavoriteMerch.js) — δεν χρειάζεται κανένα background job/cron.
alter table public.favorites
  add column if not exists price_at_favorite numeric;
