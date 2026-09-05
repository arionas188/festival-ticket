# CONCERTO PLATFORM — PROJECT BRIEF (Πλήρως ενημερωμένο)

## Τι είναι το Concerto

SaaS white-label πλατφόρμα για artists, bands και festivals. Κάθε artist αποκτά το δικό του ψηφιακό "σπίτι" (π.χ. `villagers.concerto.gr`, αργότερα δικό του domain όπως `www.villagersband.com`), από όπου διαχειρίζεται:
- Events
- Εισιτήρια (custom τύποι ανά event — βλ. παρακάτω)
- Merchandising (μελλοντικό)
- Fans CRM
- Dashboard διαχείρισης (δεν έχει χτιστεί ακόμα)

---

## Business Model

**Δεν** λειτουργούμε σαν marketplace (π.χ. more.com) — δεν κρατάμε προμήθεια ανά ticket sale.

**Phase 1 (τώρα):** Πώληση white-label setup ανά artist:
- Μικρός artist: 500–1000€
- Μεσαίο συγκρότημα: 1000–3000€
- Festival: 5000€+

**Phase 2 (μελλοντικά):** Κεντρική πλατφόρμα `concerto.gr`, ενιαίο fan account. Έσοδα από **fan subscriptions** (δες παρακάτω "Fan Subscription Tiers" — νέα, σημαντική απόφαση).

---

## Αρχιτεκτονική (τεχνική βάση)

- **Frontend:** React + Vite + Tailwind + shadcn/ui (Radix primitives)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Μοντέλο:** Multi-tenant SaaS — ένα backend, πολλοί tenants (κάθε artist/festival = 1 tenant)

### Κανόνας εργασίας με AI assistant (ΑΥΣΤΗΡΟΣ — ισχύει σε ΟΛΟ το project, κάθε task, κάθε brief)
Το AI λειτουργεί σαν senior developer: όταν δίνεται έτοιμος κώδικας/component reference (π.χ. Radix UI, Tailwind Plus, shadcn), **ακολουθείται πιστά και αυστηρά η δομή του** — ίδια primitives, ίδιες Tailwind classes, ίδια αρχιτεκτονική. **Απαγορεύεται ο αυτοσχεδιασμός** ή αντικατάσταση με δική του εναλλακτική δομή, ακόμα κι αν φαίνεται "καλύτερη". Προσαρμογή επιτρέπεται ΜΟΝΟ σε data/props/business logic — ποτέ στην αρχιτεκτονική του UI component. Ισχύει εξίσου σε κάθε ξεχωριστό task/brief (π.χ. Tenant Admin Dashboard).

**Εξαίρεση/απόφαση — σύγκρουση βιβλιοθηκών modal (αποφασίστηκε):** Όταν ο χρήστης στέλνει reference component από Tailwind Plus χτισμένο με **διαφορετική** βιβλιοθήκη από αυτή που ήδη χρησιμοποιεί το project (π.χ. `@headlessui/react` αντί για `radix-ui` που ήδη χρησιμοποιούμε παντού — Dialog, Tabs, Sheet), το AI **δεν εγκαθιστά τη νέα βιβλιοθήκη**. Αντ' αυτού, αναπαράγει το **ίδιο ακριβώς οπτικό αποτέλεσμα** (layout, Tailwind classes, θέση στοιχείων) χρησιμοποιώντας τα ήδη υπάρχοντα Radix primitives του project (`@/components/ui/dialog`, κ.λπ.). Λόγος: αποφυγή δύο παράλληλων modal-συστημάτων στο ίδιο project (πρόβλημα συντήρησης, αυξημένο bundle size, ασυνέπεια). Ο χρήστης δεν χάνει τίποτα οπτικά — μόνο η "μηχανή" από κάτω αλλάζει σε κάτι ήδη υπάρχον στο project.

**⚠️ ΚΑΝΟΝΑΣ (προστέθηκε μετά από σοβαρό debugging session, ΑΥΣΤΗΡΟΣ): Πριν από ΚΑΘΕ διόρθωση/ενημέρωση σε ήδη υπάρχον αρχείο, το AI ζητάει πρώτα το τρέχον, πραγματικό περιεχόμενο του αρχείου από τον χρήστη — ΠΟΤΕ δεν διορθώνει βασισμένο στη μνήμη/σε ό,τι "θυμάται" ότι είχε δώσει προηγουμένως.** Λόγος: επαναλαμβανόμενα, πραγματικά bugs προέκυψαν όταν το AI έδωσε "διορθώσεις" πάνω σε παλιά, μη ενημερωμένη εκδοχή ενός αρχείου (π.χ. λειτουργίες που ξαναχάθηκαν επειδή δεν είχε δει τις πιο πρόσφατες αλλαγές του χρήστη). Εξαίρεση: εντελώς νέα αρχεία δεν χρειάζονται αυτό το βήμα.

**⚠️ ΚΑΝΟΝΑΣ (React Router, προστέθηκε πριν το routing task): Επέκταση του κανόνα Radix/Tailwind και στο React Router.** Το AI ακολουθεί **πιστά το επίσημο "Data Router" pattern** από την τεκμηρίωση `reactrouter.com` (`createBrowserRouter`, `<RouterProvider>`) — καμία δική του παραλλαγή/αυτοσχεδιασμός στο πώς στήνεται το routing. **Επιπλέον, ρητά αποφασίστηκε ότι το routing ΔΕΝ είναι "όλα ή τίποτα":** μπορεί να εφαρμοστεί **επιλεκτικά**, μόνο σε κομμάτια που πραγματικά το χρειάζονται (π.χ. μοιράσιμα links σε products/events), ενώ άλλα κομμάτια (π.χ. εσωτερικά tabs) μπορούν να παραμείνουν απλό React state, όπως ήδη λειτουργούν. **Σε κάθε νέο κομμάτι/feature (π.χ. μελλοντικό Tenant Admin Dashboard), το AI δεν προτείνει αυτόματα routing — σταματάει και σκέφτεται μαζί με τον χρήστη αν πραγματικά αξίζει** (χρειάζεται μοιράσιμο URL; θα μεγαλώσει αρκετά για να αξίζει code-splitting;), παρουσιάζοντας τα υπέρ/κατά και των δύο επιλογών, πριν αποφασιστεί από κοινού. **Σημαντική διευκρίνιση για ταχύτητα:** η απουσία router ΔΕΝ κάνει από μόνη της κάτι πιο αργό — το bundle size είναι το πραγματικό κριτήριο, και ξεχωριστές εφαρμογές (π.χ. το μελλοντικό Dashboard σε ξεχωριστό subdomain) ήδη έχουν ξεχωριστό, μικρότερο bundle ανεξάρτητα από το αν έχουν router μέσα τους ή όχι.

---

## 🔑 ΣΗΜΑΝΤΙΚΗ ΑΠΟΦΑΣΗ: Bfcache (Back-Forward Cache) fix

**Πρόβλημα που εντοπίστηκε (Σάββατο, πριν το routing task):** Πατώντας το φυσικό κουμπί "πίσω"/"μπροστά" του browser, ο fan εμφανιζόταν εναλλάξ "αποσυνδεδεμένος"/"συνδεδεμένος", παρόλο που το πραγματικό session του παρέμενε έγκυρο.

**Τεκμηριωμένη αιτία (έρευνα, πολλαπλές ανεξάρτητες πηγές — web.dev/Chrome, DEV Community, τεκμηρίωση browser vendors):** Οι browsers "παγώνουν" ολόκληρη τη σελίδα (bfcache — back/forward cache) όταν φεύγεις από αυτήν, για ταχύτητα, και σε navigation πίσω/μπροστά απλά **επαναφέρουν** το παγωμένο στιγμιότυπο **χωρίς να ξανατρέξει κώδικας** — δείχνοντας παλιά, "στάσιμη" κατάσταση αντί για την πραγματική τρέχουσα.

**Δεν είναι κάτι που λύνει το React Router** (διαφορετικό πρόβλημα — routing λύνει URL↔περιεχόμενο matching, όχι bfcache staleness). Χρειάζεται ξεχωριστό, μικρό, επίσημα τεκμηριωμένο fix:

```jsx
// Μέσα στο useAuth.js
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // Η σελίδα επανήλθε από bfcache — ξανάλεγξε το πραγματικό session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }
})
```

