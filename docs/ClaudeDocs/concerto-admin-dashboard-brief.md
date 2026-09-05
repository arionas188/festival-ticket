# CONCERTO — TENANT ADMIN DASHBOARD & AUTH (Ξεχωριστό Brief)

## Σκοπός αυτού του εγγράφου

Αυτό είναι **ξεχωριστό task/κομμάτι δουλειάς** από το κύριο Concerto brief (fans/events/tickets). Αφορά το πώς οι **ίδιοι οι tenants** (artists, bands, festivals — π.χ. οι Villagers) θα μπαίνουν σε ένα δικό τους Dashboard για να διαχειρίζονται τα δεδομένα τους, χωρίς να χρειάζεται να μπαίνουν στο Supabase SQL Editor.

---

## Γιατί είναι ξεχωριστό σύστημα (όχι επέκταση του fan login)

Υπάρχουν **δύο εντελώς διαφορετικοί τύποι χρηστών** στο Concerto, με διαφορετικά δικαιώματα, διαφορετικό entry point, και διαφορετική λογική βάσης δεδομένων:

| | **Fans** (ήδη σχεδιασμένο/υλοποιείται) | **Tenant Admins** (αυτό το brief) |
|---|---|---|
| **Ποιος είναι** | Ο θαυμαστής που παρακολουθεί/αγοράζει ticket | Ο ίδιος ο artist / μάνατζερ (π.χ. των Villagers) |
| **Πού μπαίνει** | Δημόσιο site tenant (π.χ. `villagers.concerto.gr`) | Ξεχωριστό admin URL (π.χ. `villagers.concerto.gr/dashboard` ή κεντρικό `dashboard.concerto.gr`) |
| **Τι κάνει** | Follow, αγορά ticket, προβολή events | CRUD πάνω σε events, tickets, branding, βλέπει δικούς του fans/analytics |
| **Login μηχανισμός** | Google/Apple OAuth (ήδη ρυθμισμένο στο Supabase) | Πιθανόν ξεχωριστό flow — να αποφασιστεί (βλ. παρακάτω) |
| **DB table** | `fans` | Νέο table: `tenant_admins` |
| **Λογική πρόσβασης (RLS)** | "Βλέπω μόνο το δικό μου fan profile" | "Βλέπω/επεξεργάζομαι ΜΟΝΟ δεδομένα του tenant_id που διαχειρίζομαι" |

**Κρίσιμος λόγος διαχωρισμού:** Ένας fan δεν πρέπει ΠΟΤΕ να μπορεί να διαγράψει/επεξεργαστεί ένα event. Ένας tenant admin του Villagers δεν πρέπει ΠΟΤΕ να βλέπει ή να επεξεργάζεται δεδομένα του Athens Rock Festival. Αυτά τα δύο συστήματα πρέπει να παραμείνουν τεχνικά ξεχωριστά για να μην υπάρχει κίνδυνος διαρροής δικαιωμάτων.

---

## Τι θα περιέχει το Dashboard (λειτουργικός στόχος)

Ο κάθε tenant admin θα μπορεί να διαχειρίζεται, χωρίς SQL:

1. **Branding** (`tenant_settings`) — logo, χρώματα, cover image, bio
2. **Events** — δημιουργία, επεξεργασία, διαγραφή events, upload αφίσας
3. **Tickets** — δημιουργία custom τύπων ανά event (όνομα, τιμή, ποσότητα), ενεργοποίηση/απενεργοποίηση, επεξεργασία τιμών/ποσοτήτων εν κινήσει
4. **Fans/Analytics** (μόνο ΔΙΚΟΙ ΤΟΥ fans) — ποιοι έχουν κάνει follow, στατιστικά πωλήσεων tickets ανά event/τύπο
5. **✅ Cross-listing events (νέο, αποφασίστηκε — βλ. `concerto-business-venue-partnerships-brief.md`)** — ένας tenant (π.χ. venue/live stage) μπορεί να "προτείνει" ένα δικό του event προς εμφάνιση στη σελίδα άλλου tenant (π.χ. της μπάντας που παίζει εκεί), και αντίστροφα. Ο admin του tenant-παραλήπτη βλέπει λίστα εκκρεμών αιτημάτων (`event_listings` table, status `pending`) και εγκρίνει/απορρίπτει. Μετά την έγκριση, το event εμφανίζεται πλήρως λειτουργικό (ticket purchase κ.λπ.) στη σελίδα-παραλήπτη, αλλά **τα έσοδα πάντα πάνε στον αρχικό ιδιοκτήτη** (`events.tenant_id`, αμετάβλητο) — καμία μεταφορά χρημάτων, μόνο προβολή. Σκοπός: αποφυγή scam/κατάχρησης χωρίς άδεια.
6. *(Μελλοντικά)* Merchandising, εξαγωγή δεδομένων, ρυθμίσεις ειδοποιήσεων

---

## Τεχνική υλοποίηση — βήματα (πρόταση σειράς)

### 1. Νέο DB table: `tenant_admins`

