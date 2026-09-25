-- ============================================================
-- Tenant Admin Dashboard — βήμα 3: δημιουργία event από την αρχή
-- (13/9, ρητό αίτημα χρήστη — "add event" wizard στο public tenant-site,
-- ίδιο "Facebook Page admin" inline μοτίβο με cover/logo/bio).
--
-- Μέχρι τώρα events/tickets είχαν ΜΟΝΟ public read policy (βλ. σχόλιο στο
-- band_members migration: "καμία write policy ακόμα, θα προστεθεί μαζί με
-- το μελλοντικό Tenant Admin Dashboard" — αυτό είναι εκείνο το βήμα).
--
-- Ίδιος μηχανισμός με tenant_settings/tenant-images: μόνο πραγματικός
-- admin ΤΟΥ tenant (μέσω tenant_admins) μπορεί να γράψει. Για tickets,
-- δεν υπάρχει tenant_id απευθείας στη γραμμή — ελέγχουμε μέσω του event_id
-- ότι το ίδιο το event ανήκει σε tenant που διαχειρίζεται ο χρήστης.
-- ============================================================

-- --- events: insert/update/delete μόνο από admin του ίδιου tenant ---

drop policy if exists "tenant admins can create their own tenant events" on public.events;
create policy "tenant admins can create their own tenant events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = events.tenant_id
    )
  );

drop policy if exists "tenant admins can update their own tenant events" on public.events;
create policy "tenant admins can update their own tenant events"
  on public.events for update
  using (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = events.tenant_id
    )
  )
  with check (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = events.tenant_id
    )
  );

drop policy if exists "tenant admins can delete their own tenant events" on public.events;
create policy "tenant admins can delete their own tenant events"
  on public.events for delete
  using (
    exists (
      select 1 from public.tenant_admins ta
      where ta.user_id = auth.uid()
        and ta.tenant_id = events.tenant_id
    )
  );

-- --- tickets: ίδιο, αλλά μέσω του tenant_id του γονικού event ---

drop policy if exists "tenant admins can create tickets for their own events" on public.tickets;
create policy "tenant admins can create tickets for their own events"
  on public.tickets for insert
  with check (
    exists (
      select 1 from public.events e
      join public.tenant_admins ta on ta.tenant_id = e.tenant_id
      where e.id = tickets.event_id
        and ta.user_id = auth.uid()
    )
  );

drop policy if exists "tenant admins can update tickets for their own events" on public.tickets;
create policy "tenant admins can update tickets for their own events"
  on public.tickets for update
  using (
    exists (
      select 1 from public.events e
      join public.tenant_admins ta on ta.tenant_id = e.tenant_id
      where e.id = tickets.event_id
        and ta.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      join public.tenant_admins ta on ta.tenant_id = e.tenant_id
      where e.id = tickets.event_id
        and ta.user_id = auth.uid()
    )
  );

drop policy if exists "tenant admins can delete tickets for their own events" on public.tickets;
create policy "tenant admins can delete tickets for their own events"
  on public.tickets for delete
  using (
    exists (
      select 1 from public.events e
      join public.tenant_admins ta on ta.tenant_id = e.tenant_id
      where e.id = tickets.event_id
        and ta.user_id = auth.uid()
    )
  );

-- Sanity check (τρέξε ξεχωριστά, read-only):
--   select policyname, cmd from pg_policies where tablename in ('events','tickets') order by tablename, cmd;
--   -- πρέπει να δείξει: events → select/insert/update/delete, tickets → select/insert/update/delete.