**Status:** Αποφασίστηκε να διορθωθεί **πριν** ξεκινήσει το React Router task, στην ίδια συνεδρία.

---

## 🔑 ΣΗΜΑΝΤΙΚΗ ΑΠΟΦΑΣΗ: Μοντέλο Fan Ownership & Authentication

Αυτό είναι το πιο κρίσιμο αρχιτεκτονικό κομμάτι που αποφασίστηκε σήμερα, γιατί καθορίζει το πώς θα δουλεύει ολόκληρη η πλατφόρμα.

### Το μοντέλο:

- **Ο fan ανήκει στο Concerto, όχι στον tenant.** Ένας ενιαίος, κεντρικός λογαριασμός fan, ανεξάρτητα από ποιο tenant site επισκέπτεται πρώτα.
- **Entry point παραμένει per-tenant (Phase 1 UX):** Ο fan μπαίνει μέσα από το site ενός συγκεκριμένου artist (π.χ. `villagers.concerto.gr`) — δεν ξέρει καν ότι υπάρχει κεντρικό "Concerto" brand.
- **Το authentication είναι όμως ήδη κεντρικό (Concerto-level), τεχνικά, από τώρα.** Όταν ο fan κάνει sign in (μέσω Google/Apple) σε οποιοδήποτε tenant site, αναγνωρίζεται ως ο ίδιος fan αν ξαναϐρεθεί σε άλλο tenant site με το ίδιο account.
- Αυτό σημαίνει ότι φέραμε τεχνικά το "Phase 2" (κεντρικό fan account) **νωρίτερα** απ' ό,τι αρχικά σχεδιάζαμε, ενώ το UX παραμένει Phase 1 (site-per-tenant).

### Ορατότητα δεδομένων (πολύ σημαντικό για privacy/λειτουργία):

| Ποιος | Τι βλέπει |
|---|---|
| **Concerto (εμείς)** | Πλήρη ορατότητα σε ΟΛΟΥΣ τους fans, ΟΛΕΣ τις αγορές τους, από ΟΛΑ τα tenants — global CRM/analytics |
| **Κάθε tenant (artist)** | ΜΟΝΟ τους δικούς του fans (που έκαναν follow/αγόρασαν από αυτόν) και ΜΟΝΟ τις δικές του αγορές — καμία ορατότητα σε άλλα tenants |

Αυτό θα επιβάλλεται τεχνικά μέσω Row Level Security (RLS) στη βάση δεδομένων — δεν είναι απλά "καλή πρόθεση", είναι τεχνικά αδύνατο για έναν tenant να δει δεδομένα άλλου.

### Sign-in μέσω Google + Apple

- **Google Sign-In:** Δωρεάν, γρήγορο setup (~15-20 λεπτά), καλύπτει την πλειοψηφία χρηστών. **Θα ξεκινήσουμε με αυτό.**
- **Apple Sign-In:** Απαιτεί ενεργό Apple Developer Program ($99/έτος), πιο περίπλοκο setup. Δεν είναι υποχρεωτικό σε website (μόνο σε iOS apps με άλλα 3rd-party logins). Καλό να προστεθεί αργότερα, ειδικά αν φτιάξουμε iOS app.
- **Auto-fill προφίλ:** Όταν ο fan κάνει sign in με Google, παίρνουμε αυτόματα email, πλήρες όνομα, φωτογραφία προφίλ — προσυμπληρώνουν τη φόρμα profile, αλλά ο fan μπορεί να τα επεξεργαστεί ελεύθερα.

---

## 🔑 ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΑΠΟΦΑΣΗ: Local (TenantTopBar) vs Global (ConcertoGlobalBar) Search — δύο ξεχωριστά components

Αποσαφηνίστηκε σήμερα, σημαντικό για να μην μπερδευτούν στο μέλλον.

**`TenantTopBar`** (χτίζεται τώρα):
- Ζει **μέσα** σε κάθε tenant site (π.χ. `villagers.concerto.gr`)
- Εμφανίζεται στη **θέση του κουμπιού "Ακολούθησε"** στο Header, μόλις ο fan κάνει σύνδεση (βλ. Header logic παρακάτω)
- Περιεχόμενο: search bar (ψάχνει **μόνο** μέσα στα δεδομένα *αυτού* του tenant — events, tickets, merch), εικονίδια avatar / favorites / καλάθι / γλώσσα (placeholder για μελλοντική πολυγλωσσία)
- Τεχνικά: search πάνω σε ήδη cached δεδομένα (React Query hooks — `useEvents`, `useProducts` κ.λπ.), απλό client-side filtering αρκεί σε αυτή την κλίμακα

**`ConcertoGlobalBar`** (μελλοντικό, ΔΕΝ χτίζεται τώρα — Phase 2, όταν υπάρξει η κεντρική πλατφόρμα `concerto.gr`):
- Θα υπάρχει **πάνω/έξω** από κάθε tenant site, sticky, ανεξαρτήτως ποιο tenant επισκέπτεται ο fan
- Search **σε όλους τους tenants ταυτόχρονα** — πολύ μεγαλύτερο εύρος δεδομένων· ενδεχομένως θα χρειαστεί διαφορετική τεχνική λύση από απλό client-side filtering (π.χ. Postgres full-text search σε επίπεδο πλατφόρμας, ή αργότερα ξεχωριστό search index αν μεγαλώσει πολύ ο όγκος δεδομένων)
- Δεν σχεδιάζεται ακόμα σε λεπτομέρεια — απλά διασφαλίζουμε ότι το naming (`TenantTopBar` όχι απλά `TopBar`) αφήνει καθαρό χώρο να προστεθεί αργότερα χωρίς σύγκρουση/μπέρδεμα ονομάτων.

---



## 🔑 ΣΗΜΑΝΤΙΚΗ ΑΠΟΦΑΣΗ: Fan Subscription Tiers (νέο monetization layer)

Ιδέα που προέκυψε σήμερα: αντί για απλό, στατικό όριο "1 ticket ανά fan ανά event", το όριο συνδέεται με το **subscription tier** του fan — μετατρέπει ένα τεχνικό μπλοκάρισμα σε πηγή εσόδων.

| Tier | Μέγιστα tickets/event/τύπο | Τιμή (ενδεικτικό, να οριστικοποιηθεί) |
|---|---|---|
| **Free** | 1 | Δωρεάν |
| **Plus** | 2 | π.χ. 2-3€/μήνα |
| **Pro+** | 4 | π.χ. 5-6€/μήνα |
| **Business** | Απεριόριστα/custom | Custom τιμή |

**Στάδιο υλοποίησης:** Ξεκινάμε **μόνο με Free tier** τώρα (χωρίς εφαρμοσμένο περιορισμό ακόμα), αλλά **η βάση δεδομένων είναι ήδη χτισμένη** για να υποστηρίξει τα tiers χωρίς restructuring αργότερα (το `fans.tier` column υπάρχει ήδη, default `'free'`).

**Λόγος πίσω από τον περιορισμό:** Αποφυγή bulk-αγορών από μεσάζοντες/scalpers που αγοράζουν πολλά tickets για λογαριασμό παρέας, κάτι που θα υπονόμευε το μοντέλο "κάθε ticket = πραγματικός, μεμονωμένος fan με δικό του λογαριασμό".

---

## 🔑 ΣΗΜΑΝΤΙΚΗ ΣΥΖΗΤΗΣΗ: Race Conditions & Overselling (τεχνική ασφάλεια αγορών)

Συζητήθηκε το σενάριο: δημοφιλές event, 200 early-bird tickets, μπαίνουν 210+ άτομα ταυτόχρονα να αγοράσουν — τι εμποδίζει το overselling;

### Λύση (θα υλοποιηθεί όταν φτιαχτεί το checkout flow):

**Πρόβλημα Α — Δύο ταυτόχρονες αγορές "κλέβουν" το ίδιο τελευταίο ticket:**
Λύνεται με **atomic database update** (καθαρά PostgreSQL/Supabase feature, ΔΕΝ χρειάζεται 3rd party software):
```sql
UPDATE tickets
SET quantity_sold = quantity_sold + 1
WHERE id = X AND quantity_sold + 1 <= quantity
RETURNING *;
```
Αν δεν υπάρχει διαθεσιμότητα, η εντολή απλά επιστρέφει 0 rows — αδύνατο overselling, εγγυημένο από την ίδια τη βάση.