**✅ ΑΠΟΦΑΣΙΣΤΗΚΕ (μέσω business brief `concerto-business-venue-partnerships-brief.md`): ΝΑΙ, ένας admin/manager πρέπει να μπορεί να διαχειρίζεται πολλαπλούς tenants** (π.χ. ένας manager για Tenant 1, Tenant 200, Tenant 35 ταυτόχρονα) — many-to-many σχέση, όχι 1-προς-1:

```sql
create table tenant_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text default 'admin',   -- πιθανή μελλοντική διαφοροποίηση (owner/editor κ.λπ.)
  created_at timestamptz default now(),
  unique (user_id, tenant_id)  -- δεν μπορεί διπλή γραμμή για ίδιο admin+tenant
);
```

**Επιβεβαίωση ταυτότητας manager:** Στο τρέχον, αρχικό στάδιο, γίνεται **χειροκίνητα** από τον ιδιοκτήτη της πλατφόρμας (προσωπική επιβεβαίωση, μη αυτοματοποιημένη) — μελλοντικά μπορεί να χρειαστεί invite-link/token σύστημα ώστε ένας ήδη υπάρχων tenant owner να προσκαλεί ο ίδιος συνεργάτες/managers.

**Use case που επιβεβαίωσε αυτή την απόφαση:** Venues/live stages που θέλουν να γίνουν δικοί τους tenants μέσα στο Concerto (όχι μόνο artists) — ο ίδιος μηχανισμός Dashboard εξυπηρετεί και τους δύο τύπους tenant (artist ή venue) χωρίς διαφοροποίηση στο schema.

### 2. Νέο DB table: `event_listings` (cross-listing με έγκριση)
```sql
create table event_listings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  listed_tenant_id uuid not null references tenants(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references auth.users(id),
  created_at timestamptz default now(),
  approved_at timestamptz,
  unique (event_id, listed_tenant_id)
);
```
`events.tenant_id` παραμένει πάντα ο μοναδικός ιδιοκτήτης-πληρωμής. Αυτό το table είναι μόνο "αιτήματα προβολής" σε άλλες σελίδες tenant, με ρητή έγκριση από τον admin του tenant-παραλήπτη. Δεν έχει οριστεί ακόμα αν χρειάζεται σκληρό χρονικό όριο (π.χ. 24ωρο expiry) για την έγκριση.

### 3. Ξεχωριστό auth flow
Να αποφασιστεί:
- Email + password (πιο απλό, πιο "παραδοσιακό" για B2B χρήση), ή
- Google OAuth ξεχωριστό context/flow (χρειάζεται προσοχή ώστε να μη μπερδεύεται με το fan OAuth flow που ήδη υπάρχει)

### 4. RLS policies πάνω στα υπάρχοντα tables
Θα χρειαστεί να προστεθούν νέες policies (πέραν των ήδη υπαρχόντων "public read") σε: `events`, `tickets`, `tenant_settings` — κάτι στο πνεύμα:
```sql
create policy "Admins can manage own tenant events"
on events for all
using (
  exists (
    select 1 from tenant_admins
    where tenant_admins.id = auth.uid()
    and tenant_admins.tenant_id = events.tenant_id
  )
);
```
*(Ενδεικτικό — θα οριστικοποιηθεί όταν φτάσουμε στην υλοποίηση.)*

### 5. Frontend Dashboard UI
Νέα, ξεχωριστή React εφαρμογή/route (όχι μέρος του public-facing tenant site) — φόρμες CRUD, πίνακες, upload εικόνων. Θα περιλαμβάνει και UI για έγκριση/απόρριψη cross-listing αιτημάτων (βλ. σημείο 2 παραπάνω).

---

## Status

**Δεν έχει ξεκινήσει καθόλου η υλοποίηση.** Αυτό το brief υπάρχει για σχεδιασμό/ανάθεση εργασίας. Μπορεί να δουλευτεί παράλληλα με το κύριο fan-facing κομμάτι (βλ. κύριο brief), αφού είναι τεχνικά ανεξάρτητο σύστημα — απλά μοιράζεται την ίδια βάση δεδομένων (Supabase project).

## Εξαρτήσεις από το κύριο project
- Χρειάζεται τα ήδη υπάρχοντα tables: `tenants`, `events`, `tickets`, `tenant_settings` (όλα έτοιμα ✅)
- Δεν εξαρτάται από το fan auth/OAuth flow — τελείως ξεχωριστό
- **Σχετίζεται στενά με** `concerto-business-venue-partnerships-brief.md` (business πλαίσιο/κίνητρο για venue tenants + cross-listing feature)

---

## Οδηγία προς AI assistant (Claude ή άλλο)

> Αυτό είναι ξεχωριστό, ανεξάρτητο σύστημα από το fan-facing κομμάτι του Concerto. Μην ανακατεύεις τη λογική/tables του tenant admin auth με αυτή των fans. **✅ Ήδη αποφασισμένο, μην ξαναρωτήσεις:** ένας admin/manager ΜΠΟΡΕΙ να διαχειρίζεται πολλαπλούς tenants (many-to-many `tenant_admins`, βλ. σημείο 1 παραπάνω). Πριν προχωρήσεις σε υλοποίηση, επιβεβαίωσε μόνο: ποιος μηχανισμός auth θα χρησιμοποιηθεί (email/password vs Google OAuth ξεχωριστό flow) — αυτό παραμένει ανοιχτό.
