-- ============================================================
-- Tenant Admin Dashboard — βήμα 4: επεξεργασία/διαγραφή event από τον
-- admin, αποθήκευση συντεταγμένων τοποθεσίας (για μελλοντικό feature
-- "events κοντά μου"), και αυτόματη διαγραφή events 24 ώρες μετά την ώρα
-- έναρξής τους (13/9, ρητό αίτημα χρήστη — "να μη μαζεύει σκουπίδια η
-- βάση").
-- ============================================================

-- --- 1. Συντεταγμένες τοποθεσίας ---
-- Απλές numeric στήλες (ΟΧΙ PostGIS) — το μελλοντικό feature
-- "βρες events κοντά στην τοποθεσία που πάτησε ο χρήστης" δεν έχει χτιστεί
-- ακόμα, οπότε δεν έχει νόημα να προσθέσουμε PostGIS extension/geography
-- column/spatial index τώρα (πρόωρο, "small deliberate" — βλ.
-- concerto-brief.md). Όταν χτιστεί το πραγματικό feature, μετατρέπουμε σε
-- geography(Point) με GIST index για αποδοτικά "κοντά μου" queries.
alter table public.events add column if not exists latitude double precision;
alter table public.events add column if not exists longitude double precision;

-- --- 2. Αυτόματη διαγραφή events 24 ώρες μετά την ώρα έναρξής τους ---
-- Χρειάζεται το extension pg_cron. Αν το παρακάτω CREATE EXTENSION
-- αποτύχει με σφάλμα δικαιωμάτων, ενεργοποίησέ το από το Supabase
-- Dashboard: Database -> Extensions -> αναζήτησε "pg_cron" -> Enable, και
-- μετά ξανάτρεξε μόνο το κομμάτι με το cron.schedule παρακάτω.
create extension if not exists pg_cron;

-- Διαγράφει πρώτα τα tickets (αποφεύγει FK violation ανεξάρτητα από το αν
-- υπάρχει ON DELETE CASCADE στο constraint), μετά τα ίδια τα events.
-- Τρέχει κάθε ώρα, στο λεπτό 0 — αρκετή ακρίβεια για "καθάρισμα
-- σκουπιδιών", όχι κρίσιμο timing.
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

-- Sanity checks (τρέξε ξεχωριστά, read-only):
--   select column_name from information_schema.columns where table_name = 'events' and column_name in ('latitude','longitude');
--   -- πρέπει να δείξει και τις δύο.
--   select jobid, jobname, schedule, active from cron.job where jobname = 'delete-expired-events';
--   -- πρέπει να δείξει 1 γραμμή, active = true.