**Πρόβλημα Β — Κάποιος βάζει tickets στο καλάθι και αργεί στην πληρωμή:**
Θα χρειαστεί μηχανισμός **reservation/hold με λήξη χρόνου** (π.χ. 10 λεπτά) — νέο table `orders` με status `pending/completed/expired` και `expires_at` timestamp. Δεν έχει χτιστεί ακόμα, είναι επόμενο βήμα.

**Πρόβλημα Γ — Πολύ μεγάλο traffic spike (π.χ. 10.000 άτομα ταυτόχρονα σε πολύ δημοφιλές event):**
Αυτό είναι θέμα **server capacity**, όχι μόνο database correctness. Λύση: εργαλεία τύπου **Queue-it** ή **Queue-Fair** (virtual waiting room, βάζει κόσμο σε ουρά πριν καν φτάσουν στο site). **Δεν χρειάζεται τώρα** στο MVP στάδιο — το κρατάμε ως μελλοντική επιλογή αν φτάσουμε σε μεγάλη κλίμακα.

---

## 🔑 ΑΣΦΑΛΕΙΑ & ΝΟΜΙΚΗ ΣΥΜΜΟΡΦΩΣΗ (GDPR) — Must-do πριν το launch

Ερευνήθηκε σήμερα τι καλύπτει το Supabase αυτόματα και τι είναι δική μας ευθύνη.

### Ήδη καλύπτεται από το Supabase (χωρίς επιπλέον δουλειά):
- DDoS protection στο edge (μέσω Cloudflare) + fail2ban για brute-force login attempts
- Encryption: AES-256 (data at rest) + TLS (data in transit)
- Πιστοποιήσεις: SOC 2 Type 2, ISO/IEC 27001:2022, GDPR-ready infrastructure

### Δική μας ευθύνη (να γίνει πριν το launch):
1. **✅ Already done:** Σωστά σχεδιασμένες RLS policies σε κάθε table (βασική άμυνα ώστε κανείς να μη βλέπει δεδομένα που δεν του ανήκουν)
2. **⚠️ TODO:** Επιβεβαίωση ότι το Supabase project είναι ρυθμισμένο σε **EU region** (π.χ. Frankfurt) — κρίσιμο για GDPR data residency. Να ελεγχθεί άμεσα.
3. **⚠️ TODO:** Privacy Policy + Terms of Service (νομικό κείμενο, χρειάζεται δικηγόρο ή καλό template προσαρμοσμένο στην Ελλάδα) — εξηγεί τι δεδομένα συλλέγουμε, γιατί, για πόσο.
4. **⚠️ TODO:** Μηχανισμός διαγραφής λογαριασμού/δεδομένων (GDPR "right to be forgotten") — τεχνικά διευκολύνεται ήδη από τα `on delete cascade` foreign keys που έχουμε βάλει.
5. **⚠️ Μελλοντικό (όταν μεγαλώσει η κίνηση):** Rate limiting σε επίπεδο εφαρμογής (π.χ. στο ticket purchase endpoint) — σχετίζεται και με το πρόβλημα overselling.
6. **✅ ΟΛΟΚΛΗΡΩΘΗΚΕ — RLS Audit πλήρους βάσης:** Τεκμηριωμένο εύρημα (έρευνα ασφαλείας 2026) που το προκάλεσε: **το 83% των παραβιάσεων Supabase προέρχεται από λάθος ρυθμισμένο/ξεχασμένο RLS σε κάποιο table**. Έγινε πλήρης έλεγχος όλων των 10 tables (`pg_tables`/`pg_policies` queries) — αποτέλεσμα: όλα σωστά προστατευμένα, μηδενικές πραγματικές τρύπες. Λεπτομέρειες στο status section παρακάτω.

### 🔑 Anon key vs service_role key — τεκμηριωμένη διευκρίνιση (σημαντική, να μην ξαναρωτηθεί)

**Ερώτηση που προέκυψε:** "Χρειαζόμαστε Next.js για λόγους ασφάλειας των κλειδιών της βάσης;"

**Τεκμηριωμένη απάντηση (επίσημη τεκμηρίωση Supabase):** Όχι. Το κλειδί που ήδη χρησιμοποιεί το project (`VITE_SUPABASE_ANON_KEY`) είναι **σχεδιασμένο από τη Supabase να είναι δημόσιο** — προορίζεται να "ζει" μέσα σε browser κώδικα. Η ασφάλεια **δεν** προέρχεται από το να κρύβεται αυτό το κλειδί, αλλά αποκλειστικά από τα RLS policies. Ακόμα κι αν κάποιος το εξάγει από το JavaScript bundle (τετριμμένο, μέσω Developer Tools), δεν αποκτά τίποτα πέρα από ό,τι επιτρέπουν ρητά τα RLS policies.

Το πραγματικά επικίνδυνο κλειδί λέγεται **`service_role`** — αυτό παρακάμπτει **εντελώς** όλα τα RLS policies, δίνει πλήρη πρόσβαση admin σε ολόκληρη τη βάση. **Δεν έχει χρησιμοποιηθεί πουθενά σε αυτό το project** — μόνο το ασφαλές, δημόσιο anon key, σωστά συνδυασμένο με RLS. Καμία ανάγκη migration σε Next.js για αυτό τον λόγο.

**Πότε θα χρειαστεί πραγματικά κάποιο "backend" component (όχι απαραίτητα Next.js):** Μόνο όταν φτάσουμε στο **Checkout/πληρωμές** (π.χ. Stripe) — εκεί υπάρχει πραγματικό μυστικό κλειδί (του payment processor) που δεν πρέπει ποτέ να εκτεθεί στον browser. Λύση: μία **μικρή serverless function** (π.χ. Netlify Functions, αφού το project ήδη φιλοξενείται εκεί, ή Supabase Edge Functions) — **όχι** πλήρης μεταφορά σε Next.js/framework migration. Θα προστεθεί σαν μικρό, ξεχωριστό κομμάτι όταν χτιστεί το Checkout/reservation flow task.

**Ρεαλιστική εκτίμηση κινδύνου:** Στο MVP στάδιο, με μικρό αριθμό χρηστών, ο κίνδυνος DDoS/breach είναι χαμηλός. Το μεγαλύτερο πρακτικό ρίσκο δεν είναι εξωτερική επίθεση, αλλά **ανθρώπινο λάθος σε RLS policy** (π.χ. να ξεχαστεί ένα φίλτρο tenant_id, ή ένα table χωρίς καθόλου RLS) — γι' αυτό δίνεται μεγάλη προσοχή σε κάθε νέο table, και γι' αυτό προστέθηκε το πλήρες audit ως TODO #6 παραπάνω.

---

## 🔑 SCALABILITY — Database Indexing (σημαντικό, πριν το launch)

Ερευνήθηκε σήμερα: 20.000+ fans **δεν** είναι πρόβλημα για PostgreSQL/Supabase από μόνο του — βρέθηκαν παραδείγματα production Supabase backends που εξυπηρετούν 50.000+ ενεργούς χρήστες. Το πρόβλημα δεν είναι ποτέ ο αριθμός χρηστών, αλλά το πώς είναι γραμμένα τα queries/schema.

**Σημαντική διευκρίνιση για το auth:** Το μοντέλο "auth σε ξεχωριστή βάση" (π.χ. όπως λειτουργούν μεγάλα apps) **ήδη υπάρχει από μόνο του** — το Supabase Auth κρατάει τους χρήστες σε ξεχωριστό internal schema (`auth.users`), απομονωμένο από τα δικά μας application tables. Το `fans` table απλά δείχνει εκεί με FK. Καμία επιπλέον αρχιτεκτονική αλλαγή δεν χρειάζεται για αυτό.

**⚠️ TODO — ΔΕΝ έχει γίνει ακόμα, πραγματικό εκκρεμές task:** Η PostgreSQL βάζει αυτόματα index ΜΟΝΟ στο primary key (`id`) κάθε table — ΟΧΙ αυτόματα σε foreign keys. Χρειάζεται να προστεθούν ρητά indexes σε κάθε FK column που χρησιμοποιείται σε RLS policies ή WHERE clauses, π.χ.:
```sql
create index idx_events_tenant_id on events(tenant_id);
create index idx_tickets_event_id on tickets(event_id);
create index idx_products_tenant_id on products(tenant_id);
create index idx_tenant_domains_tenant_id on tenant_domains(tenant_id);
create index idx_tenant_settings_tenant_id on tenant_settings(tenant_id);
create index idx_tenant_follows_fan_id on tenant_follows(fan_id);
create index idx_tenant_follows_tenant_id on tenant_follows(tenant_id);
create index idx_favorites_fan_id on favorites(fan_id);
create index idx_favorites_product_id on favorites(product_id);
```
Φθηνό/γρήγορο να γίνει τώρα, πολύ πιο ακριβό (performance issues σε production) αν ξεχαστεί.

