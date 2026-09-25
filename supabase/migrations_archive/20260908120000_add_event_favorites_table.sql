-- Fan Dashboard — "Αγαπημένα events" συγκεντρωτικά + ειδοποίηση αλλαγής
-- (βλ. concerto-react-router-brief.md).
--
-- Δεν υπήρχε ΚΑΝΕΝΑΣ μηχανισμός "αγαπημένο event" πριν (μόνο το merch είχε
-- favorites) — νέο table, ίδιο σχήμα/RLS στυλ με το υπάρχον `favorites`.
--
-- snapshot_title/snapshot_date: αντί να βασιστούμε σε τυχόν events.updated_at
-- (δεν υπάρχει επιβεβαιωμένος trigger που να το ενημερώνει σήμερα — τα events
-- μπαίνουν/αλλάζουν χειροκίνητα, όχι μέσω admin dashboard ακόμα), κρατάμε τη
-- δική μας "φωτογραφία" τη στιγμή του favorite και τη συγκρίνουμε ζωντανά με
-- τα τρέχοντα events.title/events.date στο query (useFanFavoriteEvents.js).
create table public.event_favorites (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references public.fans(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  snapshot_title text,
  snapshot_date timestamptz,
  created_at timestamptz not null default now(),
  unique (fan_id, event_id)
);

alter table public.event_favorites enable row level security;

create policy "Fans can view own event favorites"
on public.event_favorites for select
using (auth.uid() = fan_id);

create policy "Fans can insert own event favorites"
on public.event_favorites for insert
with check (auth.uid() = fan_id);

create policy "Fans can delete own event favorites"
on public.event_favorites for delete
using (auth.uid() = fan_id);
