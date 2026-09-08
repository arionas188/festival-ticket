-- Fan ID card (test/demo, 8/9): ο αριθμός ταυτότητας ("00004" κ.λπ.) στο
-- FanIdCard.jsx υπολογίζεται από τη σειρά εγγραφής (πόσοι fans γράφτηκαν
-- πριν από αυτόν) — χρειάζεται created_at στο fans table. IF NOT EXISTS
-- ώστε να είναι ασφαλές ό,τι κι αν υπάρχει ήδη. Σημείωση: αν το table ήδη
-- έχει γραμμές χωρίς αυτή τη στήλη, το DEFAULT now() στο ALTER TABLE τις
-- γεμίζει όλες με την ΙΔΙΑ χρονική στιγμή (η στιγμή του migration) — δεν
-- πειράζει για τώρα, ο αριθμός είναι ρητά μόνο για UI/demo (βλ. σχόλιο
-- χρήστη), όχι επίσημο μητρώο. Από εδώ και πέρα κάθε νέος fan παίρνει το
-- σωστό, πραγματικό created_at του.
alter table public.fans add column if not exists created_at timestamptz not null default now();