**✅ N+1 queries — ήδη αποφεύγονται σωστά, καμία αλλαγή δεν χρειάζεται.** Κάθε query hook (`useEvents`, `useTickets`, `useProducts`) κάνει ένα ενιαίο φιλτραρισμένο query για ολόκληρη τη λίστα (`.eq('tenant_id', ...)`), όχι loop με ξεχωριστό query ανά αντικείμενο. Να συνεχίσει αυτό το pattern σε κάθε νέο hook.

---

## 🔑 ΣΗΜΑΝΤΙΚΟ UX/ARCHITECTURE GAP: Απουσία πραγματικού Routing (εντοπίστηκε σήμερα)

**Πρόβλημα:** Επειδή όλη η πλοήγηση (Header tabs, Merch categories, Quickview modals, Events) γίνεται με React `state` (SPA χωρίς routing) αντί για πραγματικά URLs, το `villagers.concerto.gr` **παραμένει πάντα η ίδια ακριβώς διεύθυνση**, ό,τι κι αν βλέπει ο επισκέπτης. Σύγκριση με το πώς δουλεύει το Bandcamp (π.χ. `xattrik.bandcamp.com/merch/20-years` — κάθε προϊόν έχει δικό του URL).

**Συνέπειες:**
- Δεν μπορεί να μοιραστεί/διαφημιστεί link συγκεκριμένου προϊόντος ή event (π.χ. σε social media) — κρίσιμο για marketing ενός tenant/artist
- Το κουμπί "πίσω" του browser δεν δουλεύει όπως αναμένεται (βγάζει εντελώς έξω από την εφαρμογή)
- Καμία δυνατότητα SEO indexing ανά προϊόν/event
- Δεν γίνεται bookmark συγκεκριμένης σελίδας

**Λύση:** Εισαγωγή React Router, με πραγματικά URLs τύπου `/merch/[product-slug]`, `/events/[event-slug]`. Δεν καταστρέφει το SPA behavior (παραμένει χωρίς πλήρες page reload) — απλά συγχρονίζει το URL με την εσωτερική κατάσταση.

**Περιλαμβάνει:**
1. Εγκατάσταση + βασικό setup React Router στο `App.jsx`
2. Μετατροπή Header tabs από state σε routes
3. Προσθήκη `slug` column στα `events` και `products` (μικρό DB migration, για όμορφα URLs)
4. `ProductList`/`EventsList` cards να γίνουν πραγματικά links
5. `ProductQuickview`/`EventInfoDialog` να ενημερώνουν το URL όταν ανοίγουν
6. Χειρισμός 404
7. Δοκιμές cross-tenant, mobile/desktop, back-button behavior

**Εκτίμηση χρόνου:** 2-3 ώρες αισιόδοξα, ρεαλιστικά κοντά σε μισή μέρα δουλειάς μαζί. **Θα γίνει σε ξεχωριστή, αφιερωμένη συνεδρία** (προγραμματισμένο για αύριο), όχι ανάμεσα σε άλλα tasks — θεμελιώδης αλλαγή, αγγίζει σχεδόν όλα τα components.

---

## DATABASE — Πλήρες σχήμα μέχρι στιγμής



### `tenants`
```
id (uuid, PK), name, slug, created_at
```
Εγγραφές: Villagers Band (villagers), Athens Rock Festival (athens-rock)

### `tenant_domains`
```
id (uuid, PK), tenant_id (FK), domain, type, created_at
```
villagers.concerto.gr, athensrock.concerto.gr

### `tenant_settings` (branding)
```
id, tenant_id (FK, unique), display_name, logo_url, cover_image_url,
primary_color, secondary_color, bio, created_at
```

### `events`
```
id, tenant_id (FK), title, description, date, location, location_url,
image_url, capacity, tickets_sold, created_at
```
> Σημείωση: `capacity`/`tickets_sold` είναι προσωρινά — θα αντικατασταθούν από αθροίσματα του `tickets` table.

### `tickets` (νέο, ολοκληρώθηκε σήμερα)
```
id, event_id (FK), name, price, quantity, quantity_sold,
is_active, sort_order, created_at
```
Πλήρως custom/dynamic τύποι — ο tenant μπορεί να δημιουργεί όσους τύπους θέλει (Early Bird, VIP, Φοιτητικό, κ.λπ.), χωρίς καμία αλλαγή κώδικα. Δοκιμαστικά δεδομένα: Early Bird 15€ (38/40 sold), Γενική Είσοδος 20€ (45/100 sold), VIP 40€ (5/20 sold).

### `fans` (νέο, ολοκληρώθηκε σήμερα)
```
id (uuid, PK = auth.users.id), email, full_name, avatar_url,
tier (default 'free'), created_at
```
Συνδεδεμένο 1-προς-1 με Supabase Auth. RLS: κάθε fan βλέπει/επεξεργάζεται μόνο το δικό του profile.

### `tenant_follows` (νέο, ολοκληρώθηκε σήμερα)
```
id, fan_id (FK), tenant_id (FK), followed_at
```
Ποιος fan κάνει follow ποιο tenant. Unique constraint (δεν μπορεί διπλό follow).

### `products` (νέο, ολοκληρώθηκε)
```
id, tenant_id (FK), name, description, price, category (check: 'clothing'|'music'|'various'),
image_urls (text[] — πολλαπλές φωτογραφίες ανά προϊόν), stock_quantity, sku,
sort_order, is_active, created_at
```
Τρεις σταθερές κατηγορίες (`clothing`, `music`, `various` — π.χ. αφίσες, κούπες) — απλό `check` constraint, όχι ξεχωριστό categories table. Το "New Arrivals" στο frontend δεν είναι δικό του πεδίο· φιλτράρεται client-side με βάση `created_at` μέσα στους **τελευταίους 6 μήνες** (σημαντική λεπτομέρεια, μην ξεχαστεί). Δοκιμαστικά δεδομένα: 2 προϊόντα ρουχισμού (T-Shirt, Hoodie) + 2 μουσικής (βινύλιο, CD) για το Villagers Band, με placeholder εικόνες.

> **Μελλοντικό:** Μεγέθη ρούχων (S/M/L/XL) με ξεχωριστό stock ανά μέγεθος — θα χρειαστεί νέο table `product_variants`. Δεν έχει σχεδιαστεί ακόμα. Το `ProductQuickview` ήδη δείχνει color/size ως **static/disabled placeholder** μόνο για category `clothing`, έτοιμο οπτικά για όταν φτιαχτούν τα variants.

### `favorites` (schema έτοιμο, ΔΕΝ είναι ακόμα λειτουργικό)
```sql
create table favorites (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references fans(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (fan_id, product_id)
);
```
RLS: κάθε fan βλέπει/προσθέτει/αφαιρεί μόνο τα δικά του favorites (`auth.uid() = fan_id`). **Εξαρτάται από το fan sign-in** που δεν έχει υλοποιηθεί ακόμα — γι' αυτό η καρδούλα στο frontend δουλεύει προς το παρόν μόνο τοπικά (local React state, χάνεται με refresh, καμία αποθήκευση στη βάση).

### RLS
Ενεργό σε όλα τα tables. Public read policies προς το παρόν στα tenant/event/ticket tables· αυστηρότερες (auth-based) policies ήδη στα fans/follows.

### Storage
- `tenant-assets` (public) — logos ανά tenant
- `event-assets` (public) — αφίσες events, οργανωμένες ανά tenant slug

---

## FRONTEND — Δομή & λειτουργικότητα μέχρι στιγμής

### Real subdomain routing (development, επιβεβαιωμένο ✅)
`/etc/hosts` entries + `vite.config.js` (`server.host: true`, `allowedHosts`) → κάθε tenant subdomain δείχνει σωστό branding.

### Data Layer — React Query (TanStack Query), ολοκληρώθηκε ✅
Αποφασίστηκε και υλοποιήθηκε οργανωμένο data-fetching layer, αντί για σκόρπιο `useEffect`/`useState` σε κάθε component:
- **Βιβλιοθήκη:** `@tanstack/react-query` — ώριμη, σταθερή, ίδιο εργαλείο που χρησιμοποιεί το ίδιο το Supabase Studio εσωτερικά. Εγκατεστημένη, `QueryClientProvider` τυλιγμένο γύρω από το `<App />` στο `main.jsx`.
- **Φάκελος `src/queries/`** — μικρά, ονομασμένα hooks ανά τύπο δεδομένων (επίσημο pattern του TanStack, όχι custom αρχιτεκτονική):
  ```
  src/queries/
    useTenant.js   → tenant_domains + tenants + tenant_settings (χρησιμοποιείται στο App.jsx)
    useEvents.js    → events by tenantId (χρησιμοποιείται στο EventsSection.jsx)
    useTickets.js    → tickets by eventId (χρησιμοποιείται στο TicketDialog.jsx)
  ```
- **Όφελος:** αυτόματο caching (π.χ. άνοιγμα/κλείσιμο του ticket modal δεν ξανακάνει fetch), λιγότερος boilerplate κώδικας, μία κοινή, οργανωμένη πηγή για κάθε query. Κάθε νέο component που θα χρειαστεί δεδομένα από Supabase (π.χ. sign-in/fan profile) ακολουθεί το ίδιο pattern: νέο μικρό hook στο `queries/`.

### Δομή φακέλων (src/components/) — ενημερωμένη μετά από refactoring (Cursor agent + εμάς)
```
Events/
  EventsSection.jsx    → (πρώην Ekdiloseis/EkdiloseisNew.jsx) χρησιμοποιεί useEvents()
  EventsList.jsx         → grid κάρτες events (Tailwind, mobile-first)
  TicketDialog.jsx        → (πρώην Ticket/Ticket.jsx) Radix Dialog, χρησιμοποιεί useTickets()
  EventInfoDialog.jsx     → (πρώην Info/InfoGeneral.jsx) Radix Dialog + Tabs
BandInfo/
  BandInfo.jsx            → (πρώην InfoBand/InfoBand.jsx)
Header/
  Header.jsx              → δέχεται { tenant, settings } ως props από το App.jsx·
                            tabs (Πληροφορίες/Εκδηλώσεις/Merch Store) μέσω πίνακα TABS + activeTab state (SPA, χωρίς reload)·
                            λογότυπο/όνομα/bio/cover από settings/tenant (όχι πια hardcoded)·
                            redesign: cover image στρογγυλεμένες κάτω γωνίες (rounded-b-2xl) με object-position tuning
                            ώστε τα πρόσωπα να μένουν ορατά σε όλα τα breakpoints· λογότυπο με κυκλικό ring border,
                            τοποθετημένο δίπλα (όχι πάνω) στο Follow button· όνομα κάτω από το cover, όχι πάνω του·
                            follow button χωρίς οριστικό icon ακόμα — αποφασίστηκε ότι το symbol/branding θα
                            σχεδιαστεί από τον UI/UX συνεργάτη (brand identity task, όχι κάτι να λυθεί σε chat)
MerchStore/
  MerchStore.jsx          → placeholder, δεν έχει δουλευτεί ακόμα
ui/                      → shadcn/ui components (button, dialog, tabs, κ.λπ.)
lib/
  supabase.js
  maps.js                 → κοινό getMapsUrl (πριν υπήρχε duplicate σε 2 αρχεία, ενοποιήθηκε)
queries/                 → βλ. ενότητα "Data Layer" παραπάνω
```

**Bugs που εντοπίστηκαν και διορθώθηκαν στο refactoring:**
- Case-sensitivity σε imports εικόνων (π.χ. `mwrastifwtia.png` αντί `MwraStiFwtia.png`) — δούλευε σε macOS (case-insensitive filesystem) αλλά θα έσπαγε σε production/Linux build. Διορθώθηκε.
- Hardcoded tenant name/logo μέσα στο `Header` (θα έδειχνε πάντα "Μωρά Στη Φωτιά" σε κάθε tenant) — διορθώθηκε, τώρα διαβάζει δυναμικά από `settings`/`tenant` props.
- `settings?.description` → διορθώθηκε σε `settings?.bio` (σωστό όνομα στήλης στο `tenant_settings`).
- Αφαιρέθηκε νεκρός/άχρηστος κώδικας: `Data/BandData.js`, `Helpers/MergeData.js`, duplicate `getMapsUrl`.

**Σημαντικό — σύμβαση props του `App.jsx` → `Header`:** Το `Header` δέχεται ολόκληρα `tenant` και `settings` (όχι μόνο `tenantId`):
```jsx
<Header tenant={tenant} settings={settings} />
```

### MerchStore — δομή & λειτουργικότητα (ολοκληρώθηκε σήμερα ✅ σε μεγάλο βαθμό)

```
src/components/Merch/
  MerchStore.jsx        → entry point (μπαίνει στο Header ως tab "Merch Store"), κρατάει
                          selectedCategory + selectedProduct + sortBy state, φιλτράρει
                          products client-side (clothing/music/various/new-arrivals)
  CategoryGrid.jsx        → αρχική οθόνη: New Arrivals σε πλήρες πλάτος πάνω (banner σε
                          desktop, ίδιο μέγεθος με τα άλλα σε mobile), οι 3 κατηγορίες
                          (Ρουχισμός/CD & Βινύλια/Διάφορα) σε 3 στήλες από κάτω
  ProductList.jsx          → λίστα προϊόντων μιας κατηγορίας. 2 στήλες σε όλα τα breakpoints
                          (όχι 4 — συνειδητή επιλογή), τετράγωνες εικόνες (aspect-square).
                          Καρδούλα (favorite) + καλάθι πλωτά πάνω στην εικόνα (πάνω δεξιά)
  ProductFilters.jsx        → ταξινόμηση (νεότερα/τιμή αύξουσα/φθίνουσα), Radix Sheet
                          που ανοίγει από ΑΡΙΣΤΕΡΑ (side="left")
  ProductQuickview.jsx       → Radix Dialog (ΟΧΙ @headlessui/react — βλ. κανόνα library
                          consistency παραπάνω), μικρή τετράγωνη εικόνα, όνομα/τιμή/
                          περιγραφή, color/size picker εμφανίζεται ΜΟΝΟ για category
                          'clothing' (static/disabled placeholder), link "Δες όλες τις
                          λεπτομέρειες" (θα ανοίγει μελλοντικό ProductOverview — δεν
                          έχει φτιαχτεί ακόμα, μόνο console.log προς το παρόν)
  AddedToCartDialog.jsx      → Radix Dialog, ρωτάει "Συνέχισε τις αγορές" ή "Μετάβαση στο
                          καλάθι" μετά από add-to-cart
```

**⚠️ ΔΕΝ ΕΙΝΑΙ ΑΚΟΜΑ ΠΡΑΓΜΑΤΙΚΑ ΛΕΙΤΟΥΡΓΙΚΑ (οπτικά δουλεύουν, χωρίς πραγματική αποθήκευση):**
- **Favorites/καρδούλα** — μόνο local React state (`useState` μέσα στο `ProductList`), χάνεται με refresh. Το `favorites` table υπάρχει έτοιμο στη βάση (βλ. DATABASE section), αλλά δεν είναι συνδεδεμένο. **Χρειάζεται fan sign-in πρώτα.**
- **Καλάθι** — το `AddedToCartDialog` ανοίγει οπτικά, αλλά δεν υπάρχει κανένα πραγματικό cart state/context. Δεν υπάρχει ακόμα `ShoppingCart` component, ούτε persistent αποθήκευση (ούτε καν local, πόσο μάλλον στη βάση).
- **ProductOverview** (πλήρης σελίδα λεπτομέρειας προϊόντος, διαφορετικό από το Quickview) — δεν έχει φτιαχτεί καθόλου.
- **TenantTopBar** (search local στον tenant/avatar/favorites/καλάθι/γλώσσα — βλ. ενότητα "Local vs Global Search") — δεν έχει φτιαχτεί.
- **CheckoutForm, OrderSummary, OrderHistory, Incentives** — κανένα από αυτά δεν έχει ξεκινήσει.

Σημαντικό bug που διορθώθηκε σήμερα: `useMemo`/`useState` πρέπει πάντα να καλούνται **πριν** από οποιοδήποτε `if (...) return` σε ένα component (Rules of Hooks) — έσκαγε το MerchStore επειδή το `sortedItems` useMemo ήταν μετά τα early returns για loading/error.

### Events UI (ολοκληρωμένο ✅)
Κάρτα ανά event: αφίσα, date badge, τίτλος + status badge χρωματισμένο (πράσινο/κίτρινο/πορτοκαλί/κόκκινο βάσει διαθεσιμότητας), περιγραφή, 3 actions (Ticket modal / Google Maps Location / Info modal).

### Ticket modal (ολοκληρωμένο ✅)
Πλήρως dynamic — κάνει fetch (μέσω `useTickets()`) τα πραγματικά `tickets` rows ενός event (φιλτραρισμένα `is_active=true`, ταξινομημένα `sort_order`), δείχνει κάθε τύπο με χρωματισμένη διαθεσιμότητα. Κουμπί αγοράς υπάρχει οπτικά αλλά δεν έχει ακόμα πραγματική λειτουργία (περιμένει checkout flow).

---

## 🎉 ΙΣΤΟΡΙΚΟ MILESTONE: Πρώτο Live Deployment

Το project βγήκε **πρώτη φορά live στο internet** σήμερα (πέρα από localhost development).

**Deployment setup:**
- **GitHub:** `arionas188/festival-ticket` — repo ήδη υπήρχε, έγινε `git add` / `commit` / `push` όλων των σημερινών αλλαγών (React Query data layer, Merch Store, TenantTopBar, folder restructure). Authentication μέσω GitHub Personal Access Token (χρειάστηκε, αφού το GitHub δεν δέχεται πια σκέτο password για HTTPS git operations).
- **Netlify:** Νέο site, συνδεδεμένο απευθείας με το GitHub repo (`arionas188`'s team) — **auto-deploy σε κάθε future push στο `main`**.
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Base directory: κενό (project στη ρίζα του repo)
  - **Environment variables ρυθμισμένα:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (ίδιες τιμές με το τοπικό `.env`) — χωρίς αυτά το site φορτώνει αλλά δεν συνδέεται στη βάση.
- **Live URL:** `https://concertofamily.netlify.app`

**Προσωρινή ρύθμιση domain (μέχρι να υπάρχει πραγματικό custom domain):**
```sql
insert into tenant_domains (tenant_id, domain, type)
values (
  'a226bfd6-777b-401b-86ae-1b05db8c0c72', -- Villagers Band
  'concertofamily.netlify.app',
  'netlify_preview'
);
```
Χωρίς αυτή την εγγραφή, το `useTenant` hook αδυνατεί να αναγνωρίσει ποιο tenant αντιστοιχεί στο Netlify URL (error "Tenant not found for this domain") — το ίδιο θα χρειαστεί να επαναληφθεί για κάθε νέο tenant/domain που προστίθεται στο μέλλον (π.χ. Athens Rock, ή πραγματικά custom domains πελατών).

**Σημείωση για το μέλλον:** Αυτό είναι προσωρινή λύση δοκιμής. Όταν υπάρξουν πραγματικά custom domains (π.χ. `villagersband.com`) ή η κεντρική πλατφόρμα `concerto.gr`, θα χρειαστεί πιο συστηματική διαχείριση DNS/domains (πιθανό μελλοντικό task για το Tenant Admin Dashboard: ο tenant να μπορεί να προσθέτει το δικό του domain μόνος του).

---

## 📍 ΠΟΥ ΒΡΙΣΚΟΜΑΣΤΕ ΤΩΡΑ (σύνοψη)

✅ Multi-tenant πυρήνας πλήρως λειτουργικός (schema + real routing + branding)
✅ Events feature πλήρες (DB + UI + modals)
✅ Tickets feature — DB schema έτοιμο, UI modal δείχνει πραγματικά δεδομένα, **ΔΕΝ υπάρχει ακόμα πραγματική λειτουργία αγοράς**
✅ Fans/follows — DB schema έτοιμο (fans, tenant_follows)
✅ Google OAuth — ρυθμίστηκε πλήρως τεχνικά (Client ID/Secret στο Supabase, λειτουργεί σαν backend δυνατότητα)
✅ Data layer / React Query — ολοκληρωμένο σε όλα τα υπάρχοντα components (useTenant, useEvents, useTickets)
✅ Frontend refactoring (Cursor agent) — καθαρότερη δομή φακέλων, bugs διορθωμένα (case-sensitivity, hardcoded tenant data, duplicate code)
✅ Header redesign — cover/λογότυπο/follow button layout, χρησιμοποιεί πλέον cover_image_url από DB
✅ **`products` table — ολοκληρώθηκε** (schema + RLS, 3 κατηγορίες clothing/music/various, 4 δοκιμαστικά προϊόντα)
✅ **`favorites` table — ολοκληρώθηκε, ΠΛΗΡΩΣ ΛΕΙΤΟΥΡΓΙΚΟ πλέον** (persist ανά fan_id στη βάση, όχι πια local-only· survives logout/login/άλλη συσκευή)
✅ **Πραγματικό Fan Sign-in (Google OAuth) — ΟΛΟΚΛΗΡΩΘΗΚΕ και ΠΛΗΡΩΣ ΕΠΙΒΕΒΑΙΩΜΕΝΟ.** Βλ. αναλυτική ενότητα "Πραγματικό Login Flow" — 4 bugs εντοπίστηκαν/διορθώθηκαν με τεκμηρίωση.
✅ **ShoppingCart — ΠΛΗΡΩΣ ΛΕΙΤΟΥΡΓΙΚΟ (local state, όχι ακόμα persistent).** `CartContext.jsx` (Context API), `itemCount` = αριθμός ΔΙΑΦΟΡΕΤΙΚΩΝ προϊόντων (όχι άθροισμα ποσοτήτων), `CartDialog.jsx` (λίστα, +/- ποσότητα, κάδος αφαίρεσης, subtotal, "Ολοκλήρωση παραγγελίας" placeholder disabled).
✅ **TenantSearchDialog — ΠΡΑΓΜΑΤΙΚΗ αναζήτηση.** Χτίστηκε με το επίσημο shadcn `InputGroup` (plain composition, δεν χρειάζεται Radix primitive — επιβεβαιωμένο από τεκμηρίωση). Φιλτράρει events + merch products μέσα στον τρέχοντα tenant, live, με μετρητή αποτελεσμάτων.
✅ **MerchStore frontend — σχεδόν πλήρες**: CategoryGrid, ProductList, ProductGallery, ProductQuickShop (πλέον resets quantity/size ανά προϊόν — βλ. bug παρακάτω), ProductFilters, FavoritesDialog, CartDialog.
✅ **Αρχιτεκτονική απόφαση: `selectedProduct` state + `<ProductQuickShop />` ανέβηκαν στο `Header.jsx`** (κοινός γονιός) — δουλεύει σωστά ανεξάρτητα από ποιο tab είναι ενεργό ή από ποιο σημείο (Merch list, Favorites, μελλοντικά οπουδήποτε) ανοίγει το QuickShop. Επεκτάσιμο μοτίβο για το μέλλον.
✅ **Business logic: "Προσθήκη στο καλάθι" αφαιρεί αυτόματα από τα Favorites** (κεντρική λογική στο `Header.jsx`, `handleAddToCart`, όχι σκόρπια σε πολλά σημεία).
⏳ ProductOverview (πλήρης σελίδα προϊόντος, διαφορετικό από QuickShop) — δεν έχει φτιαχτεί
⏳ CheckoutForm, OrderSummary, OrderHistory, Incentives (merch) — δεν έχουν ξεκινήσει
⏳ Follow button icon/symbol — χρειάζεται σχεδίαση από τον UI/UX συνεργάτη (brand identity), όχι ακόμα αποφασισμένο
⏳ Checkout/reservation flow **tickets + merch** (atomic purchase logic + hold/expiry) — σχεδιασμένο νοητικά, **δεν έχει χτιστεί**. Βλ. διευκρίνιση stale-cart revalidation στα "Επόμενα Βήματα".
⏳ Tenant Admin Dashboard — **ξεχωριστό brief** (βλ. αρχείο `concerto-admin-dashboard-brief.md`), δεν έχει ξεκινήσει
⏳ Subscription tiers (Plus/Pro+/Business) — DB-ready, δεν έχει εφαρμοστεί λογική/τιμολόγηση
⏳ Product variants (μεγέθη ρούχων S/M/L/XL) — δεν έχει σχεδιαστεί· το ProductQuickShop έχει ήδη λειτουργικό size-picker UI, αλλά χωρίς πραγματικό stock ανά μέγεθος από πίσω
✅ Database indexing — **ΟΛΟΚΛΗΡΩΘΗΚΕ.** Indexes σε όλα τα foreign keys (events, tickets, products, tenant_domains, tenant_settings, tenant_follows, favorites, cart_items).
✅ RLS audit πλήρους βάσης — **ΟΛΟΚΛΗΡΩΘΗΚΕ.** Όλα τα 10 tables επιβεβαιωμένα με ενεργό RLS (`rowsecurity = true`) + έλεγχος όλων των policies. Αποτέλεσμα: καμία πραγματική τρύπα ασφαλείας. Δύο μικρά, αναμενόμενα κενά εντοπίστηκαν: (α) καμία write policy στα "δημόσια" tables (events/products/tickets/tenants/tenant_settings/tenant_domains) — αναμενόμενο, θα προστεθούν μαζί με το Tenant Admin Dashboard· (β) έλειπε DELETE policy στο `tenant_follows` (unfollow) — **διορθώθηκε άμεσα**, προστέθηκε το policy (δεν υπάρχει ακόμα UI κουμπί "unfollow", μόνο η δυνατότητα σε επίπεδο βάσης).
🟡 **React Router (routing)** — **σε εξέλιξη, Σάββατο 5/9.** Merch, Events, και το tab Πληροφορίες (home) έγιναν πραγματικά routes με το επίσημο Data Router pattern, lint+build περνάνε. **Εκκρεμούν ακόμα** από το αρχικό scope της ενότητας "UX/ARCHITECTURE GAP": slug migration (URLs σε UUID ακόμα, σκόπιμα αναβεβλημένο), ProductList/EventsList cards ως πραγματικά `<Link>` (τώρα είναι κουμπιά με `navigate()` — δουλεύουν αλλά δεν κάνουν right-click/"open in new tab"), EventInfoDialog να ενημερώνει URL (δεν το κάνει ακόμα), 404 handling (δεν υπάρχει `errorElement`/catch-all route), και **καμία δοκιμή σε πραγματικό browser** ακόμα (cross-tenant, mobile/desktop, back-button). Λεπτομερές, ζωντανό log στο `concerto-react-router-brief.md`.
⏳ Cart persistence (νέο `cart_items` table, fan_id-based, όχι tenant-based) — **σκόπιμα σε αναμονή, κατόπιν ρητής επιλογής του χρήστη**, όχι ξεχασμένο.
⏳ ProductQuickShop "Πληρωμή" κουμπί — παραμένει placeholder/disabled, σωστά (δεν υπάρχει ακόμα σύστημα πληρωμών)
⏳ BandInfo component — υπάρχει στη δομή, περιεχόμενο/λειτουργικότητα δεν έχει δουλευτεί ακόμα

---

## 🐛 Bug διορθώθηκε σήμερα: ProductQuickShop δεν επανέφερε quantity/size ανά προϊόν
Επειδή το `<ProductQuickShop />` ζει μόνιμα στο DOM (ανεβασμένο στο `Header.jsx`, ελέγχεται μόνο από το `product` prop), το εσωτερικό `quantity`/`selectedSize` state δεν επαναφερόταν ποτέ αυτόματα κατά την αλλαγή προϊόντος. **Λύση (τεκμηριωμένο React pattern):** `useEffect(() => { if (product) { setQuantity(1); setSelectedSize(null) } }, [product?.id])` — επαναφορά όποτε αλλάζει το `product.id`.

---

## Πραγματικό Login Flow — αναλυτικά

```
src/hooks/
  useAuth.js              → session tracking (onAuthStateChange), καθαρισμός URL μόνο
                            όταν υπάρχει πραγματικά session (βλ. Bug #3 παρακάτω)
src/queries/
  useFanSession.js          → ΕΝΙΑΙΟ, σειριακό query: upsert fans + upsert tenant_follows
                            μέσα στο ίδιο queryFn (αντικατέστησε τα useFanProfile.js +
                            useTenantFollow.js — βλ. Bug #2 παρακάτω)
```

**Header.jsx λογική (τελική, πραγματική):**
```jsx
const { user, isLoggedIn } = useAuth()
const { data: isFollowing, isLoading: followLoading } = useFanSession(isLoggedIn ? user : null, tenant?.id)
const showTopBar = isLoggedIn && isFollowing
```
`handleFollowClick` καλεί:
```jsx
supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: window.location.origin + window.location.pathname }
})
```
**Κρίσιμη λεπτομέρεια (βλ. Bug #4):** το `redirectTo` χρησιμοποιεί `origin + pathname`, **ΠΟΤΕ** `window.location.href` (θα κολλήσει παλιά tokens).

**RLS fix που χρειάστηκε:**
```sql
create policy "Fans can insert own profile"
on fans for insert
with check (auth.uid() = id);
```
Αρχικά είχαμε μόνο SELECT/UPDATE policies στο `fans` — έσκαγε "row-level security policy" στο πρώτο login κάθε νέου fan.

**Google OAuth config:**
- Authorized JavaScript origins: `https://concertofamily.netlify.app` προστέθηκε
- Supabase Authentication → URL Configuration: **Site URL** = `https://concertofamily.netlify.app`· **Redirect URLs** με wildcard (`**`) για dev/prod domains

**Auth flow type (σημείωση, όχι bug):** Χρησιμοποιούμε **redirect flow** (πλήρης πλοήγηση προς Google και πίσω), όχι popup flow (μικρό floating παράθυρο, π.χ. όπως το spitogatos.gr). Και τα δύο είναι έγκυρα, επίσημα υποστηριζόμενα patterns — αλλαγή σε popup θα ήταν ξεχωριστό, μικρό μελλοντικό task αν χρειαστεί, όχι διόρθωση.

**signOut() επιβεβαίωση (τεκμηριωμένο):** Το `supabase.auth.signOut()` στέλνει πραγματικό αίτημα στον server, καταστρέφει το refresh token + σχετικά session objects στη βάση, καθαρίζει το localStorage. Το access token JWT παραμένει τεχνικά έγκυρο μέχρι τη φυσική λήξη του (default 1 ώρα) — σχεδιαστική επιλογή του Supabase, όχι κάτι λάθος στη δική μας υλοποίηση.

---

### 🐛 Σοβαρό debugging session σήμερα — 4 πραγματικά bugs, τεκμηριωμένα με official docs + live network/console evidence (όχι εικασίες)

**Bug #1 (διορθώθηκε): Access token έμενε μόνιμα στο URL.**
Λύση: `window.history.replaceState(...)` μέσα στο `onAuthStateChange`, μόνο όταν υπάρχει session (`if (session && hash.includes("access_token"))` — όχι άνευ όρων, βλ. Bug #3).

**Bug #2 (διορθώθηκε): Race condition — "χρειάζεται 2η προσπάθεια για να συνδεθεί".**
Αρχική αρχιτεκτονική (`useTenantFollow` select-query + ξεχωριστό `useEnsureFanAndFollow` effect να τρέχουν παράλληλα) είχε εγγενές race window. **Λύση:** ενοποιήθηκαν σε **ένα** σειριακό `useFanSession` query (upsert fan → await → upsert follow → await → return true) — δομικά αδύνατο race, όχι patch πάνω σε patch.

**Bug #3 (διορθώθηκε, reversal προηγούμενου λάθους μου): Λάθος βασισμένο σε παλιωμένη τεκμηρίωση.**
Αρχικά εφαρμόστηκε `setTimeout(..., 0)` γύρω από το `onAuthStateChange` callback, βασισμένο σε **παλιά** (2023-2024) GitHub issues για documented deadlock bug. Η **τρέχουσα** επίσημη τεκμηρίωση Supabase (επιβεβαιωμένο ταίριασμα με εγκατεστημένη έκδοση `@supabase/supabase-js@2.112.3`) λέει ρητά ότι πλέον είναι ασφαλές να καλούνται άλλες Supabase auth μέθοδοι απευθείας μέσα στο callback, και ότι **"events are awaited in order"** — το `setTimeout` έσπαγε αυτή την εγγυημένη σειρά. **Λύση:** αφαιρέθηκε το `setTimeout`, callback επιστρέφει σε άμεσο/σύγχρονο. **Μάθημα:** πάντα να επιβεβαιώνεται η τεκμηρίωση έναντι της εγκατεστημένης έκδοσης, όχι απλά η πρώτη πηγή που βρίσκεται.

**Bug #4 (διορθώθηκε, το πραγματικό root cause πίσω από όλα τα προηγούμενα συμπτώματα): `redirectTo: window.location.href` κολλούσε παλιά tokens.**
Επιβεβαιώθηκε **οπτικά** στο πραγματικό URL (6 συνενωμένα `#access_token=...` κομμάτια από 6 διαδοχικές αποτυχημένες προσπάθειες). Κάθε νέα προσπάθεια sign-in περνούσε το *ήδη βρώμικο* URL ως `redirectTo`, παράγοντας ολοένα πιο παραμορφωμένο hash που ο Supabase parser δεν μπορούσε να διαβάσει σωστά. **Λύση:** `redirectTo: window.location.origin + window.location.pathname` (πάντα καθαρό URL, ανεξάρτητα από προηγούμενη κατάσταση). **Μετά από αυτή τη διόρθωση, το login flow δούλεψε καθαρά, με μία προσπάθεια, επιβεβαιωμένο με πλήρη console logs.**

---

### ⚠️ Γνωστό, εν μέρει διορθωμένο UX θέμα: Session δεν "ταξιδεύει" ανάμεσα σε tenant subdomains
Το Supabase session ζει στο `localStorage`, απομονωμένο ανά subdomain. Αν ο fan κάνει "Αποσύνδεση" σε tenant που ήδη ακολουθεί, το κουμπί ξαναδείχνει σκέτο "Ακολούθησε".

**Προσωρινή διόρθωση:** `localStorage.setItem('followed_tenant_' + tenantId, 'true')` στο `useFanSession.js` μετά από επιτυχές follow· στο `Header.jsx`, το κουμπί δείχνει **"Σύνδεση"** αντί για "Ακολούθησε" αν υπάρχει αυτή η τοπική σημείωση.

**⚠️ Μελλοντικό task, μην ξεχαστεί:** Όταν φτιαχτεί το πραγματικό Concerto-wide global login/SSO, αυτή η localStorage λογική πρέπει να αφαιρεθεί — μικρή, τοπική αλλαγή, όχι refactor.

---

## TenantTopBar — αναλυτικά

```
src/components/Header/
  TenantTopBar.jsx        → avatar (τώρα σε Radix DropdownMenu — βλ. παρακάτω) + search/favorites/
                            cart εικονίδια (κυκλικό border), εμφανίζεται όταν showTopBar=true
                            (πραγματικό auth, όχι πια FAKE_IS_LOGGED_IN)
  TenantSearchDialog.jsx    → Radix Dialog + shadcn InputGroup, search input με autofocus,
                            προαιρετικό δεύτερο InputGroupAddon (align="inline-end") για αριθμό
                            αποτελεσμάτων όταν συνδεθεί πραγματική αναζήτηση, ΧΩΡΙΣ πραγματικά
                            αποτελέσματα ακόμα
```

**Avatar dropdown (νέο σήμερα):** Radix DropdownMenu (`npx shadcn@latest add dropdown-menu`, επιβεβαιωμένο `radix-ui` import) — avatar `<img>` τυλιγμένο σε `<DropdownMenuTrigger asChild><button>`, περιεχόμενο: label "Ο λογαριασμός μου", 2 disabled items (Προφίλ/Παραγγελίες — θα ενεργοποιηθούν σε άλλο session), separator, λειτουργικό "Αποσύνδεση" (`supabase.auth.signOut()`).

**Θέση στο Header:** avatar πάει αριστερά δίπλα στο λογότυπο, favorites+cart+search πάνε τέρμα δεξιά μέσω `ml-auto`.

**Σημαντική αρχιτεκτονική απόφαση (μην μπερδευτεί μελλοντικά):** Το `TenantTopBar` είναι **τοπικό** στον tenant — διαφέρει εντελώς από το μελλοντικό `ConcertoGlobalBar` (Phase 2, όταν χτιστεί η κεντρική πλατφόρμα concerto.gr). Βλ. αναλυτική ενότητα "Local vs Global Search" παραπάνω στο brief.

---

## ΕΠΟΜΕΝΑ ΒΗΜΑΤΑ (με σειρά προτεραιότητας — ενημερωμένο)

**✅ Ολοκληρώθηκαν σήμερα (2η μέρα μετά το cart persistence):** RLS audit πλήρους βάσης (καμία τρύπα, ένα μικρό κενό διορθώθηκε), Database indexing (όλα τα foreign keys). Και τα δύο "θεμελιωτικά" tasks έκλεισαν, ελεύθερος δρόμος για το Σάββατο.

**Επιχειρηματικός στόχος:** Παρουσίαση σε πραγματική μπάντα **μέχρι τέλος του τρέχοντος μήνα**.

---

### 🗓️ ΠΡΙΝ ΤΟ ΣΑΒΒΑΤΟ — τι απομένει (προαιρετικό, μικρά tasks)

Τίποτα **θεμελιωτικό** δεν μένει εκκρεμές πριν το Σάββατο — τα δύο μεγάλα (RLS + indexing) έκλεισαν. Ό,τι μένει είναι προαιρετικό, μπορεί να γίνει ή να παραλειφθεί χωρίς να μπλοκάρει το routing:

1. **Λίστα ερωτήσεων για τη συνάντηση venue/manager** — προετοιμασία για την προσωπική συνάντηση (business, όχι τεχνικό).
2. **ProductOverview** (πλήρης σελίδα προϊόντος) — μικρό, ανεξάρτητο merch task.
3. **Favorites icon** — ήδη λειτουργικό (ανοίγει FavoritesDialog), μόνο πιθανές μικρολεπτομέρειες αν προκύψουν.

### 🗓️ ΣΑΒΒΑΤΟ — React Router

**Το μεγάλο task.** Εκτίμηση: μισή μέρα. Χρειάζεται ολόκληρη, αφιερωμένη συνεδρία με φρέσκο χρόνο.

### ΜΕΤΑ ΤΟ ΣΑΒΒΑΤΟ

4. **Product variants (μεγέθη ρούχων)** — σχεδιασμός `product_variants` table.
5. **Follow button icon/symbol** — περιμένει τον UI/UX συνεργάτη.
6. **Tenant Admin Dashboard** — μεγάλο, ξεχωριστό brief, μπορεί να ξεκινήσει παράλληλα με άλλα.
7. **Checkout/reservation flow** (tickets + merch) — μεγάλο, χτίζεται πάνω στο routing. Περιλαμβάνει: atomic purchase logic (tickets + merch stock, ίδιο pattern), `orders` table με hold/expiry, CheckoutForm/OrderSummary/OrderHistory, "μπαγιάτικο καλάθι" επανέλεγχο διαθεσιμότητας πριν οριστικοποίηση.
8. **1-ticket-per-tier κανόνας** στο purchase flow.
9. **Apple Sign-In** (όταν υπάρχει Apple Developer λογαριασμός).
10. Επιβεβαίωση EU region + Privacy Policy/ToS (νομικά, πριν το launch).
11. BandInfo περιεχόμενο, Incentives (merch).
12. **Απομάκρυνση localStorage προσωρινής λύσης** ("Σύνδεση" vs "Ακολούθησε") όταν χτιστεί το SSO bridge — δεν είναι επείγον, το SSO bridge είναι ρητά αναβεβλημένο.
13. Μελλοντικά: Αριθμημένα tickets, ticket resale marketplace, QR validation, ConcertoGlobalBar (Phase 2), custom domains + SSO bridge (ρητά ΟΧΙ πριν το launch — βλ. business brief).

---

## Οδηγία προς AI assistant (Claude ή άλλο)

> Λειτούργησε σαν senior SaaS architect. Μην αλλάζεις αποφάσεις που έχουν ήδη παρθεί (multi-tenant μοντέλο, fan ownership στο Concerto με κεντρικό auth, custom/dynamic ticket types, subscription-based tickets-per-event όριο, δομή Radix/shadcn στα UI components) χωρίς να αιτιολογήσεις ρητά γιατί. Όταν δίνεται reference component, ακολούθησε αυστηρά τη δομή του. Συνέχισε από τα "Επόμενα βήματα" παραπάνω.
