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
image_url, capacity, tickets_sold, created_at,
slug (νέο, 6/9 — text, NOT NULL, UNIQUE ανά tenant_id, auto-generated από DB trigger)
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
sort_order, is_active, created_at,
slug (νέο, 6/9 — text, NOT NULL, UNIQUE ανά tenant_id, auto-generated από DB trigger)
```
Τρεις σταθερές κατηγορίες (`clothing`, `music`, `various` — π.χ. αφίσες, κούπες) — απλό `check` constraint, όχι ξεχωριστό categories table. Το "New Arrivals" στο frontend δεν είναι δικό του πεδίο· φιλτράρεται client-side με βάση `created_at` μέσα στους **τελευταίους 6 μήνες** (σημαντική λεπτομέρεια, μην ξεχαστεί). Δοκιμαστικά δεδομένα: 2 προϊόντα ρουχισμού (T-Shirt, Hoodie) + 2 μουσικής (βινύλιο, CD) για το Villagers Band, με placeholder εικόνες.

> **Μελλοντικό:** Μεγέθη ρούχων (S/M/L/XL) με ξεχωριστό stock ανά μέγεθος — θα χρειαστεί νέο table `product_variants`. Δεν έχει σχεδιαστεί ακόμα. Το `ProductQuickview` ήδη δείχνει color/size ως **static/disabled placeholder** μόνο για category `clothing`, έτοιμο οπτικά για όταν φτιαχτούν τα variants.

### `band_members` (νέο, 6/9)
```
id (uuid, PK), tenant_id (FK), name, role, image_url, sort_order,
is_active (default true), created_at
```
Λίστα μελών μπάντας (όνομα + ρόλος/όργανο + φωτογραφία) για το section "Τα
μέλη μας" στο `/about`. **Καθαρά data-driven rendering** — ΔΕΝ υπάρχει πεδίο
"type" στο `tenants` για να ξεχωρίζει band από venue· απλά ένα venue tenant
δεν θα έχει ποτέ rows εδώ, οπότε το section δεν εμφανίζεται καθόλου γι' αυτό
(απόφαση με τον χρήστη, βλ. `concerto-band-members-brief.md` αν χρειαστεί
αναλυτικό log — προς το παρόν τεκμηριωμένο μόνο εδώ). RLS: public read μόνο
στα `is_active = true` rows, καμία write policy ακόμα (ίδιο pattern με
products/events, θα προστεθεί μαζί με το Tenant Admin Dashboard). Frontend:
`src/components/BandInfo/BandMembers.jsx` (UI πιστό σε Tailwind Plus
reference "Meet our leadership"), `src/queries/useBandMembers.js`,
renders μέσα στο `InfoRoute.jsx` κάτω από το υπάρχον `BandInfo`.

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

### ✅ Δεύτερο tenant (Athens Rock) — ολοκληρώθηκε
Athens Rock Festival έχει πλέον δικό του domain στο `tenant_domains` και δουλεύει κανονικά, live-verified πολλές φορές κατά τη διάρκεια του React Router/Fan Dashboard work (βλ. `concerto-react-router-brief.md`) — π.χ. cross-tenant favorites/cart isolation test έγινε ακριβώς Villagers ↔ Athens Rock.

### ✅ Τρίτο tenant (ΣΤΡΑΦΙ) — ολοκληρώθηκε, live-verified (10/9)

Ο χρήστης ζήτησε τρίτο, πραγματικό tenant "για διασκέδαση" — επιβεβαιώνει ξανά το white-label promise (μηδέν νέος κώδικας, μόνο νέες γραμμές). type='artist' (μπάντα, όπως Villagers), slug 'strafi' → `strafi.concerto.gr`. Δούλεψε στην πράξη — τρίτο tenant, μηδέν νέος κώδικας πέρα από ένα `allowedHosts` entry, ακριβώς όπως το Athens Rock.

Έγινε ήδη: `vite.config.js` `allowedHosts` πήρε το `strafi.concerto.gr`.

**Έγινε από τον χρήστη** (μικρό πρόσκομμα στην πορεία: πρώτη φορά έβαλε `http://strafi.concerto.gr:5173/` στο `/etc/hosts` αντί για `127.0.0.1 strafi.concerto.gr` — το /etc/hosts θέλει μόνο IP+hostname, όχι URL· διορθώθηκε, δούλεψε) (χρειάζεται δικό του Supabase login — το anon key της εφαρμογής δεν έχει write permission σε tenants/tenant_domains/tenant_settings, ΕΠΙΤΗΔΕΣ, μόνο public read):
```sql
insert into tenants (name, slug, type)
values ('ΣΤΡΑΦΙ', 'strafi', 'artist');

insert into tenant_domains (tenant_id, domain, type)
values (
  (select id from tenants where slug = 'strafi'),
  'strafi.concerto.gr',
  'subdomain'
);

insert into tenant_settings (
  tenant_id, display_name, logo_url, cover_image_url,
  primary_color, secondary_color, bio, category_label
)
values (
  (select id from tenants where slug = 'strafi'),
  'ΣΤΡΑΦΙ',
  'https://placehold.co/200x200/1f2937/ffffff?text=STRAFI',
  'https://placehold.co/1200x400/1f2937/ffffff?text=STRAFI',
  '#1f2937',
  '#f97316',
  'Σύντομα εδώ η ιστορία των ΣΤΡΑΦΙ.',
  'Μουσικό Συγκρότημα'
);
```
Placeholder εικόνες (placehold.co, πραγματικά functional URLs, όχι σπασμένα links) — ο χρήστης τα αλλάζει αργότερα μόνος του (upload στο `tenant-assets` bucket, UPDATE στο `tenant_settings`).

Χρειάζεται ΚΑΙ `/etc/hosts` entry στο Mac του χρήστη (`127.0.0.1 strafi.concerto.gr`, ίδιο pattern με villagers/athensrock) — δεν μπορεί να γίνει από τον AI assistant (system file, εκτός scope των εργαλείων/κανόνων).

**Update (10/9) — πραγματικό bio μπήκε.** Ο χρήστης έστειλε το πραγματικό bio κειμένο
(ιστορία, μέλη Billy/Θάνος/Λάμπρος, δισκογραφία, live εμφανίσεις) + το πραγματικό λογότυπο.
Το bio μπήκε με `UPDATE tenant_settings SET bio = ... WHERE tenant_id = (select id from tenants
where slug = 'strafi')` (ο χρήστης το έτρεξε στο δικό του Supabase SQL editor — το anon key
δεν έχει write permission, επίτηδες).

Στην πορεία εντοπίστηκε πραγματικό bug: το `InfoRoute.jsx` έκανε unconditional render ενός
`<TenantAbout />` component για ΚΑΘΕ tenant τύπου 'artist' — αλλά το `TenantAbout.jsx` είχε
hardcoded, άσχετο περιεχόμενο (ιστορία μιας φανταστικής μπάντας "Μωρά στη Φωτιά") που εμφανιζόταν
κάτω από το πραγματικό bio σε ΚΑΘΕ artist tenant — δηλαδή και στο live Villagers site, όχι μόνο
στο ΣΤΡΑΦΙ. Επιβεβαιώθηκε με grep ότι το `TenantAbout` δεν χρησιμοποιείται πουθενά αλλού, άρα
αφαιρέθηκε με ασφάλεια από το `InfoRoute.jsx` (και το import του). Το αρχείο `TenantAbout.jsx`
έμεινε στο δίσκο αχρησιμοποίητο (μπορεί να διαγραφεί χειροκίνητα όποτε βολεύει).

Λογότυπο: ο χρήστης έστειλε την πραγματική εικόνα (547×365, ορθογώνιο σχήμα banner) — ταιριάζει
καλά για `cover_image_url`, αλλά θα κοπεί στα πλάγια αν χρησιμοποιηθεί ως `logo_url` σε κυκλικά
avatar contexts. Ο χρήστης πρέπει να το ανεβάσει ο ίδιος στο Supabase Storage bucket
`tenant-assets` (το app key δεν έχει write permission σε Storage) και να δώσει το public URL
πίσω για να μπει σε `logo_url`/`cover_image_url`. **Update (10/9):** ο χρήστης ανέβασε ξεχωριστό
τετράγωνο `strafi-logo.png` (καλό fit για κυκλικά avatar contexts) ΚΑΙ `staff-cover.png`
(ορθογώνιο banner) στο bucket `tenant-assets/strafi/` — άρα μπήκαν σωστά, χωρίς crop
compromise, και τα δύο πεδία `logo_url`/`cover_image_url`.

**Update (10/9) — merch, δοκιμαστικά δεδομένα.** Ο χρήστης ανέβασε 7 πραγματικές εικόνες
προϊόντων στο `tenant-assets/strafi/products/` (3 t-shirt, 4 βινύλια) και ζήτησε να μπουν
test data (τιμές/stock/περιγραφές placeholder) σήμερα, με πραγματικά στοιχεία να μπουν
αύριο. Έγιναν 7 `INSERT INTO products` rows (3 `clothing` @ €20, 4 `music` @ €25-28,
stock 10-15, SKU pattern `STRAFI-<TS|VL>-<name>`, `sort_order` 1-7) — ονόματα βινυλίων
εικασμένα από filename (Επίθεση/Πάνω απ' τα Χώματα/Παραδομένη στη Γιορτή/το ομώνυμο
ντεμπούτο) γιατί δεν δόθηκαν ρητά ακόμα, ΘΑ ΕΠΙΒΕΒΑΙΩΘΟΥΝ/διορθωθούν αύριο μαζί με τα
πραγματικά στοιχεία. `slug` auto-generated από το υπάρχον DB trigger, δεν χρειάστηκε να
δοθεί χειροκίνητα.

**Update (10/9) — bug βρέθηκε από τον χρήστη, διορθώθηκε: κενές κατηγορίες merch.**
Το `useMerchCategories.js` έχτιζε ΠΑΝΤΑ 4 σταθερές κατηγορίες (New/Ρουχισμός/CD&Βινύλια/
Διάφορα) ανεξάρτητα από το αν υπήρχε έστω 1 προϊόν μέσα — το `CategoryGrid` τις έδειχνε
όλες σαν clickable πλακίδια, οπότε μια κενή κατηγορία (π.χ. ΣΤΡΑΦΙ δεν έχει ακόμα "Διάφορα")
εμφανιζόταν σαν άδειο πλακίδιο χωρίς εικόνα που οδηγούσε σε κενή σελίδα. Διορθώθηκε με ένα
`.filter((cat) => cat.items.length > 0)` στο τέλος του υπολογισμού — global fix, αφορά
όλα τα tenants, όχι μόνο ΣΤΡΑΦΙ. Το `MerchCategoryRoute.jsx` είχε ήδη defensive handling
για "κατηγορία δεν βρέθηκε" (direct URL σε άδεια/ανύπαρκτη κατηγορία), άρα καμία άλλη
αλλαγή δεν χρειάστηκε.




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
🆕 **`concerto-testing-checklist.md` — νέο doc, 9/9.** Ζωντανή λίστα manual tests προς εκτέλεση πριν το launch (ή για spot-check) — ξεχωριστό από αυτό εδώ το brief (εκεί: ΤΙ ελέγχεται, εδώ: ΤΙ χτίστηκε).
🆕 **`concerto-forms-and-encryption-brief.md` — νέο doc, 9/9.** Επαναχρησιμοποιήσιμο πρότυπο (ΟΧΙ χρονολογικό log): πώς φτιάχνουμε φόρμες με validation (react-hook-form + zod) και πώς κρυπτογραφούμε ευαίσθητα προσωπικά δεδομένα (Vault + pgcrypto + SECURITY DEFINER RPC pattern) — θα χρειαστεί ξανά σε Tenant Admin/Concerto Admin dashboards.
⏳ Tenant Admin Dashboard — **ξεχωριστό brief** (βλ. αρχείο `concerto-admin-dashboard-brief.md`), δεν έχει ξεκινήσει
⏳ Subscription tiers (Plus/Pro+/Business) — DB-ready, δεν έχει εφαρμοστεί λογική/τιμολόγηση
⏳ Product variants (μεγέθη ρούχων S/M/L/XL) — δεν έχει σχεδιαστεί· το ProductQuickShop έχει ήδη λειτουργικό size-picker UI, αλλά χωρίς πραγματικό stock ανά μέγεθος από πίσω
✅ Database indexing — **ΟΛΟΚΛΗΡΩΘΗΚΕ.** Indexes σε όλα τα foreign keys (events, tickets, products, tenant_domains, tenant_settings, tenant_follows, favorites, cart_items).
✅ RLS audit πλήρους βάσης — **ΟΛΟΚΛΗΡΩΘΗΚΕ.** Όλα τα 10 tables επιβεβαιωμένα με ενεργό RLS (`rowsecurity = true`) + έλεγχος όλων των policies. Αποτέλεσμα: καμία πραγματική τρύπα ασφαλείας. Δύο μικρά, αναμενόμενα κενά εντοπίστηκαν: (α) καμία write policy στα "δημόσια" tables (events/products/tickets/tenants/tenant_settings/tenant_domains) — αναμενόμενο, θα προστεθούν μαζί με το Tenant Admin Dashboard· (β) έλειπε DELETE policy στο `tenant_follows` (unfollow) — **διορθώθηκε άμεσα**, προστέθηκε το policy (δεν υπάρχει ακόμα UI κουμπί "unfollow", μόνο η δυνατότητα σε επίπεδο βάσης).
✅ **React Router (routing) — ΟΛΟΚΛΗΡΩΘΗΚΕ και COMMITTED/PUSHED, Σάββατο 5/9 → Κυριακή 6/9.** Merch, Events, home tab σε `/about`, 404 handling, cards ως πραγματικά `<Link>`, slug migration (με 2 bugfixes), EventInfoDialog ως route (με 1 bugfix), και **πλήρες αυτόματο browser testing** (cross-tenant isolation, mobile viewport, back-button, logged-out auth-gate behavior) — όλα browser-confirmed μέσω Claude in Chrome. Commit `be03c85` έγινε push στο `main` (`a672ce5..be03c85 main -> main`) — **ολόκληρο το task κλειστό, τίποτα δεν εκκρεμεί.** Λεπτομερές, ζωντανό log στο `concerto-react-router-brief.md`.
✅ **Fan Dashboard v1 + Phase 2 — ΟΛΟΚΛΗΡΩΘΗΚΕ, 8/9.** Προφίλ/Αγαπημένα tenants/Αγαπημένα merch (συγκεντρωτικά, price-drop notification)/Αγαπημένα events (συγκεντρωτικά, change notification)/Παραγγελίες (placeholder). Tenant context chip. Πλήρες log στο `concerto-react-router-brief.md`.
✅ **Bug fix: cross-tenant favorites/cart leakage — ΔΙΟΡΘΩΘΗΚΕ, 8/9, live-verified από τον χρήστη.** `favorites`/`cart_items` δεν είχαν `tenant_id` (global ανά fan αντί για ανά tenant). Προστέθηκε tenant_id + backfill, 6 call sites ενημερώθηκαν. Βλ. `concerto-react-router-brief.md`.
✅ **Follow/unfollow — επανασχεδιάστηκε, 8/9.** Αφαιρέθηκε το αυτόματο "follow όλα στο login" και το silent auto-follow-on-visit (ρητά ανακλήθηκε προηγούμενη "για αρχή" απόφαση). Follow πλέον ρητή ενέργεια ανά tenant, καμία localStorage μνήμη. Βλ. `concerto-react-router-brief.md`.
✅ **FanIdCard — test/demo component, 8/9→9/9.** "Ταυτότητα" fan στο Προφίλ. Id number πραγματικό. Ημ. γέννησης/πόλη έγιναν πραγματικά, ΚΡΥΠΤΟΓΡΑΦΗΜΕΝΑ πεδία (Supabase Vault + pgcrypto, ξεχωριστό table, SECURITY DEFINER RPCs) μετά από ρητή συζήτηση GDPR/ασφάλειας με τον χρήστη. Επίθετο/Display name παραμένουν test data.
✅ **Dev-only auto-port για cross-tenant links, 9/9.** `crossTenantHref()` helper, gated πίσω από `import.meta.env.DEV` — αυτόματα off σε production build, καμία χειροκίνητη αλλαγή δεν χρειάζεται πριν το launch.
✅ **Encryption επεκτάθηκε σε ΟΛΑ τα προσωπικά πεδία fan (email/full_name/avatar_url), 9/9.** Ίδιο μηχανισμό (Vault+pgcrypto) με date_of_birth/city — ο χρήστης ζήτησε ρητά "όλα τα προσωπικά πεδία". ⚠️ Σημαντικός περιορισμός εξηγήθηκε στον χρήστη: αυτό προστατεύει από external hack/leak, ΟΧΙ από τον ίδιο ως admin (ελέγχει το Vault key) — πραγματικό "ούτε ο admin δεν βλέπει" θα χρειαζόταν end-to-end encryption με σοβαρά μειονεκτήματα (μη αναστρέψιμη απώλεια δεδομένων), δεν επιλέχθηκε. Επίσης: το `auth.users` του Supabase Auth (Google OAuth) παραμένει πάντα plaintext, εκτός ελέγχου μας. DB-verified, όλα τρέχουν σωστά. Βλ. `concerto-react-router-brief.md`.
✅ **Πλήρης φόρμα προφίλ fan — Όνομα/Επίθετο/Display name/Τηλέφωνο/Ημ. γέννησης/Πόλη/Αγαπημένα είδη μουσικής/Αγαπημένα tenants, 9/9 (2 περάσματα).** react-hook-form + zod validation (πρότυπο, βλ. `concerto-forms-and-encryption-brief.md`). Προσωπικά πεδία κρυπτογραφημένα, προτιμήσεις (μουσική/tenants) plain/αναζητήσιμα. **Συμπεριφορά (β' πέρασμα, ρητά ορισμένη από χρήστη):** save κλείνει τη φόρμα· auto-κεφαλαιοποίηση Όνομα/Επίθετο/Πόλη· live έλεγχος μοναδικότητας display name (κοκκινίζει/μπλοκάρει αν υπάρχει ήδη)· τηλέφωνο με επιλογή χώρας, κλικάρεται για κλήση· ID card δείχνει υπολογισμένη ηλικία (όχι ημ. γέννησης) που αυξάνεται μόνη της κάθε χρόνο· "Αγαπημένα tenants" έγινε πολλαπλή επιλογή (checkboxes+search) από όσα πραγματικά ακολουθεί ο fan· ID card sticky+live preview καθώς πληκτρολογεί, verified badge πράσινο. 1 migration εκκρεμεί. Βλ. `concerto-react-router-brief.md`.
⏳ Cart persistence (νέο `cart_items` table, fan_id-based, όχι tenant-based) — **σκόπιμα σε αναμονή, κατόπιν ρητής επιλογής του χρήστη**, όχι ξεχασμένο.
⏳ ProductQuickShop "Πληρωμή" κουμπί — παραμένει placeholder/disabled, σωστά (δεν υπάρχει ακόμα σύστημα πληρωμών)
⏳ BandInfo component — hardcoded test-data κείμενο (θα γίνει dynamic αργότερα, ίδιο μοτίβο με band_members). **Νέο, 6/9:** truncate/expand λειτουργικότητα (`line-clamp-[10]` + κουμπί "Περισσότερα"/"Λιγότερα", `useState`) — ο χρήστης το ενέκρινε ως σχεδόν τελικό, **ρητά αναβεβλημένο για styling polish πριν το launch της πρώτης έκδοσης** (δική του απόφαση, όχι ξεχασμένο item).
✅ **BandMembers — ΟΛΟΚΛΗΡΩΘΗΚΕ, Κυριακή 6/9.** Νέο section "Τα μέλη μας" στο `/about`, νέος πίνακας `band_members`, καθαρά data-driven εμφάνιση (χωρίς πεδίο tenant.type — βλ. σχήμα βάσης παραπάνω). **Εκκρεμεί**: ο χρήστης να τρέξει το migration στο Supabase και να προσθέσει δοκιμαστικά μέλη, μετά manual browser check.

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

## ⚠️ Πιθανό bug προς έλεγχο (10/9) — 401 στο `sync_own_fan_from_auth`

Ο χρήστης είδε στο browser console:
```
POST .../rest/v1/rpc/sync_own_fan_from_auth 401 (Unauthorized)
```
Μονή, μη αναπαραγόμενη εμφάνιση — δεν θυμάται ακριβώς τι έκανε τη στιγμή εκείνη, καμία
ορατή συνέπεια στη σελίδα δεν αναφέρθηκε (δεν κόλλησε κάπου, δεν έδειξε error state).

**Πιθανή εξήγηση (όχι επιβεβαιωμένη ακόμα):** Το session αποθηκεύεται σε cookie
(`src/lib/cookieStorage.js`, Domain=.concerto.gr, για SSO ανάμεσα σε subdomains). Το
Supabase client κάνει auto-refresh του access token, αλλά browsers "παγώνουν" timers σε
background tabs — αν ένα tab μείνει ανοιχτό αρκετή ώρα χωρίς focus, το πρώτο request μετά
την επιστροφή focus μπορεί να φύγει με ήδη ληγμένο token πριν προλάβει το auto-refresh.
Το `sync_own_fan_from_auth` RPC έχει ΣΚΟΠΙΜΑ `grant ... to authenticated` / `revoke ... from
anon` (migration `20260909110000_encrypt_all_fan_personal_fields.sql`) — άρα ένα expired/
άκυρο token εκεί δίνει ακριβώς 401, όχι κάτι σπασμένο στο permission setup.

**Γιατί πιθανώς δεν χρειάζεται επέμβαση:** το `useFanSession` το καλεί μέσα από React
Query `useQuery` με το **default `retry: 3`** (`new QueryClient()` χωρίς custom retry
config στο `main.jsx`) — δηλαδή αυτόματα ξαναδοκιμάζει 2-3 φορές με αυξανόμενη καθυστέρηση,
χρόνος αρκετός συνήθως για να προλάβει το Supabase client να κάνει refresh το token μόνο
του. Πιθανότατα self-healing, invisible στον χρήστη.

**Προς έλεγχο αύριο:**
- Αν ξανασυμβεί, σημείωσε ΤΙ έκανε ο χρήστης ακριβώς πριν (tab πόση ώρα ήταν background,
  ήταν μόλις μετά από sign in/out, πολλά tabs/subdomains ταυτόχρονα).
- Αν παρατηρηθεί κάποτε ΟΡΑΤΗ συνέπεια (π.χ. κολλημένο "φόρτωση...", account section να μη
  φορτώνει, favorites/cart/search να μη δουλεύουν στιγμιαία) — τότε είναι πραγματικό bug,
  όχι απλά transient race, και χρειάζεται πραγματικό fix (π.χ. explicit
  `supabase.auth.refreshSession()` πριν το RPC, ή guard στο `useFanSession` να περιμένει
  valid session πριν κάνει call).
- Δεν έγινε καμία code αλλαγή ακόμα γι' αυτό — καθαρά παρατήρηση/διάγνωση, εν αναμονή
  επιβεβαίωσης.

---

## ⚠️ Προσωρινή κατάσταση: `concertofamily.netlify.app` δείχνει ΣΤΡΑΦΙ, ΟΧΙ Villagers (10/9)

Ο χρήστης ζήτησε να δει το ΣΤΡΑΦΙ live στο Netlify για τον συνεργάτη του. Επιλέχθηκε η
γρήγορη λύση (εναλλαγή στο ίδιο, υπάρχον URL) αντί για δεύτερο ξεχωριστό Netlify site —
δηλαδή η μία υπάρχουσα γραμμή στο `tenant_domains` (domain = `concertofamily.netlify.app`)
άλλαξε `tenant_id` από Villagers σε ΣΤΡΑΦΙ. **Το Villagers ΔΕΝ φαίνεται πια σε αυτό το URL
όσο ισχύει αυτή η αλλαγή.**

SQL που δόθηκε στον χρήστη (μη ξεχαστεί ότι ίσως χρειαστεί rollback):
```sql
UPDATE tenant_domains
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'strafi')
WHERE domain = 'concertofamily.netlify.app';
```
Για επαναφορά στο Villagers:
```sql
UPDATE tenant_domains
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'villagers')
WHERE domain = 'concertofamily.netlify.app';
```
Αν το AI assistant σε επόμενο session δει ότι το `concertofamily.netlify.app` δείχνει
ΣΤΡΑΦΙ αντί Villagers, αυτός είναι ο λόγος — δεν είναι bug, είναι σκόπιμη, ενεργή
επιλογή του χρήστη εν αναμονή επαναφοράς.

---

## 📋 ΣΧΕΔΙΑΣΜΟΣ (11/9): Tenant Admin Dashboard — αρχιτεκτονική, πριν χτιστεί

Ο χρήστης θέλει να χτίσουμε το Tenant Admin Dashboard βήμα-βήμα, ξεκινώντας σύντομα.
Συζητήθηκε αρχιτεκτονική, ΧΩΡΙΣ ακόμα κώδικα/migration να έχει τρέξει. Καταγραφή ώστε να
μη χαθεί η σκέψη:

**Authentication vs authorization (η βασική διάκριση):** Το login (Google OAuth μέσω
Supabase Auth) είναι ήδη έτοιμο και ΙΔΙΟ για fans και μελλοντικούς admins — απαντάει μόνο
"ποιος είσαι". Το "τι επιτρέπεσαι να κάνεις" (ποιο tenant διαχειρίζεσαι) ΔΕΝ υπάρχει ακόμα
πουθενά· χρειάζεται νέος πίνακας:
```
tenant_admins: user_id (FK auth.users), tenant_id (FK tenants)
```
Μία γραμμή = δικαίωμα διαχείρισης. **Ρητή απαίτηση χρήστη: πολλαπλοί admins (πολλά Gmail)
ανά tenant** — το σχήμα `(user_id, tenant_id)` το υποστηρίζει ήδη φυσικά (πολλές γραμμές,
ίδιο tenant_id, διαφορετικό user_id), καμία πρόσθετη δουλειά χρειάζεται γι' αυτό.
Λεπτομέρειες (π.χ. επίπεδα δικαιωμάτων owner/editor) αναβάλλονται σκόπιμα για όταν φτάσουμε
εκεί.

**Enforcement — RLS στη βάση, ΟΧΙ μόνο frontend gating.** Write policies πάνω σε
tenant_settings/events/products κ.λπ. θα ελέγχουν `EXISTS (SELECT 1 FROM tenant_admins
WHERE user_id = auth.uid() AND tenant_id = <tenant_id της γραμμής>)`. Ισχύει server-side,
αδύνατο να παρακαμφθεί από το frontend.

**Bootstrap του πρώτου admin ανά tenant:** Ο χρήστης (πλατφόρμα owner) το κάνει χειροκίνητα
αρχικά — ο υπεύθυνος του tenant κάνει sign in μία φορά, δίνει το email/user ID του, ο
χρήστης γράφει τη γραμμή στο `tenant_admins`. **Μελλοντικό, ρητά επιθυμητό βήμα:** αυτόματο
invite flow (πρόσκληση προγραμματιστικά) — όχι blocker τώρα, απλά σημειωμένη κατεύθυνση.

**Audit trail / "υπόλογος για ό,τι κάνει":** Στοιχειώδες επίπεδο — `updated_by uuid
references auth.users(id)` + `updated_at` σε κάθε πίνακα που γίνεται editable, γεμισμένα
ΑΥΤΟΜΑΤΑ από trigger (`new.updated_by := auth.uid()`) ώστε να είναι αδύνατο να
"ψευτιστεί" ποιος έκανε την αλλαγή. Πλήρες ιστορικό (κάθε αλλαγή, όχι μόνο η τελευταία) θα
χρειαστεί ξεχωριστό `*_history` table με trigger insert σε κάθε UPDATE — σημειωμένο ως
επιλογή για αργότερα, όχι βήμα 1.

**Next.js — ρητά εξετάστηκε και απορρίφθηκε ως άσχετο με ασφάλεια.** Ο χρήστης ρώτησε αν
χρειάζεται migration σε Next.js για να είναι "ασφαλής η ομάδα". Απάντηση: όχι — η ασφάλεια
εδώ προέρχεται από το RLS μέσα στη βάση (επίσημα συνιστώμενο pattern της ίδιας της
Supabase, ανεξάρτητα frontend framework), όχι από το framework. Το `anon key` είναι
σκόπιμα δημόσιο/client-side, ασφαλές ΜΟΝΟ λόγω RLS. Επιβεβαιωμένο ξανά: κανένα service-role
key πουθενά στο frontend, μόνο anon key — σωστή ρύθμιση. Ένα migration σε Next.js θα ήταν
τεράστια δουλειά για μηδενικό πρόσθετο όφελος ασφάλειας στο δικό μας μοντέλο απειλών. RLS
λύνει συγκεκριμένα cross-tenant data isolation — δεν είναι "100% ασφάλεια από χάκερ" (π.χ.
phishing σε admin λογαριασμό είναι ξεχωριστό θέμα, κοινό σε κάθε εφαρμογή).

**Πού ζει το dashboard:** πιθανότατα ξεχωριστό subdomain/μικρή εφαρμογή (π.χ.
`dashboard.concerto.gr`), όχι μέσα στο ίδιο site που βλέπουν οι fans — ήδη σημειωμένο
παλιότερα ως ανοιχτό θέμα, επιβεβαιώνεται εδώ.

**Κατάσταση:** Καμία αλλαγή στη βάση/κώδικα δεν έχει γίνει ακόμα γι' αυτό — καθαρά
σχεδιασμός. Το πρώτο πραγματικό βήμα χτισίματος (δημιουργία `tenant_admins` table + πρώτο
write policy δοκιμαστικά σε ένα table) θα ξεκινήσει σε επόμενο βήμα, μετά από ρητή
επιβεβαίωση του χρήστη.

---

## 🏗️ Monorepo restructure (11/9) — apps/tenant-site + packages/shared, πριν το Admin Dashboard

Αποφασίστηκε με τον χρήστη (βλ. προηγούμενη ενότητα σχεδιασμού) να χτιστεί το Tenant Admin
Dashboard μέσα σε npm workspaces monorepo, όχι ξεχωριστό repo — ρητή απόφαση με σκοπό
μελλοντική ομάδα developers να αναγνωρίσει αμέσως τη δομή (industry-standard `apps/`+
`packages/` pattern), χωρίς επανάληψη κοινού κώδικα.

**Έγινε (με πλήρη testing σε κάθε βήμα, per ρητή απαίτηση χρήστη "να τα κάνεις τεστ"):**
- Ολόκληρη η υπάρχουσα εφαρμογή μετακόμισε από root → `apps/tenant-site/` (`git mv`,
  ιστορικό διατηρήθηκε): `src/`, `public/`, `index.html`, `vite.config.js`, `package.json`
  (name: `tenant-site`), `jsconfig.json`, `components.json`, `eslint.config.js`,
  `README.md`, `.env`.
- `docs/` και `supabase/` ΜΕΝΟΥΝ στο root — project-level, όχι tenant-site-specific.
- Νέο root `package.json` με `"workspaces": ["apps/*", "packages/*"]` + convenience
  scripts (`npm run dev`/`npm run build` από το root πλέον δουλεύουν κανονικά χωρίς `cd`,
  delegate στο `apps/tenant-site` workspace· `dev:admin`/`build:admin` έτοιμα για όταν
  μπει το admin-dashboard).
- Νέο `packages/shared/` (`@concerto/shared`) με πρώτο κοινό κομμάτι: `createSupabaseClient()`
  wrapper — θα το χρησιμοποιούν και οι δύο εφαρμογές, μηδενική επανάληψη.
- Stale, redundant per-app `package-lock.json` αφαιρέθηκε (npm workspaces θέλει ΕΝΑ
  lockfile στο root, όχι ανά workspace member).

**⚠️ ΚΡΙΣΙΜΟ — Netlify config ΠΡΕΠΕΙ να ενημερωθεί ΠΡΙΝ/μαζί με το επόμενο push, αλλιώς
σπάει το live auto-deploy:**
- Base directory: ΜΕΝΕΙ κενό (root) — καμία αλλαγή.
- Build command: ΜΕΝΕΙ `npm run build` — καμία αλλαγή (το νέο root script το κάνει delegate
  αυτόματα στο σωστό workspace).
- **Publish directory: ΠΡΕΠΕΙ να αλλάξει από `dist` σε `apps/tenant-site/dist`** — το build
  output μετακόμισε μαζί με την εφαρμογή. Χωρίς αυτή την αλλαγή, το Netlify θα ψάχνει σε
  λάθος φάκελο μετά το επόμενο deploy.
- Πάει στο Netlify dashboard → Site settings → Build & deploy → Build settings → Edit.

**Testing που έγινε (real evidence, όχι υποθέσεις):**
- `npm install` έτρεξε ΑΠΟ ΤΟΝ ΧΡΗΣΤΗ (το `device_bash` κανάλι τρέχει μέσα σε ξεχωριστό
  Linux VM στο Mac — ΔΕΝ έχει πρόσβαση στο npm registry, `blocked-by-allowlist` — ΚΑΙ δεν
  μπορεί να τρέξει `npm run dev`/`build` λόγω native bindings χτισμένων για macOS/arm64,
  όχι Linux. **Σημαντικός νέος κανόνας για το AI assistant: `npm run dev`/`npm run build`/
  ό,τι χρειάζεται να πραγματικά ΤΡΕΞΕΙ σε αυτό το project πρέπει να γίνεται από τον χρήστη,
  στο δικό του πραγματικό Terminal — το `device_bash` είναι μόνο για αρχεία/git.**
- Dev server επιβεβαιώθηκε live μέσω Chrome (villagers/about, strafi/about, strafi/merch) —
  σωστό rendering, μηδέν console errors, το χθεσινό merch-empty-category fix ΚΑΙ το
  TenantAbout fix επιβεβαιώθηκαν ενεργά μετά τη μετακόμιση.
- `npm run build` (από τον χρήστη) ολοκληρώθηκε καθαρά, output επιβεβαιωμένο στο σωστό
  νέο path (`apps/tenant-site/dist/`). Προϋπάρχον (όχι νέο) warning για μεγάλο JS chunk
  (910KB) — ξεχωριστό, μελλοντικό code-splitting θέμα, άσχετο με τη σημερινή αλλαγή.

**Επόμενο βήμα:** commit + push (μετά την ενημέρωση Netlify), μετά scaffold του
`apps/admin-dashboard`.

---

## ✅ Tenant Admin Dashboard (11/9) — πρώτο end-to-end test επιτυχές

Ολοκληρώθηκε το πρώτο πλήρες, λειτουργικό κομμάτι του `apps/admin-dashboard`
(δες και την προηγούμενη ενότητα σχεδιασμού/monorepo restructure):

- `LoginPage.jsx` + `useAdminAuth.js` — σύνδεση με Google, ίδιο Supabase Auth
  session/SSO μηχανισμό με το tenant-site (μέσω `packages/shared`).
- `useMyAdminTenants.js` + `DashboardHomePage.jsx` — λίστα των tenants που
  διαχειρίζεται ο συνδεδεμένος χρήστης (RLS-gated μέσω `tenant_admins`).
- `TenantProfilePage.jsx` + `useTenantProfile.js`/`useUpdateTenantProfile.js` —
  φόρμα επεξεργασίας bio/logo/cover (react-hook-form + zod + shadcn Field, ίδιο
  pattern με `FanProfileRoute.jsx`), γράφει στο `tenant_settings` μέσω του RLS
  write policy.
- Πρόσθεσα και sign-out button στο `App.jsx` (έλειπε, χρειάστηκε για το test).

**Bug που βρέθηκε και διορθώθηκε στο configuration (όχι στον κώδικα):** το
Supabase Auth δεν είχε το `http://localhost:5174` στη λίστα επιτρεπτών Redirect
URLs, οπότε μετά το Google OAuth σε έστελνε πίσω στο production Netlify URL
(`concertofamily.netlify.app`) αντί για το localhost, με error. Ο χρήστης το
διόρθωσε μόνος του: Supabase Dashboard → Authentication → URL Configuration →
Redirect URLs → πρόσθεσε `http://localhost:5174/**`.

**Missing file που βρέθηκε στο πρώτο `npm run dev:admin`:** το `field.jsx`
(αντιγραμμένο από το tenant-site) χρειάζεται και `separator.jsx`, που δεν είχε
αντιγραφεί αρχικά στο `apps/admin-dashboard/src/components/ui/`. Διορθώθηκε.

**End-to-end test επιβεβαιωμένο (Chrome, δύο tabs):**
1. Login με Google στο `localhost:5174` ✅
2. Λογαριασμός χωρίς admin δικαιώματα → σωστά βλέπει "Δεν διαχειρίζεσαι κανένα
   tenant ακόμα" (RLS δουλεύει σωστά και για ΑΡΝΗΤΙΚΗ περίπτωση) ✅
3. Προστέθηκε 2ος admin στο ΣΤΡΑΦΙ (`samalaigkonstantinos@gmail.com`) μέσω SQL
   — δοκιμάστηκε ταυτόχρονα το πολλαπλοί-admins-ανά-tenant feature ✅
4. Μετά την προσθήκη, το ΣΤΡΑΦΙ εμφανίστηκε στη λίστα ✅
5. Edit bio από το dashboard → "Αποθηκεύτηκε" ✅
6. Η αλλαγή επιβεβαιώθηκε ζωντανά στο `strafi.concerto.gr:5173/about` ✅
7. Μηδέν console errors σε όλα τα βήματα.

**Real δεδομένα admins αυτή τη στιγμή στο ΣΤΡΑΦΙ:** `xrysoulaxouliara@gmail.com`
(αρχικός/bootstrap) + `samalaigkonstantinos@gmail.com` (προστέθηκε για το test).

**Εκκρεμεί (όχι επείγον):** το bio του ΣΤΡΑΦΙ έχει αυτή τη στιγμή δοκιμαστικό
κείμενο από το test ("Δοκιμή admin dashboard...") — πρέπει να αντικατασταθεί με
πραγματικό κείμενο από τον χρήστη.

**Επόμενα βήματα (όχι ακόμα χτισμένα):** image upload UI για logo/cover (προς
το παρόν μόνο paste URL), αυτοματοποιημένο invite-flow για νέους admins (προς
το παρόν μόνο manual SQL bootstrap).

---

## 🎨 UI redesign admin-dashboard (12/9) — στυλ Fan Dashboard

Ρητό αίτημα χρήστη: το admin-dashboard να ακολουθεί την ΙΔΙΑ φιλοσοφία/στυλ
με το Fan Dashboard του tenant-site (`FanDashboardLayout.jsx`) — fixed,
στρογγυλεμένο "pill" menu πάνω-κέντρο, ημιδιάφανο με blur.

Άλλαξαν:
- `App.jsx` — νέο floating pill nav (λογότυπο Concerto αριστερά, "Αρχική"
  εικονίδιο στη μέση, `AdminAvatarMenu` δεξιά), αντί για το απλό header
  με τίτλο + κουμπί αποσύνδεσης. Ίδιο pattern με `FanDashboardLayout.jsx`
  αλλά πολύ πιο απλό (ένα μόνο nav item προς το παρόν).
- Νέο `components/AdminAvatarMenu.jsx` — ίδιο μοτίβο με το
  `AccountAvatarMenu.jsx` του tenant-site, αλλά μικρότερο (μόνο email +
  "Αποσύνδεση" — όχι "Προφίλ"/"Διαγραφή λογαριασμού", αυτά αφορούν fans).
- `LoginPage.jsx` — προστέθηκε το στρογγυλό λογότυπο Concerto πάνω από
  τον τίτλο, ίδια οπτική γλώσσα.
- `DashboardHomePage.jsx` / `TenantProfilePage.jsx` — αφαιρέθηκε ο
  διπλός outer wrapper (mx-auto/max-w/padding δίνεται πλέον ΜΙΑ φορά από
  το `App.jsx`, όπως στο Fan Dashboard) και το ξεχωριστό "← Πίσω" link
  (η επιστροφή γίνεται πλέον από το "Αρχική" εικονίδιο στο πάνω pill).
- Αντιγράφηκαν τα `dropdown-menu.jsx` (ui) και `concerto-logo.jpg` από το
  tenant-site· προστέθηκε `@heroicons/react` στο `package.json` του
  admin-dashboard (ήδη hoisted στο root node_modules, άρα δούλεψε άμεσα
  χωρίς νέο `npm install`· καλό θα ήταν πάντως να ξανατρέξει κάποια στιγμή
  για να "τυπικοποιηθεί" στο lockfile).

Δοκιμάστηκε ζωντανά (Chrome, mobile viewport): pill nav, active state στο
"Αρχική", dropdown με "Αποσύνδεση", πλοήγηση dashboard → tenant profile →
πίσω. Μηδέν console errors.

**Μικρό, γνωστό, μη-επείγον θέμα:** το avatar εικονίδιο (φωτογραφία Google
προφίλ) στο `AdminAvatarMenu` εμφανίζεται σπασμένο (broken image) — ΙΔΙΟ
pattern με το `AccountAvatarMenu.jsx` του tenant-site (δεν υπάρχει `onError`
fallback σε καμία από τις δύο υλοποιήσεις). Προϋπάρχον θέμα, όχι κάτι νέο
που εισήγαγε αυτό το redesign.

**✅ Διορθώθηκε (12/9, ίδια μέρα):** προστέθηκε `onError` handler + state
(`imageFailed`) και στα δύο components (`AdminAvatarMenu.jsx` και
`AccountAvatarMenu.jsx`) — αν η εικόνα avatar αποτύχει να φορτώσει, πέφτει
πίσω στο `UserCircleIcon` αντί να μείνει σπασμένη. `key={avatarUrl}` ώστε
να ξαναδοκιμάζει αν αλλάξει ο χρήστης/URL. Δοκιμάστηκε ζωντανά στο
admin-dashboard (Chrome) — δουλεύει. Στο tenant-site δεν έγινε live re-test
(ίδιο, ήδη επιβεβαιωμένο pattern) γιατί χρειαζόταν φρέσκο Google sign-in
στο strafi.concerto.gr:5173, το οποίο βρέθηκε (ξεχωριστό, μη-επείγον θέμα)
ότι ΔΕΝ είναι ακόμα στη λίστα Redirect URLs του Supabase (μόνο το
`http://localhost:5174/**` προστέθηκε νωρίτερα) — αν χρειαστεί ποτέ φρέσκο
OAuth test πάνω σε tenant dev subdomain, θα χρειαστεί να προστεθεί και
αυτό εκεί.

---

## ✏️ Inline admin-editing πάνω στο tenant-site (12/9) — demo επιτυχές

Ρητό αίτημα χρήστη (μετά από συζήτηση αρχιτεκτονικής — βλ. παρακάτω): μοτίβο
"Facebook Page admin" — ο admin βλέπει ΤΗΝ ΙΔΙΑ δημόσια σελίδα με τους fans
(π.χ. strafi.concerto.gr/about), αλλά με μολύβια πάνω στο cover image και
δίπλα στο bio, που ανοίγουν μικρό dialog για άμεση επεξεργασία — ΧΩΡΙΣ να
χρειάζεται να πάει στο ξεχωριστό admin-dashboard.

**Σημαντικό (συζητήθηκε ρητά με τον χρήστη πριν χτιστεί):** αυτό ΔΕΝ
αντικαθιστά το admin-dashboard — συνυπάρχουν. Το admin-dashboard παραμένει
το "backstage" (λίστα tenants, μελλοντικές πιο σύνθετες ρυθμίσεις). Το
inline editing είναι μια ΔΕΥΤΕΡΗ, πιο γρήγορη πρόσβαση πάνω στην ΙΔΙΑ βάση/
RLS — καμία απώλεια από τη δουλειά που έγινε στο admin-dashboard.

Νέα αρχεία (`apps/tenant-site/src/`):
- `hooks/useIsTenantAdmin.js` — ελέγχει live (μέσω `tenant_admins`) αν ο
  συνδεδεμένος χρήστης είναι admin ΤΟΥ ΣΥΓΚΕΚΡΙΜΕΝΟΥ tenant που βλέπει.
- `lib/tenantProfileSchema.js` — ίδιο schema με το admin-dashboard, σκόπιμη
  μικρή επανάληψη (ίδια λογική με `AccountAvatarMenu`/`AdminAvatarMenu`).
- `queries/useUpdateTenantSettings.js` — ίδιο write με το admin-dashboard,
  invalidate στο `['tenant', domain]` (`useTenant.js`) ώστε η αλλαγή να
  φανεί αμέσως, χωρίς refresh.
- `components/Header/EditCoverImageDialog.jsx` — μολύβι πάνω-δεξιά στο
  cover image (`Header.jsx`, μέσα σε νέο `relative` wrapper).
- `components/About/EditBioDialog.jsx` — μικρό μολύβι δίπλα στο
  "Πληροφορίες" (`InfoRoute.jsx`).
- `isAdmin` περνάει από το `Header.jsx` → `Outlet context` → `InfoRoute.jsx`
  (υπολογίζεται ΜΙΑ φορά στο Header, μέσω `useIsTenantAdmin`).

**Config που χρειάστηκε (βρέθηκε κατά τη δοκιμή):** το
`http://strafi.concerto.gr:5173/**` δεν ήταν στη λίστα Redirect URLs του
Supabase (μόνο villagers/athensrock/localhost/netlify ήταν ήδη εκεί, από
προηγούμενες συνεδρίες) — ο χρήστης το πρόσθεσε ο ίδιος.

**Δοκιμάστηκε πλήρως ζωντανά (Chrome, strafi.concerto.gr:5173, ως
samalaigkonstantinos@gmail.com — 2ος admin του ΣΤΡΑΦΙ):**
1. Login → μολύβια εμφανίζονται σωστά (μόνο επειδή είναι admin) ✅
2. Άλλαξε cover image URL → ενημερώθηκε ζωντανά, dialog έκλεισε ✅
3. Άλλαξε bio → ενημερώθηκε ζωντανά, dialog έκλεισε ✅
4. Μηδέν console errors σε όλο το flow.

**Εκκρεμεί (όχι επείγον):** το bio του ΣΤΡΑΦΙ έχει τώρα δοκιμαστικό κείμενο
από αυτό το test ("ΣΤΡΑΦΙ — μουσικό συγκρότημα. Νέο bio, γραμμένο απευθείας
από τη δημόσια σελίδα...") και το cover image είναι μια τυχαία φωτογραφία
δοκιμής (picsum.photos) — να αντικατασταθούν με πραγματικά στοιχεία.

**Επόμενο βήμα προς συζήτηση:** ίδιο μοτίβο (μολύβι/κουμπί) για "Πρόσθεσε
event" στο tab Εκδηλώσεις — βήμα-βήμα wizard δημιουργίας event, όπως
περιέγραψε ο χρήστης. Δεν έχει χτιστεί ακόμα.

---

## 📤 Πραγματικό image upload (12/9) — αντί για paste URL

Ρητό αίτημα χρήστη (μετά το πρώτο inline-editing demo): αντί να επικολλά
URL, ο admin να μπορεί να ανεβάσει εικόνα ΑΠΕΥΘΕΙΑΣ από τον υπολογιστή
του, με ρητή απαίτηση "τήρησε όλους τους κανόνες ασφαλείας ώστε να μην
ανεβάσει κανείς malware και κρασάρει το app".

**Νέο migration:** `supabase/migrations/20260911170000_add_tenant_images_storage.sql`
(έτρεξε ο χρήστης, επιβεβαιωμένο μέσω query στα `pg_policies`/`storage.buckets`):
- Bucket `tenant-images`, public (μόνο για READ — οι fans βλέπουν εικόνες
  χωρίς login), με **server-side** `file_size_limit` (5MB) και
  `allowed_mime_types` (jpg/png/webp/gif) — επιβάλλεται από το ίδιο το
  Supabase Storage σε ΚΑΘΕ upload, όχι μόνο από το frontend μας.
- RLS policies (insert/update/delete) πάνω στο `storage.objects`: μόνο
  admin ΤΟΥ ΣΥΓΚΕΚΡΙΜΕΝΟΥ tenant μπορεί να γράψει στο δικό του "φάκελο"
  (path `<tenant_id>/...`, ελέγχεται μέσω `storage.foldername(name)` +
  `tenant_admins`) — ίδιος μηχανισμός με το `tenant_settings`.

**Γιατί είναι ασφαλές από "malware/crash":** το Storage απλά αποθηκεύει/
σερβίρει bytes, ΔΕΝ εκτελεί ποτέ ό,τι ανεβαίνει· ένα `<img>` μπορεί μόνο
να προσπαθήσει να το δείξει ΣΑΝ εικόνα (αν αποτύχει, απλά σπασμένο
εικονίδιο, όχι crash). Δύο επίπεδα ελέγχου: client-side (γρήγορο feedback)
+ server-side στο ίδιο το bucket (δεν παρακάμπτεται από το UI μας).

**Νέα/αλλαγμένα αρχεία (`apps/tenant-site/src/`):**
- `queries/useUploadTenantImage.js` (NEW) — validate τύπου/μεγέθους,
  upload σε `tenant-images/<tenantId>/<prefix>-<timestamp>.<ext>`,
  επιστρέφει το public URL.
- `components/Header/EditCoverImageDialog.jsx` (v2) — αντικαταστάθηκε το
  πεδίο URL με πραγματικό file input (κρυφό, trigger μέσω κουμπιού) +
  preview (object URL, με cleanup στο unmount/close) + "Επίλεξε
  εικόνα"/"Αποθήκευση". Στο submit: upload πρώτα (Storage), μετά
  `useUpdateTenantSettings` με το public URL.

**Δοκιμάστηκε πλήρως ζωντανά (Chrome, strafi.concerto.gr:5173):** επιλογή
πραγματικού αρχείου εικόνας (JPEG) → preview σωστό → upload → η αλλαγή
φαίνεται αμέσως ΚΑΙ επιβιώνει σε πλήρες page reload (άρα πραγματικά
αποθηκεύτηκε στο Storage/tenant_settings, όχι μόνο τοπικό blob preview).
Μηδέν console errors σε όλο το flow.

**✅ Προστέθηκε ΚΑΙ για το λογότυπο (ίδια μέρα, 12/9):** νέο
`components/Header/EditLogoImageDialog.jsx` — ίδιο μοτίβο με το cover
(ίδιο `useUploadTenantImage`, `prefix: "logo"` αντί για `"cover"` ώστε τα
δύο αρχεία να μη συγκρούονται μέσα στον ίδιο φάκελο tenant), μικρό
κυκλικό μολύβι πάνω-δεξιά στο στρογγυλό avatar (`Header.jsx`, μέσα σε
νέο `relative shrink-0` wrapper). Δοκιμάστηκε πλήρως ζωντανά (upload
πραγματικού αρχείου → άλλαξε αμέσως → επιβίωσε σε reload) — μηδέν
console errors.

---

## 🧩 shadcn/Radix UI kit + Tiptap rich-text editor (12–13/9)

Ρητό αίτημα χρήστη: 5 νέα shadcn/Radix components (`sonner`, `combobox`, `progress`, `skeleton`, `toggle-group`) + Tiptap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) για rich-text bio editing.

**Δύο side-effects του shadcn CLI εντοπίστηκαν και διορθώθηκαν:**
- Τα νεότερα CLI templates εισάγουν το `cn` από ξεχωριστό npm package αντί για το δικό μας `@/lib/utils` — επαναφέρθηκε σε button/input/textarea/input-group/skeleton (2 φορές, το CLI το ξανάφερε σε δεύτερο `shadcn add`).
- **Σοβαρότερο:** το Radix δεν έχει native Combobox primitive — ακόμα κι όταν το `components.json` έχει `"style": "radix-nova"`, το CLI's `combobox` block χρησιμοποιεί πάντα `@base-ui/react`. Αντί να το δεχτούμε, χτίστηκε **custom Combobox** πάνω σε Popover(Radix)+Command(cmdk) — `components/ui/combobox.jsx` — ώστε να μείνουμε 100% Radix, όπως ζήτησε ρητά ο χρήστης.
- **⚠️ Near-miss data loss:** ένα δεύτερο `npx shadcn add popover command` ξαναέγραψε το `dialog.jsx` από το pristine template, σβήνοντας το ήδη-χτισμένο, uncommitted `useVisualViewportMaxHeight()` hook (mobile keyboard fix). Ανακατασκευάστηκε από τη μνήμη της συνομιλίας. **Μάθημα για το μέλλον:** πρόσεχε πριν από κάθε `shadcn add` κοντά σε ήδη custom-ποιημένα ui/ αρχεία — μπορεί να τα ξαναγράψει σιωπηλά.

**Skeleton loading states** — αντικαταστάθηκαν ~16 "Φόρτωση..."/κενές καταστάσεις σε όλο το project με πραγματικά `Skeleton` placeholders. 3 νέα reusable helper components: `card-grid-skeleton.jsx`, `loading-dialog.jsx`, `FanListSkeleton.jsx`.

**RichTextEditor** (`components/ui/rich-text-editor.jsx`) — Tiptap v3 (`useEditor`+`useEditorState`, σημείωση: το v3 δεν κάνει πια auto-rerender σε κάθε transaction by default) + `ToggleGroup` toolbar (Bold/Italic/Strike/λίστες). Wired στο bio editor του tenant-site (`EditBioDialog.jsx`) — legacy plain-text bio μετατρέπεται αυτόματα σε HTML την πρώτη φορά, όριο χαρακτήρων μετράει το stripped plain-text (όχι το HTML markup). ⚠️ **Ανοιχτό:** το `apps/admin-dashboard` έχει ΔΙΚΟ ΤΟΥ, ξεχωριστό bio editor που ΔΕΝ αναβαθμίστηκε στο ίδιο rich-text — flagged στον χρήστη, καμία απάντηση ακόμα.

---

## 🎟️ Event wizard: modal → πραγματική σελίδα + custom αναζήτηση Google Places (12–13/9)

Το παλιό `AddEventWizard.jsx` (modal) **διαγράφηκε** και αντικαταστάθηκε από `EventFormPage.jsx`/`EventFormRoute.jsx` — πραγματική σελίδα με δικό της URL (`events/event/new`, `events/event/:eventId/edit`), ίδιο μοτίβο με το υπόλοιπο routing.

Νέα λειτουργικότητα, όλα ρητά αιτήματα χρήστη:
- **Cover-image fallback** — αν ο admin δεν ανεβάσει εικόνα event, μπαίνει αυτόματα το cover image του tenant (`Header.jsx` περνάει `coverImageUrl` μέσω Outlet context, καμία επιπλέον DB call).
- **`LocationMapPreview.jsx`** (νέο) — στατική προεπισκόπηση χάρτη (Google Static Maps API) κάτω από το πεδίο τοποθεσίας, μόλις επιλεγεί μέρος. Ο χρήστης διάλεξε ρητά τη στατική εικόνα αντί για interactive χάρτη (φθηνότερο SKU — Static Maps ≠ Maps JS/Places, χρεώνονται ξεχωριστά παρόλο που μοιράζονται το ίδιο key).
- **`LocationPickerDialog.jsx` ξαναγράφτηκε εξ' ολοκλήρου.** Η αρχική υλοποίηση χρησιμοποιούσε το επίσημο `PlaceAutocompleteElement` widget της Google — αλλά αυτό έχει ΔΙΚΟ ΤΟΥ, μη-στυλιζόμενο dropdown που σε mobile ανοίγει σαν ξεχωριστή full-screen σκούρα οθόνη αντί να δείχνει αποτελέσματα μέσα στο δικό μας dialog (ρητή αναφορά χρήστη με screenshots). Λύση: καλούμε απευθείας το προγραμματικό `AutocompleteSuggestion.fetchAutocompleteSuggestions()` (επίσημο, μη deprecated API) και ζωγραφίζουμε τη ΔΙΚΗ ΜΑΣ λίστα αποτελεσμάτων, ίδιο look-and-feel με το υπόλοιπο app, με session token + debounce.
- Κάθε βήμα του wizard τυλίγεται τώρα σε bordered/shadow "κάρτα", πιο εμφανής progress bar με ποσοστό, toast επιβεβαιώσεις (sonner) σε δημιουργία/ενημέρωση/διαγραφή, το ticket-type πεδίο έγινε Combobox αντί για native `<select>`.
- Ο standalone τίτλος πάνω από κάθε βήμα αφαιρέθηκε εντελώς (έμεινε μόνο η progress bar)· στο βήμα επιβεβαίωσης εισιτηρίων, το "Επιβεβαίωση εισιτηρίων" μπήκε ΜΕΣΑ στο bordered div των κατηγοριών, όχι σαν ξεχωριστή επικεφαλίδα.
- ⚠️ **Ανοιχτό/μικρή ασυνέπεια:** το τελευταίο κουμπί στο βήμα επιβεβαίωσης λέει "Ολοκλήρωση" αλλά ΔΕΝ αποθηκεύει το event — απλά προχωράει στο τελικό βήμα υποβολής. Flagged στον χρήστη ως πιθανά παραπλανητικό όνομα, καμία απόφαση ακόμα.

**Google Maps API — production bug βρέθηκε & διορθώθηκε (χρήστης το επιβεβαίωσε, "όλα καλά λειτουργούν"):** η αναζήτηση τοποθεσίας δούλευε τοπικά αλλά έσκαγε στο Netlify — αιτία: το API key έχει HTTP referrer restriction (μόνο concerto.gr subdomains + localhost), δεν είχε το netlify.app domain. Ο χρήστης το πρόσθεσε στο Google Cloud Console. **Σημείωση για το μέλλον:** αν προστεθεί custom domain ή αλλάξει το Netlify URL, το ίδιο restriction θα χρειαστεί ενημέρωση.

---

## 📱 Mobile responsiveness bug: header tabs ξεχείλιζαν σε στενές οθόνες (14/9)

Αναφορά χρήστη (μέσω φίλου με Android ~360px πλάτος): "όλο το site φαίνεται πιο μικρό και έχει κενό". **Root cause εντοπίστηκε με πραγματικό test σε 360px:** τα 3 pill buttons (Πληροφορίες/Εκδηλώσεις/Merch Store) στο `Header.jsx` ήταν flex με σταθερό πλάτος (`shrink-0` default του Button + `whitespace-nowrap` + `px-4`) — μαζί ξεπερνούσαν το διαθέσιμο πλάτος, το "Merch Store" έκοβε έξω από την οθόνη. Επειδή αυτό συμβαίνει στο ΚΟΙΝΟ header (άρα σε κάθε tab/σελίδα), το mobile browser κάνει αυτόματο zoom-out σε ΟΛΗ τη σελίδα για να χωρέσει το πλατύτερο περιεχόμενο — απ' αυτό η εντύπωση "όλο το project φαίνεται μικρότερο".

**Διόρθωση:** τα tabs έγιναν `grid grid-cols-3` (ισομερή, μαθηματικά αδύνατο να ξεχειλίσουν, όσο μεγάλο κι αν είναι το κείμενο). Προληπτικά προστέθηκε `flex-wrap` και στη διπλανή γραμμή (follow button + εικονίδια search/αγαπημένα/καλάθι όταν ο fan είναι συνδεδεμένος) — ίδιο ρίσκο overflow, δεν είχε επιβεβαιωθεί ζωντανά αλλά ο υπολογισμός έδειχνε οριακό fit.

**Ίδια μέρα, στυλιστικά αιτήματα:** border-bottom κάτω από τα tabs (διαχωρισμός tabs/περιεχομένου), λίστα events + event wizard τυλίχτηκαν σε απαλό γκρι στρογγυλεμένο panel (ίδιο ύφος με το Merch Store) ώστε η ήδη υπάρχουσα `shadow-sm/md` στις κάρτες να φαίνεται πραγματικά (πριν ήταν αόρατη, λευκό πάνω σε λευκό).

**⚠️ Δεν επιβεβαιώθηκε ακόμα visual σε πραγματικό local dev από το Claude session** (χρειάζεται tenant subdomain π.χ. `villagers.concerto.gr:5173` από το `/etc/hosts` του υπολογιστή — δεν ήταν προσβάσιμο από το built-in browser αυτής της συνεδρίας, μόνο από το stale deployed Netlify build). Καλό θα ήταν ένα ρητό ζωντανό "ναι, φαίνεται σωστά τώρα" από τον χρήστη ή τον φίλο του.

---

## 🧹 Καθαρισμός + commit (12–14/9)

- Αφαιρέθηκαν leftover placeholder κουμπιά "Message"/"Call" από το `Header.jsx` (μοναδική εμφάνιση, χωρίς λειτουργικότητα).
- **Commit `29a14f2`** — "Rebuild event wizard as a page, add rich-text bio editor and shadcn UI kit, fix mobile tab overflow" — 48 αρχεία, όλη η παραπάνω δουλειά. **Έγινε ΜΟΝΟ commit, ΟΧΙ push** — ο χρήστης θα το κάνει push ο ίδιος. ⚠️ Χρειάζεται επιβεβαίωση ότι όντως έγινε push πριν συνεχίσουμε πάνω σε αυτό.
- Εκκρεμεί ακόμα (δόθηκε στον χρήστη, δεν έχει επιβεβαιωθεί): `npm uninstall @base-ui/react cn` — δύο πλέον αχρησιμοποίητα deps μετά τον custom Combobox.
- Βρέθηκε ένας untracked φάκελος `Claude outputs/tenant_images_storage.sql` στη ρίζα του repo (παλιό scratch αρχείο, άσχετο με τη σημερινή δουλειά) — **σκόπιμα ΔΕΝ μπήκε στο commit.** Να αποφασίσει ο χρήστης αν θα το κρατήσει ή θα το σβήσει.

**Για αύριο, με προτεραιότητα:**
1. Επιβεβαίωση ότι το commit `29a14f2` έγινε push, και ότι το Netlify deploy το πήρε σωστά.
2. Ζωντανό visual check του mobile fix (360px) — από τον χρήστη ή τον φίλο του.
3. Απόφαση: rename "Ολοκλήρωση" button, upgrade admin-dashboard bio editor σε Tiptap (και τα δύο flagged, καμία απάντηση ακόμα).
4. `npm uninstall @base-ui/react cn` αν δεν έχει γίνει ήδη.
5. Τι να γίνει με το `Claude outputs/tenant_images_storage.sql`.

---

## 🛒 Merch checkout: reserve stock → pending order, μέχρι το σημείο του Stripe call (14/9)

Ρητό αίτημα χρήστη: "ασχοληθούμε με το merch και να φτάσουμε μέχρι το βήμα που χρειάζεται να κάνω call το API της Stripe". Υλοποιήθηκε ό,τι είχε ήδη σχεδιαστεί (αλλά ποτέ χτιστεί) στην ενότητα "Race Conditions & Overselling" παραπάνω — atomic stock reservation + hold με λήξη χρόνου, ΧΩΡΙΣ το ίδιο το Stripe integration (σκόπιμα, δεν υπάρχει ακόμα κανένα serverless function scaffold στο repo — confirmed, καμία τεκμηρίωση για αυτό ξεκίνησε σήμερα).

**Νέο migration:** `supabase/migrations/20260914150000_add_orders_checkout.sql` (**εκκρεμεί να το τρέξει ο χρήστης στο Supabase SQL editor**, ίδιο workflow με κάθε προηγούμενο migration):
- **`orders`** (tenant_id, fan_id, status `pending/completed/expired/cancelled`, subtotal, expires_at, stripe_payment_intent_id) + **`order_items`** (order_id, product_id, quantity, unit_price — snapshot τιμής τη στιγμή της παραγγελίας, ίδιο μοτίβο με το `favorites.price_at_favorite`). RLS: μόνο SELECT για τον ιδιοκτήτη fan σε ΚΑΙ τα δύο tables (ίδιο pattern με `event_favorites`) — καμία insert/update policy, όλες οι εγγραφές περνάνε αποκλειστικά από τα RPCs παρακάτω.
- **`create_order_from_cart(p_fan_id, p_tenant_id)`** — SECURITY DEFINER RPC (ίδιο στυλ με το `delete_own_account()`), μετατρέπει το τρέχον `cart_items` ενός fan σε μία pending παραγγελία με 10λεπτο hold: atomic `UPDATE products SET stock_quantity = stock_quantity - qty WHERE stock_quantity >= qty` ανά γραμμή (η ίδια η WHERE συνθήκη εγγυάται μηδενικό overselling, καμία εφαρμογή-επίπεδο κλειδώματος) — αν έστω μία γραμμή αποτύχει (εξαντλημένο προϊόν), όλη η function call αναιρείται αυτόματα (Postgres atomicity), το order ΔΕΝ δημιουργείται, το καλάθι μένει άθικτο. Ρητός έλεγχος `auth.uid() = p_fan_id` μέσα στη function (defense in depth, αφού το SECURITY DEFINER παρακάμπτει RLS).
- **`expire_stale_orders()`** — SECURITY DEFINER, τρέχει σε **pg_cron schedule κάθε λεπτό** (`cron.schedule('expire-stale-orders', '* * * * *', ...)`) — **το δεύτερο pg_cron job σε αυτό το project** — υπήρχε ήδη ένα προϋπάρχον jobid=1 (`delete-expired-events`, ανά ώρα, διαγράφει παλιά tickets/events >24ωρών) που δεν είχε ποτέ τεκμηριωθεί σε κανένα brief (δημιουργήθηκε απευθείας στο Supabase dashboard, όπως και τα `cart_items`/`adjust_cart_quantity` — ίδιο pattern μη τεκμηριωμένων migrations). ⚠️ **Ο χρήστης πρέπει να ενεργοποιήσει το extension `pg_cron`** (Supabase dashboard → Database → Extensions) **ΠΡΙΝ** τρέξει το migration, αλλιώς σκάει το `cron.schedule()` στο τέλος του αρχείου. Επαναφέρει το δεσμευμένο stock + βάζει `status = 'expired'` σε κάθε pending order που πέρασε το `expires_at` του.

**Frontend (`apps/tenant-site/src/`):**
- `queries/useCreateOrder.js` (NEW) — mutation, καλεί το RPC, invalidate το cart query σε επιτυχία.
- `queries/useOrder.js` (NEW) — φέρνει μία παραγγελία + order_items(product), `refetchInterval` 15s όσο είναι `pending` (να "πιάνει" έγκαιρα τη λήξη που κάνει το pg_cron server-side).
- `components/Merch/CartDialog.jsx` — το "Ολοκλήρωση παραγγελίας" έγινε πραγματικό κουμπί (ήταν πάντα disabled placeholder). Σε επιτυχία κλείνει το dialog + πάει στη νέα σελίδα παραγγελίας· σε αποτυχία (πιο συχνό σενάριο: κάποιος άλλος αγόρασε το τελευταίο ίδιο τη στιγμή) δείχνει φιλικό μήνυμα inline, το καλάθι μένει όπως ήταν.
- `components/Merch/OrderSummaryRoute.jsx` (NEW), route `merch/order/:orderId` (`main.jsx`) — flat sibling του `merch`/`merch/category/:categoryKey`, ίδιο μοτίβο "πραγματική σελίδα, όχι modal" με το event wizard. Δείχνει γραμμές παραγγελίας + σύνολο, ζωντανό countdown (mm:ss) μέχρι το `expires_at`, και ένα κουμπί **"Πληρωμή" — υπαρκτό, στυλιζόμενο, clickable, αλλά ο handler είναι ρητό stub** με σχόλιο TODO που εξηγεί ακριβώς τι λείπει (serverless function με το Stripe secret key, PaymentIntent, webhook για να γίνει το order `completed`). Αν η παραγγελία λήξει ενώ ο fan είναι στη σελίδα (ή επιστρέψει αργότερα), δείχνει μήνυμα λήξης + κουμπί "Πρόσθεσε ξανά στο καλάθι" (re-άδειασμα των ίδιων προϊόντων μέσω του ήδη υπάρχοντος `addItem`).

**✅ Migration τρέξε επιτυχώς, pg_cron job ενεργό** — επιβεβαιώθηκε με `select * from cron.job;`: jobid=2 (`expire-stale-orders`, `* * * * *`, `select public.expire_stale_orders();`) είναι active. **⚠️ Ακόμα δεν επιβεβαιώθηκε ζωντανά το ίδιο το checkout flow στο browser** (προσθήκη στο καλάθι → checkout → επιβεβαίωση ότι μειώθηκε το stock_quantity και άδειασε το cart_items → δοκιμή "εξαντλημένο προϊόν" σενάριο → προαιρετικά, δοκιμή λήξης hold περιμένοντας το pg_cron).

**Ρητά εκτός scope σήμερα (επόμενο βήμα, όποτε αποφασιστεί):** το ίδιο το Stripe integration — serverless function (Netlify Functions ή Supabase Edge Functions, κανένα scaffold δεν υπάρχει ακόμα) για το PaymentIntent + webhook που κάνει το order `completed`. Επίσης εκτός scope: μια λίστα "όλες οι παραγγελίες μου" στο Fan Dashboard (`FanOrdersRoute.jsx` παραμένει placeholder, δεν συνδέθηκε με τα νέα tables σήμερα — εύκολο follow-up μόλις υπάρχουν πραγματικά completed orders).

**⚠️⚠️ ΚΡΙΣΙΜΟΣ ΚΑΝΟΝΑΣ ΓΙΑ ΟΤΑΝ ΧΤΙΣΤΕΙ ΤΟ STRIPE (Ή ΟΠΟΙΟΔΗΠΟΤΕ ΑΛΛΟ ΣΥΣΤΗΜΑ ΠΛΗΡΩΜΗΣ) — 15/9, ρητό αίτημα χρήστη να αποθηκευτεί εδώ, ρωτούσε τι θα γινόταν αν δύο users παλεύουν για το ίδιο ρούχο ταυτόχρονα:**

Η σειρά ΠΡΕΠΕΙ να είναι πάντα: **πρώτα κλειδώνει/δεσμεύεται το απόθεμα (already built, `create_order_from_cart` → order status `pending`), ΜΕΤΑ ζητάμε τα λεφτά.** ΠΟΤΕ το αντίστροφο — ποτέ χρέωση πριν επιβεβαιωθεί ότι το atomic `UPDATE ... WHERE stock_quantity >= qty` πέτυχε. Αν χτιστεί ανάποδα (π.χ. Stripe PaymentIntent πριν το `create_order_from_cart`, ή χωρίς να ελέγχεται ότι το order είναι ακόμα `pending`/μη ληγμένο πριν το `completed`), υπάρχει σενάριο κάποιος να πληρώσει για κάτι που δεν υπάρχει πια — αυτό είναι το ΝΟΥΜΕΡΟ ΕΝΑ πράγμα που πρέπει να αποφευχθεί.

Συγκεκριμένα σημεία προσοχής όταν χτιστεί το serverless function/webhook:
- Το **PaymentIntent/checkout session της Stripe να δημιουργείται ΜΟΝΟ για order που ΗΔΗ έχει status `pending`** (δηλαδή το `create_order_from_cart` έχει ήδη τρέξει επιτυχώς και το stock είναι ήδη δεσμευμένο) — ποτέ να μη ζητάμε στοιχεία κάρτας πριν επιβεβαιωθεί η δέσμευση.
- **Race με τη λήξη του 10λεπτου hold:** αν το webhook επιβεβαίωσης πληρωμής (Stripe → εμάς) καθυστερήσει και έρθει ΑΦΟΥ το `expire_stale_orders` (τρέχει κάθε λεπτό μέσω pg_cron) έχει ήδη επαναφέρει το stock και μαρκάρει το order `expired`, χρειάζεται ρητή λογική reconciliation στο webhook handler: αν το order δεν είναι πια `pending` όταν έρθει η επιβεβαίωση πληρωμής, ΔΕΝ γίνεται απλά `completed` — είτε γίνεται αυτόματο refund + ενημέρωση fan, είτε (αν υπάρχει ακόμα απόθεμα) ξαναδοκιμάζεται η δέσμευση. Να αποφασιστεί ρητά ΠΡΙΝ γραφτεί ο κώδικας, όχι ενδιάμεσα.
- Το 10λεπτο hold είναι σκόπιμα γενναιόδωρο για ένα κανονικό checkout με κάρτα — δεν χρειάζεται να μεγαλώσει "για σιγουριά", καλύτερα να μείνει μικρό ώστε το απόθεμα να ελευθερώνεται γρήγορα αν κάποιος εγκαταλείψει.
- Πιθανό μελλοντικό (όχι τώρα, μόνο αν γίνει πρόβλημα στην πράξη): κάποιος κακόβουλος θα μπορούσε επανειλημμένα να γεμίζει καλάθι + να πατάει checkout (δεσμεύοντας stock για 10 λεπτά) χωρίς ποτέ να πληρώνει, "κρατώντας όμηρο" τη διαθεσιμότητα. Λύση αν χρειαστεί: rate limiting σε active pending orders ανά fan — δεν χτίζεται προληπτικά τώρα.

Η υπόλοιπη αλυσίδα (atomic UPDATE στη βάση, whole-transaction rollback αν αποτύχει έστω μία γραμμή, ζωντανό μήνυμα σφάλματος στον χαμένο χρήστη) είναι ΗΔΗ σωστά χτισμένη και δοκιμασμένη — δες `create_order_from_cart`/`expire_stale_orders` στο `20260915120000_add_product_variants.sql` (το `create or replace` version, με per-variant stock) για την ακριβή λογική.

**Για την επόμενη φορά, με προτεραιότητα:**
1. Ο χρήστης τρέχει το migration `20260914150000_add_orders_checkout.sql` στο Supabase (μετά από ενεργοποίηση pg_cron extension).
2. Ζωντανό browser test ολόκληρου του flow (βλ. παραπάνω).
3. Commit + push της σημερινής δουλειάς.
4. Απόφαση πότε χτίζεται το πραγματικό Stripe integration (serverless function + webhook) — μεγάλο, ξεχωριστό task.

**⚠️ Ενημέρωση 18/9, να το θυμόμαστε όταν χτιστεί το παραπάνω:** το
`orders`/`order_items` table ΔΕΝ έχει σήμερα πεδία για ΦΠΑ ή έξοδα
αποστολής — το `order.subtotal` είναι μόνο το άθροισμα `price × quantity`.
Η σελίδα του καλαθιού (`/merch/cart`) όμως δείχνει πλέον στον fan
ανάλυση με ΦΠΑ 24% + 3€ αποστολή (βλ. ενότητα "18/9 — Καλάθι: ανάλυση
καθαρής αξίας/ΦΠΑ 24%/εξόδων αποστολής" παρακάτω, `lib/pricing.js`) — άρα
όποτε χτιστεί το πραγματικό Stripe integration, θα χρειαστεί μικρό
migration (νέες στήλες στο `orders`) + ενημέρωση του
`create_order_from_cart` RPC ώστε το ΠΡΑΓΜΑΤΙΚΟ ποσό που χρεώνεται να
ταιριάζει με αυτό που είδε ο fan στο καλάθι, αλλιώς θα υπάρχει ασυμφωνία
μεταξύ των δύο σελίδων.

---

## 🔗 Product overview: νέα, μοιράσιμη σελίδα προϊόντος (14/9)

Ρητό αίτημα χρήστη, με reference component (Tailwind Plus product page) που έστειλε ο ίδιος: "ένα component το οποίο να είναι product overview για να μπορεί να το κάνει share το link". Ερωτήθηκε ρητά (AskUserQuestion) πού θα ζει σε σχέση με το υπάρχον "Γρήγορη αγορά" modal (`ProductQuickShop`/`ProductModalRoute`, στο `merch/product/:productId`) — ο χρήστης διάλεξε **νέα, ξεχωριστή σελίδα** (όχι αντικατάσταση, όχι modal).

**Νέο route:** `merch/overview/:productId` (`main.jsx`) — flat sibling, ίδιο μοτίβο με `merch/order/:orderId` (πραγματική σελίδα, αντικαθιστά το grid, όχι modal πάνω του). Δέχεται UUID ή slug (`isUuid` helper, ίδιο pattern με `ProductModalRoute`/`EventModalRoute`).

**Νέο αρχείο:** `components/Merch/ProductOverviewRoute.jsx` — προσαρμογή του reference σε πραγματικά δεδομένα/πατέρνα του project, ΧΩΡΙΣ τα fake/placeholder κομμάτια του Tailwind demo:
- Αφαιρέθηκαν εντελώς: reviews/ratings (ρητό αίτημα — "επειδή είσαι έξυπνος δεν θα χρησιμοποιήσεις τις κριτικές"), το "Fabric & Care" bullet list και το "Policies" section (delivery/loyalty) — καμία αντίστοιχη στήλη υπάρχει στο πραγματικό `products` schema, θα ήταν fake copy.
- Gallery: πραγματικά `product.image_urls`, όχι static assets.
- Χρώμα/Μέγεθος: κρατήθηκε ΜΟΝΟ το μέγεθος (decorative-only, ίδιο pattern με το ήδη υπάρχον `ProductQuickShop.jsx` — δεν υπάρχει πεδίο per-size stock). Το fake color swatch ΔΕΝ μεταφέρθηκε (δεν αντιστοιχεί σε καμία πραγματική στήλη, ήταν ήδη disabled/no-op στο quick shop).
- Προστέθηκε ένδειξη "Προσωρινά εξαντλημένο" από το ήδη υπάρχον `stock_quantity` (το ίδιο πεδίο που ήδη χρησιμοποιεί το `create_order_from_cart` RPC στο checkout) — μόνο ένδειξη/disable του κουμπιού, καμία νέα backend λογική.
- **Κουμπί κοινοποίησης** (το ζητούμενο): `navigator.share()` όταν υποστηρίζεται (native share sheet), αλλιώς `navigator.clipboard.writeText()` + `toast.success` (sonner, ίδιο pattern με `EventFormPage.jsx`/`DeleteEventDialog.jsx`).
- Favorite toggle (heart icon) — ίδιο hook (`useFavorites`/`useToggleFavorite`) με `ProductList.jsx`, για συνέπεια.
- "Προσθήκη στο καλάθι" μέσω του ήδη υπάρχοντος `context.onAddToCart` (Outlet context από `Header.jsx`) — ίδιο pattern με `ProductQuickShop.jsx`, δέχεται και αποσυνδεδεμένο επισκέπτη από κοινοποιημένο link (`onRequireAuth`).

**`ProductList.jsx` (MODIFIED):** το κλικ πάνω στη φωτογραφία προϊόντος πήγαινε πριν στο παλιό `ProductGallery.jsx` modal (μόνο φωτογραφίες, τίποτα άλλο) — τώρα πάει στη νέα σελίδα (`/merch/overview/${product.slug}`, **απόλυτο** path γιατί το route είναι flat sibling, όχι nested κάτω από `merch/category/:categoryKey` όπου ζει το `ProductList`). Το "Γρήγορη αγορά" κουμπί/modal ΔΕΝ άλλαξε καθόλου.

**⚠️ Εκκρεμότητα, ρητά ΔΕΝ έγινε χωρίς να ρωτηθεί:** το `components/Merch/ProductGallery.jsx` (το παλιό photo-only modal) έμεινε στο repo, πλέον αχρησιμοποίητο — δεν διαγράφηκε (νέος κανόνας χρήστη, βλ. "Οδηγία προς AI assistant" παρακάτω: καμία διαγραφή χωρίς ρώτημα πρώτα). Να αποφασίσει ο χρήστης αν θα το σβήσει.

**Verification:** `npx eslint` στα 3 αγγιγμένα αρχεία — καθαρό. Πλήρες `npx eslint .` στο project — ίδιο baseline, 19 errors/1 warning, καμία νέα παλινδρόμηση. **Δεν έχει δοκιμαστεί ακόμα ζωντανά σε browser.**

**Για την επόμενη φορά:**
1. Ζωντανό browser test: κλικ σε φωτογραφία προϊόντος από το merch grid → επιβεβαίωση ότι ανοίγει η νέα σελίδα στο σωστό URL, gallery/περιγραφή/τιμή σωστά, "Προσθήκη στο καλάθι" δουλεύει, κουμπί κοινοποίησης αντιγράφει σωστά το link.
2. Απόφαση για το `ProductGallery.jsx` (διαγραφή ή όχι).
3. Commit + push (μαζί με το merch checkout της προηγούμενης ενότητας — ακόμα δεν έχει γίνει κανένα commit σήμερα).

---

## 🟢 StockBadge: reusable badge διαθεσιμότητας (14/9)

Ρητό αίτημα χρήστη, με 4 screenshots reference (breadcrumb, product overview panel, ένα πράσινο "Διαθέσιμα" pill, και η κάρτα του grid) — ήθελε ΕΝΑ reusable component για διαθεσιμότητα stock, να χρησιμοποιείται παντού χωρίς επανάληψη κώδικα, χρωματισμένο σε 4 tiers.

**Πριν το χτίσουμε, έγινε WebSearch/WebFetch** (ρητό αίτημα χρήστη — "αν το έχεις ψάξει, δες πώς τα χωρίζουν μεγάλα eshop") σε άρθρα για low-stock badge UX. Εύρημα: τα περισσότερα e-shop δείχνουν τον ακριβή αριθμό ΜΟΝΟ όταν το απόθεμα είναι χαμηλό (δημιουργεί urgency)· σε υγιές απόθεμα δείχνουν γενικό μήνυμα χωρίς αριθμό. Παρουσιάστηκε στον χρήστη μέσω AskUserQuestion μαζί με τεχνικό περιορισμό (δεν υπάρχει στήλη max/αρχικού stock στο `products` schema, άρα τα κατώφλια είναι σε απόλυτα τεμάχια, όχι ποσοστό). **Ο χρήστης αποφάσισε:** πάντα ακριβής αριθμός, σε όλα τα tiers (ρητά διαφορετικό από το "industry standard" — συνειδητή επιλογή του, όχι λάθος μου).

**Νέο αρχείο:** `components/Merch/StockBadge.jsx` — ένα σημείο αλήθειας, δέχεται `quantity` (= `product.stock_quantity`) + προαιρετικό `className`:
- `0` → κόκκινο, "Εξαντλημένο"
- `1–2` → πορτοκαλί, "Ελάχιστα διαθέσιμα (N)"
- `3–5` → κίτρινο, "Λιγοστά διαθέσιμα (N)"
- `6+` → πράσινο, "Διαθέσιμα (N)"
- `null`/`undefined` (προϊόν χωρίς tracked stock) → δεν εμφανίζει τίποτα.

**Χρησιμοποιείται σε 2 σημεία** (ρητό αίτημα — "από τη στιγμή που πατάει ο fan στο merch store" μέχρι και το μεμονωμένο προϊόν):
- `ProductList.jsx` (κάρτα στο grid) — μόνο το badge, κάτω από τιμή/κατηγορία.
- `ProductOverviewRoute.jsx` (η νέα σελίδα προϊόντος, βλ. ενότητα παραπάνω) — αντικατέστησε το πρόχειρο "Προσωρινά εξαντλημένο" text που είχα βάλει αρχικά.

Δεν άγγιξε το `ProductQuickShop.jsx` (το "Γρήγορη αγορά" modal) — δεν ζητήθηκε, ρητός κανόνας "καμία πρωτοβουλία χωρίς ρώτημα".

**Bug fix στο ίδιο πέρασμα:** το κουμπί κοινοποίησης (`ProductOverviewRoute.jsx`, `handleShare`) έσκαγε με `TypeError: Cannot read properties of undefined (reading 'writeText')` όταν δοκιμάστηκε — root cause: το `navigator.clipboard` υπάρχει ΜΟΝΟ σε secure context (https/localhost), plain http το κάνει undefined. Fix: legacy `document.execCommand("copy")` fallback όταν λείπουν και τα δύο (`navigator.share` και `navigator.clipboard`).

**Verification:** `npx eslint` καθαρό στα αγγιγμένα αρχεία, πλήρες `npx eslint .` ίδιο baseline (19/1). **Δεν έχει δοκιμαστεί ακόμα ζωντανά.**

**Για την επόμενη φορά:**
1. Ζωντανό test: merch grid → badge σωστό ανά προϊόν, ίδιο badge στη σελίδα overview, κουμπί κοινοποίησης πλέον δεν σκάει.
2. Ακόμα εκκρεμεί: commit + push όλης της σημερινής δουλειάς (merch checkout + product overview + StockBadge) — τίποτα δεν έχει γίνει commit σήμερα.
3. Απόφαση για το αχρησιμοποίητο πλέον `ProductGallery.jsx` (βλ. προηγούμενη ενότητα).

---

## 🐞 Bug fix: κανένα όριο στην ποσότητα καλαθιού vs. πραγματικό stock (15/9)

**Εύρημα χρήστη (screenshots):** στη σελίδα product overview, έβαλε ποσότητα 20 σε προϊόν με μόνο 15 διαθέσιμα και το κουμπί "Προσθήκη στο καλάθι" το δέχτηκε κανονικά — το `+` stepper δεν είχε ΚΑΝΕΝΑ όριο.

**Διευκρίνιση προς τον χρήστη (σημαντικό, να μείνει καταγεγραμμένο):** το πραγματικό stock ΔΕΝ κινδύνεψε ποτέ — το `create_order_from_cart` RPC (βλ. ενότητα merch checkout παραπάνω) κάνει ήδη atomic έλεγχο στο checkout (`UPDATE ... WHERE stock_quantity >= qty`) και θα απέρριπτε την παραγγελία με `insufficient_stock`. Το πρόβλημα ήταν ΜΟΝΟ στο frontend UX: ο fan έβλεπε παραπλανητικό αριθμό στο καλάθι, θα ανακάλυπτε το πρόβλημα μόνο στο checkout, όχι νωρίτερα.

**Fix σε 3 σημεία** (ίδιο σημείο αλήθειας παντού — `stock_quantity` μείον ό,τι ΗΔΗ υπάρχει στο καλάθι για το ίδιο προϊόν):
- `ProductOverviewRoute.jsx` — διαβάζει τώρα το καλάθι (`useCart`), υπολογίζει `maxAddable = stock_quantity - existingCartQty`, κόβει το `+` εκεί, δείχνει μήνυμα ("X ήδη στο καλάθι σου — μέγιστο ακόμα Y" / "Έχεις ήδη όλη τη διαθέσιμη ποσότητα").
- `ProductQuickShop.jsx` — ίδια λογική· χρειάστηκε να περάσουν `fanId`/`tenantId` ως νέα props από `ProductModalRoute.jsx` (δεν τα είχε πριν, δεν χρειαζόταν το καλάθι μέχρι τώρα).
- `CartDialog.jsx` — το `+` stepper (αύξηση ήδη υπάρχουσας γραμμής) κόβεται στο `product.stock_quantity`.
- `null`/`undefined` `stock_quantity` (προϊόν χωρίς tracked stock) = χωρίς όριο, σε όλα τα σημεία — συνέπεια με το υπάρχον `isOutOfStock` pattern.

**Verification:** `npx eslint` καθαρό σε όλα τα αγγιγμένα αρχεία, πλήρες `npx eslint .` ίδιο baseline (19/1).

**Για την επόμενη φορά:** ζωντανό test — δοκίμασε να ξεπεράσεις το διαθέσιμο stock και από τα 3 σημεία (product overview, quick shop modal, cart dialog), επιβεβαίωσε ότι το + απενεργοποιείται σωστά και ότι το μήνυμα είναι κατανοητό.

---

## 👕 Stock ανά μέγεθος (product_variants) — Plan Mode (15/9)

Ρητό αίτημα χρήστη, μετά το bug fix του quantity cap παραπάνω: τα κουμπιά μεγέθους (S/M/L/XL) ήταν αμιγώς διακοσμητικά (`PLACEHOLDER_SIZES`, καμία σύνδεση με stock). Ζήτησε: κάθε κουμπί μεγέθους χρωματισμένο με την ίδια κλίμακα του `StockBadge.jsx`, disabled στο κόκκινο (0 τεμάχια), ενώ το αθροιστικό badge (κάρτα grid + πάνω στη σελίδα προϊόντος) μένει όπως είναι. Ζήτησε ρητά να σκεφτούμε "κάθε πιθανό λογικό bug" πριν χτιστεί — μπήκαμε σε Plan Mode (πλάνο: `/root/.claude/plans/fuzzy-wiggling-fog.md`), εγκρίθηκε, υλοποιήθηκε.

**Νέο migration:** `supabase/migrations/20260915120000_add_product_variants.sql` (**εκκρεμεί να το τρέξει ο χρήστης**):
- Νέος πίνακας `product_variants` (product_id, size ∈ {S,M,L,XL}, stock_quantity, unique ανά product+size), δημόσιο SELECT (`using (true)`, ίδιο μοτίβο με το catalog).
- `cart_items` + `order_items` παίρνουν νέα στήλη `variant_id` (nullable — NULL = προϊόν χωρίς μεγέθη, ΑΚΡΙΒΩΣ το σημερινό behavior, backward compatible). `order_items` παίρνει επιπλέον `size_label` (snapshot, ίδιο μοτίβο με `unit_price`).
- `create_order_from_cart`/`expire_stale_orders`: `create or replace` (ίδιο signature/όνομα — το ήδη active pg_cron job τα καλεί με όνομα, καμία επανεγγραφή cron χρειάστηκε). Το atomic "δέσμευσε αν υπάρχει απόθεμα" πάει σε `product_variants` όταν η γραμμή καλαθιού έχει `variant_id`, αλλιώς στο `products` όπως πριν.

**⚠️ Backfill, δουλειά του χρήστη, ΔΕΝ έγινε από εμένα:** τα υπάρχοντα clothing προϊόντα (π.χ. το δοκιμαστικό T-Shirt Roosters) δεν έχουν καμία γραμμή σε `product_variants` μέχρι να προστεθούν χειροκίνητα στο Supabase — δεν επινοήθηκαν αριθμοί. Μέχρι τότε το UI δείχνει ρητά "Δεν υπάρχουν ακόμα μεγέθη καταχωρημένα" αντί για ψεύτικα κουμπιά.

**Frontend:**
- `lib/stockTiers.js` (ΝΕΟ) — τα tiers/χρώματα του `StockBadge.jsx` μετακινήθηκαν εδώ (named exports `getStockTier`/`getTotalStock`) γιατί το eslint `react-refresh/only-export-components` απαγορεύει non-component exports σε αρχείο με default component export· ένα σημείο αλήθειας, χρησιμοποιείται από `StockBadge.jsx` ΚΑΙ `SizeSelector.jsx`.
- `SizeSelector.jsx` (ΝΕΟ) — αντικαθιστά τα ΔΙΠΛΑ αντιγραμμένα decorative μπλοκ (μαζί με το εντελώς ψεύτικο/ανενεργό χρωματικό swatch, αφαιρέθηκε) σε `ProductQuickShop.jsx` ΚΑΙ `ProductOverviewRoute.jsx` — ένα component, ένα σημείο αλήθειας για χρώμα/disabled ανά μέγεθος.
- `useProducts.js`: `select('*, product_variants(*)')`. `useCart.js`: query φέρνει και `variant(...)`· **bug fix**: το `addItem` matchάρει πλέον σε `(product.id, variantId)` μαζί (πριν ήταν μόνο `product.id` — δύο διαφορετικά μεγέθη του ΙΔΙΟΥ προϊόντος θα συγχωνεύονταν λάθος σε μία γραμμή)· **δεύτερο bug fix**: `updateQuantity`/`removeItem` άλλαξαν από key `productId` σε key `cart_items.id` (ένα προϊόν μπορεί τώρα να έχει πολλαπλές γραμμές, μία ανά μέγεθος — το `productId` δεν αρκούσε πια για μονοσήμαντη αναφορά).
- `ProductOverviewRoute.jsx`/`ProductQuickShop.jsx`: το quantity cap (χθεσινό bug fix) υπολογίζεται πλέον στο stock του ΕΠΙΛΕΓΜΕΝΟΥ μεγέθους, όχι στο αθροιστικό — αλλιώς θα επέτρεπε π.χ. 8 Small ενώ υπάρχουν μόνο 2. "Προσθήκη στο καλάθι" disabled μέχρι να επιλεγεί μέγεθος (clothing με πραγματικά variants).
- `CartDialog.jsx`: δείχνει το μέγεθος ανά γραμμή, το `+` κόβεται στο σωστό (ανά variant) stock.
- `OrderSummaryRoute.jsx`: δείχνει `size_label` ανά γραμμή· `handleReAddToCart` περνάει πλέον και το `variant_id`.
- `Header.jsx` (`handleAddToCart`): τρίτο, προαιρετικό όρισμα `variantId`, περνάει μέχρι το `addItem`.

**Verification:** `npx eslint` καθαρό σε όλα τα αγγιγμένα αρχεία, πλήρες `npx eslint .` ίδιο baseline (19/1). **Δεν έχει τρέξει ακόμα το migration ούτε έχει δοκιμαστεί ζωντανά.**

**Για την επόμενη φορά:**
1. Ο χρήστης τρέχει το migration `20260915120000_add_product_variants.sql`.
2. Ο χρήστης προσθέτει χειροκίνητα 2-3 `product_variants` γραμμές στο δοκιμαστικό T-Shirt (π.χ. S=10, M=5, L=2, XL=0) για πραγματικό test data.
3. Ζωντανό browser test — βλ. πλήρη λίστα ελέγχων στο πλάνο (`/root/.claude/plans/fuzzy-wiggling-fog.md`, ενότητα Verification): χρώματα/disabled ανά μέγεθος, blocked χωρίς επιλογή, δύο μεγέθη = δύο γραμμές καλαθιού, cap ανά μέγεθος όχι αθροιστικά, checkout αφαιρεί από το σωστό variant.
4. Commit + push όλης της σημερινής δουλειάς (merch checkout, product overview, StockBadge, bug fixes, product variants) — τίποτα δεν έχει γίνει commit ακόμα.

---

## 🔒 RLS security audit (14-15/9, ρητό αίτημα χρήστη: "δεν θέλω να είναι τρύπιο το σύστημα")

Ο χρήστης ζήτησε πλήρη έλεγχο RLS σε όλους τους πίνακες/συναρτήσεις αυτής της
συνεδρίας (orders, order_items, product_variants, cart_items, favorites,
products, adjust_cart_quantity, create_order_from_cart, expire_stale_orders).
Δεν μπόρεσα να τεστάρω live μέσω API (το δίκτυο του device_bash μπλοκάρει το
domain του Supabase — `blocked-by-allowlist`), οπότε ο χρήστης έτρεξε ο ίδιος
read-only SQL queries στο Supabase SQL editor και έστειλε screenshots/αποτελέσματα.

**Επιβεβαιωμένο ΟΚ:**
- `orders`/`order_items`/`product_variants`: RLS σωστό (verified από τα δικά μου migrations).
- `cart_items`, `favorites`, `event_favorites`: RLS ενεργό, policies σωστά scoped σε `fan_id = auth.uid()` (verified από screenshots του χρήστη).
- `products`: RLS ενεργό, δημόσιο SELECT-only (`using (true)`), καμία write policy για απλό χρήστη.
- `adjust_cart_quantity` (undocumented RPC, χωρίς migration — ο χρήστης έφερε το σώμα της): έχει `and fan_id = auth.uid()` στο WHERE — ασφαλές, κάποιος άλλος δεν μπορεί να πειράξει ξένο καλάθι.
- `create_order_from_cart`: έχει `auth.uid() = p_fan_id` εσωτερικό έλεγχο (verified από migration).

**Βρέθηκε και διορθώθηκε (όχι ενεργό ρίσκο, αλλά grants δεν ταίριαζαν με την πρόθεση):**
οι 3 RPC συναρτήσεις (`create_order_from_cart`, `expire_stale_orders`,
`adjust_cart_quantity`) είχαν EXECUTE grant στο `PUBLIC` (default συμπεριφορά
Postgres στο CREATE FUNCTION) — δηλαδή τεχνικά και ο `anon` μπορούσε να τις
καλέσει, παρόλο που οι εσωτερικοί έλεγχοι τον μπλόκαραν στην πράξη. Νέο
migration `20260915130000_tighten_function_execute_grants.sql`: αφαιρεί
EXECUTE από `public`/`anon` και στις 3, ξαναδίνει σε `authenticated` μόνο
στις 2 που πραγματικά το χρειάζονται (`create_order_from_cart`,
`adjust_cart_quantity`) — το `expire_stale_orders` μένει χωρίς κανένα grant
(τρέχει μόνο μέσω pg_cron ως owner). Καμία αλλαγή σε δεδομένα/tables/RLS
policies, καμία αλλαγή συμπεριφοράς για συνδεδεμένους fans. **Ο χρήστης
ενέκρινε ρητά** ("nai graptso gia na to kleinoume"). Ο χρήστης το έτρεξε και
επιβεβαίωσε με νέο query 3: `create_order_from_cart`/`adjust_cart_quantity`
σωστά (μόνο authenticated/postgres/service_role), αλλά το
`expire_stale_orders` είχε ακόμα `authenticated` (default privilege του
Supabase, το πρώτο migration αφαίρεσε μόνο public/anon — δικό μου παράλειψη).
Follow-up migration `20260915140000_revoke_expire_stale_orders_authenticated.sql`
(`revoke execute on function expire_stale_orders() from authenticated;`),
εγκρίθηκε ρητά ("nai thelw na to kleinoume"). **Εκκρεμότητα:** να τρέξει κι
αυτό ο χρήστης στο Supabase SQL editor.

## 🧹 Καθαρισμός test δεδομένων tenant "Villagers" από το merch (15/9)

Κατά το ζωντανό τεστ του stock-ανά-μέγεθος (product_variants), το backfill
script (βλ. ενότητα RLS audit παραπάνω) μπήκε κατά λάθος στο πρώτο
clothing-προϊόν που βρήκε (`order by created_at limit 1`) -- το οποίο
ανήκε σε άλλον tenant ("Villagers"), όχι στον tenant ΣΤΡΑΦΙ που δοκιμάζει
ο χρήστης. Αυτό αποκάλυψε ότι υπήρχαν ήδη test/demo merch δεδομένα για τον
tenant Villagers (2 προϊόντα: "Villagers Hoodie", "Villagers T-Shirt
Black") που ο χρήστης δεν ήθελε να κρατήσει.

**Ρητό αίτημα χρήστη:** διαγραφή όλων των merch δεδομένων του tenant
Villagers (προϊόντα + ό,τι τα αναφέρει), ρητά scoped στο merch, όχι
ολόκληρος ο tenant. Πριν τη διαγραφή δόθηκε στον χρήστη read-only
diagnostic query που έδειξε το ακριβές scope (2 products, 4
product_variants, 2 cart_items, 0 order_items, 2 favorites), και μετά το
ακριβές DELETE script (σωστή σειρά -- πρώτα cart_items/favorites/
order_items/product_variants, μετά products). Ο χρήστης το έτρεξε και
επιβεβαίωσε: 0 products, 0 product_variants για τον tenant Villagers.
**Ολοκληρώθηκε.**

Ο tenant ΣΤΡΑΦΙ (5 clothing προϊόντα: T-Shirt Roosters, T-Shirt ΣΤΡΑΦΙ
Daisy, T-Shirt ΣΤΡΑΦΙ Μαύρο, κ.λπ.) ΔΕΝ αγγίχθηκε -- είναι ο tenant πάνω
στον οποίο συνεχίζεται το testing. Κανένα από αυτά δεν έχει ακόμα
`product_variants` backfilled -- παραμένει εκκρεμότητα, με πραγματικά
νούμερα από τον χρήστη (όχι επινοημένα).

## ✅ Backfill product_variants για tenant ΣΤΡΑΦΙ (15/9)

Μετά τον καθαρισμό του tenant Villagers (βλ. ενότητα παραπάνω), backfill
σωστά στοχευμένο με `tenant_id` (όχι "πρώτο που βρω" όπως την πρώτη φορά)
σε ΟΛΑ τα clothing προϊόντα του tenant ΣΤΡΑΦΙ: T-Shirt Roosters, T-Shirt
ΣΤΡΑΦΙ Daisy, T-Shirt ΣΤΡΑΦΙ Μαύρο. Δοκιμαστικά νούμερα σε όλα (S=10, M=5,
L=2, XL=0 -- καλύπτει και τα 4 tiers χρώματος: πράσινο/κίτρινο/πορτοκαλί/
κόκκινο-disabled ανά προϊόν). Ο χρήστης επιβεβαίωσε το αποτέλεσμα, 12
γραμμές σύνολο (3 προϊόντα × 4 μεγέθη). **Έτοιμο για ζωντανό browser test.**

## 🐞 Bug fix: το "Ακολούθησε/Ακολουθείς" κρυβόταν πίσω από το cover image (15/9)

Ρητή αναφορά χρήστη: το follow button (+ τα search/αγαπημένα/καλάθι
εικονίδια δίπλα του, όταν συνδεδεμένος) κάποιες φορές δεν φαινόταν καθόλου
-- "μπαίνει πιο πάνω, κάτω από το cover image".

**Διάγνωση, ζωντανά επιβεβαιωμένη** (Claude in Chrome πάνω στο ήδη
συνδεδεμένο tab του χρήστη, σε 375px πλάτος -- ο χρήστης έκανε το login ο
ίδιος, καμία επαφή με credentials): `document.elementFromPoint()` πάνω στις
ακριβείς συντεταγμένες του κουμπιού γύρναγε το `<img>` του cover, όχι το
κουμπί -- πραγματικό CSS stacking bug, όχι conditional-render bug. Αιτία:
το cover-image wrapper div είναι `position: relative` (για να κουμπώσει
πάνω του το pencil-icon overlay του `EditCoverImageDialog`). Σε CSS, ένα
`position: relative` στοιχείο (ΑΚΟΜΑ και χωρίς z-index) ζωγραφίζεται σε
ανώτερο layer από static/non-positioned αδέρφια, ΑΝΕΞΑΡΤΗΤΑ από τη σειρά
στο DOM. Το avatar γλίτωνε γιατί το δικό του wrapper είναι ΕΠΙΣΗΣ
`relative` (ίδιος λόγος: `EditLogoImageDialog` overlay) -- το follow-button
row όμως ήταν static, άρα έμενε ΠΑΝΤΑ από κάτω από το cover image όποτε το
αρνητικό margin (`-mt-12`/`sm:-mt-14`) τα έκανε να επικαλύπτονται.

**Fix, ζωντανά τεστ πριν εφαρμοστεί** (πρόσθεσα `position: relative` στο
row μέσω browser console, επιβεβαίωσα με `elementFromPoint` ότι το κουμπί
βγαίνει πλέον από πάνω, ΜΕΤΑ έγραψα τον πραγματικό κώδικα):
`Header.jsx` -- η γραμμή `<div className="-mt-12 flex items-end gap-4
sm:-mt-14">` έγινε `<div className="relative -mt-12 flex items-end gap-4
sm:-mt-14">`. Μονή αλλαγή, καμία άλλη επίπτωση. `npx eslint .`
επιβεβαιώθηκε αμετάβλητο baseline (19/1).

## 🛍️ Merch UX: κάρτα-clickable, badge χωρίς αριθμό, multi-size cart, "Ολοκλήρωση παραγγελίας" από τη σελίδα προϊόντος (15/9)

Ρητό, πολυμερές αίτημα χρήστη (6 screenshots) μετά το stock-ανά-μέγεθος
του προηγούμενου batch:

1. **Ολόκληρη η κάρτα προϊόντος στο grid είναι πλέον clickable**, όχι μόνο
   η φωτογραφία (`ProductList.jsx`) — `<Card>` πήρε `role="button"`,
   `tabIndex`, `onClick`/`onKeyDown` → `/merch/overview/:slug`. Η καρδιά
   (αγαπημένα) και το "Γρήγορη αγορά" κουμπί μέσα στην κάρτα κάνουν
   `stopPropagation` ώστε να μη διπλο-navigate-άρουν.
2. **Η κάρτα του grid δεν δείχνει πια τον ακριβή αριθμό διαθεσιμότητας** —
   μόνο το tier text (π.χ. "Διαθέσιμα"), χωρίς το "(N)". Ο ακριβής αριθμός
   παραμένει ΜΟΝΟ μέσα στη σελίδα προϊόντος (και ανά μέγεθος στο
   SizeSelector). Υλοποιήθηκε με νέο `showCount` prop στο `StockBadge.jsx`
   (default `true`, `ProductList.jsx` περνάει ρητά `false`) + νέο
   `shortLabel` πεδίο ανά tier στο `stockTiers.js`.
3. **`SizeSelector.jsx` ξανασχεδιασμένο από "διάλεξε ΕΝΑ μέγεθος" σε
   "ποσότητα ανά μέγεθος, πολλά μαζί"** — κάθε πραγματικό
   `product_variants` row είναι πλέον η δική του γραμμή: [χρωματισμένο pill
   μεγέθους] (διαθέσιμος αριθμός σε παρένθεση) [δικός του − ποσότητα +
   stepper]. Ο fan μπορεί να βάλει π.χ. 2 Small ΚΑΙ 1 Medium στο ίδιο
   visit, το ένα "Προσθήκη στο καλάθι" προσθέτει ΟΛΑ τα επιλεγμένα μαζί
   (σειριακά awaited, βλ. παρακάτω). Νέο API:
   `{ variants, quantities, maxByVariant, onChangeQuantity }` — αντικατέστησε
   πλήρως το παλιό `{ variants, selectedVariantId, onSelect }`, ενημερώθηκαν
   και τα δύο consumers (`ProductOverviewRoute.jsx`, `ProductQuickShop.jsx`).
4. **`useCart.js`: το `addItem` έγινε awaitable** (`mutateAsync` αντί για
   `mutate`) — αναγκαίο ώστε πολλαπλές προσθήκες μεγεθών να γίνονται
   ΣΕΙΡΙΑΚΑ (await μία-μία), όχι παράλληλα· αλλιώς δύο ταυτόχρονες κλήσεις
   θα μπορούσαν να χάσουν η μία το "existing row" matching της άλλης.
   `Header.jsx`'s `handleAddToCart` έγινε `async`/`await` για τον ίδιο λόγο.
   Callers που δεν κάνουν await (fire-and-forget) συνεχίζουν να δουλεύουν
   κανονικά.
5. **Νέο κουμπί "Ολοκλήρωση παραγγελίας" στη σελίδα προϊόντος**
   (`ProductOverviewRoute.jsx`, κάτω από τη σειρά
   Προσθήκη/αγαπημένα/κοινοποίηση) — προσθέτει την τρέχουσα επιλογή στο
   καλάθι ΚΑΙ πάει κατευθείαν στη συνολική παραγγελία.
   **⚠️ Σημαντική παραδοχή, να επιβεβαιωθεί με τον χρήστη:** αυτό
   ΕΠΑΝΑΧΡΗΣΙΜΟΠΟΙΕΙ το ήδη υπάρχον `useCreateOrder` → `/merch/order/:orderId`
   (`OrderSummaryRoute.jsx`) flow — το ΙΔΙΟ που ήδη κάνει το "Ολοκλήρωση
   παραγγελίας" του `CartDialog.jsx`. Ο χρήστης είχε πει "θα σου δώσω τον
   κώδικα όταν τον φτιάξω" για το component προορισμού· μέχρι να δοθεί
   διαφορετικός κώδικας, χρησιμοποιείται το υπάρχον, λειτουργικό flow. Το
   μήνυμα σφάλματος checkout (`insufficient_stock`/`empty_cart`) εξήχθη σε
   κοινό `lib/checkoutErrors.js` (χρησιμοποιείται από `CartDialog.jsx` ΚΑΙ
   το νέο κουμπί εδώ, ένα σημείο αλήθειας).
6. **`CartDialog.jsx`**: επιβεβαιώθηκε ότι ήδη έδειχνε κάθε επιλογή
   ξεχωριστά (μία γραμμή ανά `cart_items` row, δικό της +/−/κάδος) — καμία
   αλλαγή χρειάστηκε εκεί. Προστέθηκε ΝΕΟ "Άδειασμα καλαθιού" (πάνω δεξιά
   στο dialog header, με `window.confirm`) για bulk-clear ολόκληρου του
   καλαθιού μονομιάς — νέο `clearCart` mutation στο `useCart.js`
   (bulk `delete` στα `cart_items` του fan+tenant).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο baseline (19 errors/1 warning, όλα
σε shadcn-generated `ui/` αρχεία, εκτός scope).

## 🐞 Bug fix: 409 Conflict στο καλάθι όταν προστίθεται 2ο μέγεθος του ίδιου προϊόντος (15/9)

Ρητή αναφορά χρήστη, live στο `http://strafi.concerto.gr:5173/merch/overview/t-shirt-roosters`:
`POST .../rest/v1/cart_items 409 (Conflict)`.

**Διάγνωση, ζωντανά αναπαραγμένη** (Claude in Chrome, στο ήδη συνδεδεμένο
tab του χρήστη): το καλάθι είχε ήδη 1 γραμμή (T-Shirt Roosters, Small,
qty 10/10 — γεμάτο). Δοκίμασα να προσθέσω 1 τεμάχιο Medium (ΔΙΑΦΟΡΕΤΙΚΟ
μέγεθος, καθόλου σχετικό με το ήδη γεμάτο Small) — ίδιο 409, αναπαράχθηκε
αμέσως. `response.clone().text()` μέσω injected `fetch` patch επιβεβαίωσε
unique-constraint violation στο insert.

**Ρίζα**: το `cart_items` δημιουργήθηκε στο Supabase dashboard ΠΡΙΝ
υπάρξει το `variant_id` (βλ. σχόλιο στο
`20260908130000_add_tenant_scoping_favorites_cart.sql`) — είχε από τότε
ένα UNIQUE constraint σε κάτι σαν `(fan_id, product_id[, tenant_id])`,
λογικό τότε (μία γραμμή ανά προϊόν). Το migration
`20260915120000_add_product_variants.sql` πρόσθεσε τη ΣΤΗΛΗ `variant_id`
αλλά δεν άγγιξε το παλιό constraint — άρα ΔΕΥΤΕΡΗ γραμμή για το ΙΔΙΟ
προϊόν (ακόμα και με διαφορετικό μέγεθος) συνέχιζε να μπλοκάρεται σε
επίπεδο βάσης, ΑΝΕΞΑΡΤΗΤΑ από το ότι το app-level "existing" matching
στο `useCart.js` σωστά δεν έβρισκε ήδη υπάρχουσα γραμμή για το Medium.

**Fix**: νέο migration
`supabase/migrations/20260915160000_fix_cart_items_unique_per_variant.sql`
— αφαιρεί ΔΥΝΑΜΙΚΑ (δεν ήταν γνωστό το ακριβές όνομα, δημιουργήθηκε εκτός
migrations) οποιοδήποτε unique constraint/index στο `cart_items` με
`product_id` αλλά ΧΩΡΙΣ `variant_id`, και το αντικαθιστά με
`unique (fan_id, tenant_id, product_id, variant_id)` — επιτρέπει πλέον
πολλαπλές γραμμές του ίδιου προϊόντος (μία ανά μέγεθος), διατηρώντας την
προστασία από ΔΙΠΛΕΣ γραμμές του ΙΔΙΟΥ ακριβώς συνδυασμού.

**⚠️ Χρειάζεται να τρέξει ο χρήστης το migration στο Supabase SQL editor**
(ίδιο workflow με πάντα) — μέχρι τότε, η προσθήκη 2ου μεγέθους του ίδιου
προϊόντος στο καλάθι θα συνεχίσει να σκάει με 409.

## 🛒 CartRoute.jsx: πλήρης σελίδα καλαθιού + checkout (15/9)

Ο χρήστης έδωσε δικό του reference component (Tailwind UI "Shopping Cart"
page, fake δεδομένα) ζητώντας να χτιστεί με βάση αυτό το "άλλο component
που θα έχει τη συνολική παραγγελία" που ανέφερε νωρίτερα το ίδιο βράδυ.

**Όνομα:** πρότεινα `CartRoute.jsx` (αντί για το αρχικό
`productshoppingcartordersummary` που πρότεινε ο χρήστης) — ταιριάζει με
τη σύμβαση ονομασίας του project για πραγματικές σελίδες
(`OrderSummaryRoute.jsx`, `ProductOverviewRoute.jsx`), σύντομο, ένα
πράγμα δηλώνει (η σελίδα ΚΑΛΑΘΙΟΥ).

**Route**: `merch/cart` — flat sibling, ίδιο μοτίβο με `merch/order/:orderId`
(`main.jsx`).

**Προσαρμογές πάνω στο reference του χρήστη** (βάσει της ήδη υπάρχουσας
λογικής του project — ρητά ζητήθηκε "αφαίρεσε με βάση τη λογική που σου
έχω δώσει"):
- Fake `products` array → πραγματικά δεδομένα μέσω `useCart(fanId, tenantId)`
  (ίδιο hook με το `CartDialog.jsx`). Προστέθηκε `isLoading` στο
  `useCart.js` return (νέο, μικρό) για skeleton state σε αυτή τη
  full-page έκδοση.
- `<select>` dropdown ποσότητας (1-8, χωρίς όριο) → το ήδη υπάρχον
  −/ποσότητα/+ stepper, κομμένο στο πραγματικό stock ανά variant/προϊόν
  (`updateQuantity`, ίδιο με `CartDialog.jsx`).
- "Shipping estimate" / "Tax estimate" **αφαιρέθηκαν εντελώς** — δεν
  υπάρχει shipping ή φόρος μοντελοποιημένος πουθενά στο project, θα ήταν
  fake νούμερα χωρίς αντίκρισμα. Έμεινε μόνο "Σύνολο" = subtotal.
- "In stock / Ships in X weeks" → το ήδη υπάρχον μήνυμα ορίου ("Έχεις ήδη
  όλη τη διαθέσιμη ποσότητα (Ν)"), ίδιο με `CartDialog.jsx`.
- Πρόσθεσα states που δεν υπήρχαν στο reference: άδειο καλάθι (με link
  "Συνέχεια αγορών"), μη συνδεδεμένος επισκέπτης (prompt σύνδεσης), και
  "Άδειασμα καλαθιού" (ίδιο bulk-clear που προστέθηκε νωρίτερα σήμερα στο
  `CartDialog.jsx`).
- Το "Checkout" submit καλεί το ΗΔΗ υπάρχον `useCreateOrder` RPC και πάει
  σε `/merch/order/:orderId` (10λεπτο hold + countdown, `OrderSummaryRoute.jsx`)
  — καμία επανάληψη της λογικής δέσμευσης stock, μόνο νέο UI γύρω της.

**Άλλαξε και το `ProductOverviewRoute.jsx`**: το "Ολοκλήρωση παραγγελίας"
πλέον προσθέτει την επιλογή στο καλάθι και πάει σε `/merch/cart` (δείχνει
ΟΛΟΚΛΗΡΟ το καλάθι, όχι μόνο το τρέχον προϊόν) αντί να δημιουργεί
κατευθείαν order — ήταν η αρχική, προσωρινή παραδοχή μου (flagαρίστηκε
ρητά στον χρήστη τότε), τώρα διορθώθηκε με το πραγματικό flow που ήθελε.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/merch/cart`): πραγματικό
item από το καλάθι (T-Shirt Roosters, Small), stepper σωστά κλειδωμένο
στο 10/10, σωστό σύνολο (200.00€). ΔΕΝ πατήθηκε "Ολοκλήρωση παραγγελίας"
στο live test (θα δέσμευε πραγματικό stock/δημιουργούσε πραγματική
παραγγελία).

**⚠️ Σημείωση προς τον χρήστη, εκκρεμεί απόφαση:** το εικονίδιο καλαθιού
στο header (`TenantTopBar.jsx`) συνεχίζει να ανοίγει το μικρό
`CartDialog.jsx` — δεν το άγγιξα, δεν ζητήθηκε. Τώρα υπάρχουν δύο τρόποι
να δει/επεξεργαστεί κανείς το καλάθι (dialog + `/merch/cart`). Αν ο
χρήστης θέλει το εικονίδιο να στέλνει στο `/merch/cart` αντί να ανοίγει
το dialog, είναι μικρή αλλαγή.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο baseline (19/1).

## 🔀 Το εικονίδιο καλαθιού πηγαίνει πλέον στο /merch/cart, όχι στο CartDialog popup (15/9)

Ρητή απόφαση αφημένη σε μένα από τον χρήστη ("κάνε αυτό που πιστεύεις
εσύ ότι είναι καλύτερο"). Απόφαση: `TenantTopBar.jsx` — το κουμπί
καλαθιού πλέον κάνει `navigate("/merch/cart")` αντί για
`setCartOpen(true)`. Λόγοι: (α) το `CartRoute.jsx` (φτιάχτηκε νωρίτερα
σήμερα) είναι ήδη ένα strict superset του `CartDialog.jsx` — ίδιο
edit/remove/clear, ΣΥΝ loading skeleton, unauthenticated state, breadcrumb
— διπλή συντήρηση της ίδιας λογικής σε δύο σημεία δεν έχει νόημα· (β) το
checkout ήδη μεταφέρει σε πλήρη σελίδα (`OrderSummaryRoute`), άρα το
"προϊόν → καλάθι → παραγγελία" μένει συνεπές ως αλυσίδα πλήρων σελίδων,
όχι popup→σελίδα στη μέση.

**Το `CartDialog.jsx` ΔΕΝ διαγράφηκε** — έμεινε στον φάκελο, απλά δεν
εισάγεται/χρησιμοποιείται πια πουθενά (αφαιρέθηκε το import + το
`cartOpen` state + το render από το `TenantTopBar.jsx`). Αν ο χρήστης
προτιμήσει τελικά το popup, είναι μονόλεπτη επαναφορά.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1) — κανένα unused-import
σφάλμα από την αφαίρεση.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome): κλικ στο εικονίδιο →
`/merch/cart`. Bonus επιβεβαίωση στο ίδιο live test: το προηγούμενο
pending order (10× Small, από νωρίτερα σήμερα) είχε λήξει το 10λεπτο
κράτημά του και το `expire_stale_orders` cron το είχε ήδη επαναφέρει
σωστά — Small ξαναδείχνει 10/10, "Διαθέσιμα (17)" σωστό συνολικά. Άρα η
απάντηση στην ερώτηση του χρήστη "θα κολλήσει το stock;" είναι όχι, το
αυτόματο restore δουλεύει σωστά.

## 🐞 Bug fix: breadcrumb κατηγορίας μη-clickable + ασύμφωνα ονόματα κατηγορίας σε 3 σημεία (15/9)

Ρητή αναφορά χρήστη: στη σελίδα προϊόντος (`ProductOverviewRoute.jsx`),
το breadcrumb "Merch Store / Ρουχισμός" — το "Merch Store" ήταν
πραγματικό link, αλλά το "Ρουχισμός" ήταν απλό κείμενο, χωρίς σύντομο
δρόμο πίσω στη λίστα της κατηγορίας (`/merch/category/clothing`).

Στο ψάξιμο βρέθηκε και δεύτερο, σχετικό πρόβλημα: το "όνομα κατηγορίας"
υπήρχε ξεχωριστά, ελαφρώς ασύμφωνα, σε **3 σημεία** — `useMerchCategories.js`
έλεγε "CD & Βινύλια" για τη μουσική, ενώ `ProductList.jsx` και
`ProductOverviewRoute.jsx` έλεγαν "Μουσική" για το ΙΔΙΟ category.

**Fix:** νέο `lib/merchCategories.js` — ένα σημείο αλήθειας
(`CATEGORY_LABELS` + `getCategoryLabel()`), ίδιο μοτίβο με
`stockTiers.js`/`checkoutErrors.js`. Και τα 3 σημεία εισάγουν πλέον από
εκεί. Το breadcrumb στο `ProductOverviewRoute.jsx` έγινε πραγματικό
`<Link to={\`/merch/category/${'{'}product.category{'}'}\`}>`.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome): κλικ στο "Ρουχισμός" στο
breadcrumb → πάει σωστά στο `/merch/category/clothing`, δείχνει τη
σωστή λίστα.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 🍞 Ενιαίο breadcrumb σε ΟΛΟ το merch flow — νέο MerchBreadcrumb.jsx (15/9)

Ρητή αναφορά χρήστη, με screenshots: το `/merch` (λίστα κατηγοριών) και
το `/merch/category/:key` δεν είχαν ΚΑΘΟΛΟΥ breadcrumb ("Merch Store /"),
ενώ το `ProductOverviewRoute.jsx`/`CartRoute.jsx` (φτιάχτηκαν νωρίτερα
σήμερα) είχαν το δικό τους, ξεχωριστό αντίγραφο.

**Νέο `components/Merch/MerchBreadcrumb.jsx`** — κοινό component,
δέχεται `crumbs=[{label, to}, ...]`. **Κάθε crumb είναι πραγματικό
`<Link>`, ΑΚΟΜΑ και το τελευταίο/τρέχον** — ρητό αίτημα χρήστη: στο ίδιο
το `/merch`, το "Merch Store" πρέπει να δείχνει "είσαι εδώ" ΚΑΙ να είναι
clickable (σαν refresh), όχι plain text όπως θα έκανε ένα πιο τυπικό
breadcrumb. Το ίδιο μοτίβο κρατήθηκε παντού, για συνέπεια.

Ενσωματώθηκε σε **5 σελίδες**:
- `CategoryGrid.jsx` (`/merch`) — ΝΕΟ, δεν υπήρχε καθόλου: `["Merch Store"]`.
- `MerchCategoryRoute.jsx` (`/merch/category/:key`) — ΝΕΟ, αντικατέστησε
  το παλιό "← Πίσω στις κατηγορίες" link (η ίδια δουλειά γίνεται ήδη από
  την πρώτη γραμμή του breadcrumb): `["Merch Store", category.title]`.
- `ProductOverviewRoute.jsx` — refactor στο κοινό component (ίδιο
  αποτέλεσμα με πριν, απλά ΧΩΡΙΣ διπλό κώδικα).
- `CartRoute.jsx` — refactor· το "Καλάθι" έγινε κι αυτό clickable
  (self-link), πριν ήταν plain text.
- `OrderSummaryRoute.jsx` — ΝΕΟ, δεν υπήρχε καθόλου: `["Merch Store", "Παραγγελία"]`.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome), ολόκληρη η αλυσίδα:
`/merch` ("Merch Store") → New Arrivals ("Merch Store / New Arrivals") →
προϊόν ("Merch Store / Ρουχισμός" — η ΠΡΑΓΜΑΤΙΚΗ κατηγορία του προϊόντος,
όχι "New Arrivals", σωστό) → καλάθι ("Merch Store / Καλάθι").

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 🍞 Breadcrumb: διατήρηση της "διαδρομής" πλοήγησης (15/9)

Ρητή διόρθωση χρήστη πάνω στο προηγούμενο: "Ρουχισμός, σωστό" ΔΕΝ ήταν
σωστό από τη σκοπιά του χρήστη — αν κάποιος μπει από "New Arrivals" και
πατήσει πάνω σε ένα προϊόν, το breadcrumb της σελίδας προϊόντος έπρεπε να
συνεχίσει να δείχνει "Merch Store / New Arrivals" (τη διαδρομή που
ΠΡΑΓΜΑΤΙΚΑ ακολούθησε ο χρήστης), όχι να ξαναϋπολογίζει σιωπηλά την
πραγματική/στατική κατηγορία του προϊόντος ("Ρουχισμός").

**Λύση**: React Router `navigate(path, {state})`.
- `ProductList.jsx` δέχεται νέα προαιρετικά props `categoryKey`/
  `categoryLabel`· το `handleCardClick` περνάει
  `state: { fromCategoryKey, fromCategoryLabel }` όταν υπάρχουν.
- `MerchCategoryRoute.jsx` (μοναδικός caller σήμερα) περνάει
  `categoryKey={category.key}` / `categoryLabel={category.title}`.
- `ProductOverviewRoute.jsx` διαβάζει `useLocation().state` και το
  breadcrumb crumb γίνεται:
  `location.state?.fromCategoryLabel ?? getCategoryLabel(product.category)`
  (αντίστοιχα για το link). **Fallback στην πραγματική κατηγορία** όταν
  δεν υπάρχει `state` — δηλαδή σε direct/shared link (χωρίς προηγούμενη
  πλοήγηση μέσα στην εφαρμογή) εξακολουθεί να δείχνει σωστά την
  πραγματική κατηγορία, όπως πρέπει.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome), δύο σενάρια:
1. `/merch` → New Arrivals → κλικ στο T-Shirt Roosters → breadcrumb
   "Merch Store / New Arrivals" (διατηρήθηκε η διαδρομή).
2. Direct navigation στο `/merch/overview/t-shirt-roosters` (χωρίς
   προηγούμενο κλικ) → breadcrumb "Merch Store / Ρουχισμός" (σωστό
   fallback στην πραγματική κατηγορία).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Άμεση συνέχεια, ίδια μέρα**: ο χρήστης παρατήρησε ότι έλειπε το ΤΡΙΤΟ
crumb (το ίδιο το προϊόν) — το breadcrumb σταματούσε στην κατηγορία.
Προστέθηκε τρίτο crumb στο `ProductOverviewRoute.jsx`:
`{ label: product.name, to: `/merch/overview/${product.slug}` }`
(self-link, ίδιο μοτίβο "είσαι εδώ" με τα υπόλοιπα crumbs). Τελικό
αποτέλεσμα: "Merch Store / New Arrivals / T-Shirt Roosters". Επίσης
επιβεβαιώθηκε (ήδη δούλευε σωστά, ο χρήστης ρώτησε για σιγουριά) ότι το
κλικ πάνω στο "New Arrivals" crumb οδηγεί σωστά σε `/merch/category/new`
— όλα τα προϊόντα της κατηγορίας, όχι κάπου αλλού.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 🍞 Breadcrumb → sticky "pill" με backdrop-blur (15/9)

Ρητό αίτημα χρήστη (screenshot ενός στρογγυλού "board" από icons ως οπτικό
παράδειγμα σχήματος): το breadcrumb να γίνει ένα στρογγυλό "board" που:
1. **Μεγαλώνει** σε πλάτος καθώς αυξάνεται η διαδρομή (περισσότερα crumbs).
2. Μπαίνει **κάτω από τη γραμμή** των tabs (Πληροφορίες/Εκδηλώσεις/Merch
   Store, βλ. `border-b` στο `Header.jsx`) — η φυσική του θέση, μιας και
   είναι το πρώτο πράγμα σε κάθε merch-σελίδα.
3. Είναι **sticky**: μένει στο ίδιο ύψος καθώς ο χρήστης σκρολάρει
   ψάχνοντας προϊόντα, αντί να φεύγει μαζί με το περιεχόμενο.
4. Έχει **backdrop-blur**: ό,τι περνάει από πίσω του (κάρτες/φωτογραφίες
   προϊόντων) φαίνεται θολό, όχι κρυμμένο.

Όλη η λογική μπήκε **μέσα στο ίδιο το `MerchBreadcrumb.jsx`**
(`sticky top-0 z-20 w-fit py-3` στο `<nav>`, `rounded-full bg-white/80
backdrop-blur-md ring-1 ring-gray-900/5 shadow-sm` στο `<ol>` μέσα) — ένα
σημείο αλήθειας, όχι bespoke styling σε κάθε σελίδα. Το "μεγαλώνει καθώς
αυξάνεται η διαδρομή" είναι ΔΩΡΕΑΝ (`w-fit`, όχι σταθερό πλάτος) — όσο πιο
πολλά crumbs, τόσο πλατύτερο το pill, καμία ειδική λογική.

Οι 5 σελίδες που το χρησιμοποιούν αφαίρεσαν το δικό τους `<nav
className="mb-4/mb-6">` wrapper γύρω από το `<MerchBreadcrumb>` (το
component φέρνει πλέον το δικό του `<nav>`/spacing).

**🐞 Bug βρέθηκε & διορθώθηκε ζωντανά, ίδια δουλειά**: στο
`ProductOverviewRoute.jsx` το sticky ΔΕΝ δούλευε καθόλου — το breadcrumb
έφευγε κανονικά μαζί με το scroll αντί να κολλάει. Αιτία: το είχα βάλει
σε ΔΙΚΟ ΤΟΥ, ξεχωριστό `<div>` (μόνο για οριζόντια ευθυγράμμιση), που
περιείχε ΜΟΝΟ το breadcrumb — άρα το div αυτό ήταν τόσο ψηλό όσο το ίδιο
το breadcrumb. Ένα sticky στοιχείο δεν μπορεί να μείνει κολλημένο πέρα
από τα όρια του ΔΙΚΟΥ ΤΟΥ γονικού container — μόλις σκρόλαρες λίγο, το
div "τελείωνε" και το breadcrumb ξεκολλούσε μαζί του. Οι άλλες 4 σελίδες
δεν είχαν αυτό το πρόβλημα επειδή το breadcrumb ήταν ήδη μέσα στο ΙΔΙΟ,
ψηλό container με το υπόλοιπο περιεχόμενο (λίστα προϊόντων/καλάθι/κλπ).
**Fix**: ενοποιήθηκαν τα δύο `<div>` σε ένα — το breadcrumb είναι πλέον
πρώτο παιδί μέσα στο ΙΔΙΟ container με το gallery/λεπτομέρειες προϊόντος.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome), scroll test σε 3 σελίδες
(`/merch/category/new`, `/merch/overview/t-shirt-roosters`,
`/merch/cart`): το pill μένει κολλημένο στην κορυφή, με το περιεχόμενο
(φωτογραφίες/κάρτες) να περνάει θολό από πίσω του.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Άμεση συνέχεια, ίδια μέρα — κεντράρισμα + θέση**: δύο ρητά αιτήματα
χρήστη πάνω στο pill:
1. Να είναι **κεντραρισμένο** οριζόντια, και καθώς μεγαλώνει η διαδρομή
   (περισσότερα crumbs) να μεγαλώνει **συμμετρικά γύρω από το κέντρο**
   (όχι μόνο προς τα δεξιά).
2. Να αλλάξει **θέση**: να μπει στον λευκό χώρο ΠΑΝΩ από το γκρι φόντο
   (`bg-gray-50`) των κατηγοριών/λίστας προϊόντων, ΚΑΤΩ από τη γραμμή των
   tabs — όχι μέσα στο ίδιο το γκρι, όπως ήταν πριν.

**Κεντράρισμα** (`MerchBreadcrumb.jsx`): το `<nav>` έγινε
`flex justify-center` (πλήρες πλάτος) αντί για `w-fit` (block, αριστερά
στοιχισμένο) — το ίδιο το pill (`<ol>`) μένει `w-fit` μέσα του, οπότε το
`justify-center` το κεντράρει αυτόματα σε κάθε αλλαγή πλάτους, καμία άλλη
λογική.

**Θέση**: σε ΟΛΕΣ τις 5 σελίδες merch, το `<MerchBreadcrumb>` μετακόμισε
από "πρώτο παιδί μέσα στο χρωματιστό root div της σελίδας" σε "sibling
ΠΡΙΝ από το root div" (React Fragment `<>...</>`) — ίδιο μοτίβο παντού,
ένα σημείο αλήθειας:
- `MerchCategoriesRoute.jsx` (`/merch`): breadcrumb πριν από το
  `bg-gray-50` div (αφαιρέθηκε από το `CategoryGrid.jsx` — μετακόμισε ένα
  επίπεδο πιο πάνω).
- `MerchCategoryRoute.jsx` (`/merch/category/:key`): ίδιο, πριν από το
  `bg-gray-50`.
- `ProductOverviewRoute.jsx`, `CartRoute.jsx`, `OrderSummaryRoute.jsx`:
  ίδιο μοτίβο (sibling πριν από το root `bg-white`/plain div) για
  συνέπεια, παρόλο που εκεί δεν υπήρχε ορατό γκρι/λευκό διαχωριστικό —
  μπόνους: ο sticky "containing block" είναι πλέον ο κοινός `mt-6` wrapper
  του Outlet (`Header.jsx`, ψηλός όσο ΟΛΗ η σελίδα σε κάθε περίπτωση),
  πιο robust από πριν.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome): `/merch` (1 crumb,
κεντραρισμένο, πάνω από το γκρι) → `/merch/category/new` (2 crumbs,
κεντραρισμένο, sticky+blur στο scroll) → `/merch/overview/t-shirt-roosters`
(3 crumbs, πλατύτερο pill αλλά ακόμα κεντραρισμένο, sticky επιβεβαιωμένο
μετά την αναδιάρθρωση) → `/merch/cart` (2 crumbs, κεντραρισμένο).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Άμεση συνέχεια, ίδια μέρα — bug σε κινητό**: ο χρήστης βρήκε (screenshot)
ότι με 3 crumbs σε στενή οθόνη κινητού το pill έσπαγε σε 2η γραμμή
(`flex-wrap`) — ρητό αίτημα: "δεν θέλω να αλλάζει γραμμή", με πρόταση
μικρότερης γραμματοσειράς σε κινητό.

**Fix, `MerchBreadcrumb.jsx`** (3 αλλαγές μαζί, όχι μόνο η γραμματοσειρά,
ώστε να ΜΗΝ ξανασπάσει ούτε σε ακραία περίπτωση — πολύ στενή οθόνη/πολύ
μεγάλο όνομα προϊόντος):
1. Αφαιρέθηκε το `flex-wrap` (αυτό έσπαγε σε 2η γραμμή).
2. Μικρότερη γραμματοσειρά/padding/gap σε κινητό: `text-xs` (αντί
   `text-sm`), `sm:text-sm` από tablet και πάνω· αντίστοιχα μικρότερα
   `px`/`py`/`gap`.
3. **Ασφαλιστική δικλείδα**: `overflow-x-auto` + `whitespace-nowrap` +
   κρυμμένη scrollbar (`[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`)
   πάνω στο ίδιο το pill — αν παρ' όλα αυτά η διαδρομή είναι πολύ πλατιά
   για την οθόνη, σκρολάρει οριζόντια ΜΕΣΑ στον εαυτό της αντί να σπάσει
   σε 2η γραμμή ή να ξεχειλίσει έξω από τη σελίδα.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, viewport 414px, ακριβώς το
σενάριο του screenshot — "New Arrivals" → "T-Shirt ΣΤΡΑΦΙ Μαύρο", 3
crumbs): μία γραμμή (ύψος pill 28px), πλάτος pill 334px < 414px viewport,
`document.documentElement.scrollWidth` (399px) < viewport — καμία
οριζόντια υπερχείλιση σελίδας.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 🔍 Merch κατηγορία: H1 επικεφαλίδα + κυκλικό κουμπί φίλτρων + πάνελ φίλτρων (16/9)

Ρητό αίτημα χρήστη (5 screenshots): (1) επικεφαλίδα H1 πάνω από τη
γραμμή/κάτω από το breadcrumb, σε κάθε σελίδα κατηγορίας — ίδιο κείμενο
με το breadcrumb (π.χ. "New Arrivals")· (2) αφαίρεση του παλιού, ορατού
"Ταξινόμηση" row και αντικατάστασή του με ΜΟΝΟ ένα κυκλικό, ημιδιάφανο
κουμπί (ίδιο στυλ με το κουμπί "αγαπημένα" πάνω στην κάρτα προϊόντος —
`bg-white/80` + `backdrop-blur`), που κολλάει/scrollάρει μαζί με το
breadcrumb pill· (3) πατώντας το, ανοίγει πάνελ φίλτρων από ΠΑΝΩ μέχρι
περίπου τα μισά της οθόνης, με κουμπί "Εφαρμογή"· (4) φίλτρα για όλες τις
κατηγορίες — ό,τι χρειάζεται ένα σύγχρονο eshop.

Πριν ξεκινήσει η υλοποίηση, 3 διευκρινιστικές ερωτήσεις στον χρήστη
(επιβεβαιώθηκαν όλες): το 4ο screenshot (καρδιά/αγαπημένα) ήταν ΜΟΝΟ
οπτικό στυλ-παράδειγμα (το κουμπί δείχνει filter icon, όχι καρδιά)· το
σύνολο φίλτρων = Ταξινόμηση + Τιμή + Διαθεσιμότητα + Μέγεθος· το κείμενο
του H1 = ακριβώς το ίδιο με το breadcrumb (`category.title`).

**Νέο αρχείο `filterDefaults.js`** (Merch/): εξάγει `DEFAULT_FILTERS`
(σχήμα: `sortBy`, `priceMin`, `priceMax`, `onlyAvailable`, `sizes`) σε
ξεχωριστό αρχείο — ΟΧΙ named export μέσα στο `ProductFilters.jsx`, γιατί
αυτό σπάει το Fast Refresh (eslint `react-refresh/only-export-components`:
ένα αρχείο components πρέπει να εξάγει ΜΟΝΟ components).

**`ProductFilters.jsx`**: πλήρης επανασχεδίαση. `<Sheet>` με κυκλικό
`<SheetTrigger>` (filter icon, πράσινη κουκκίδα μόνο όταν υπάρχουν
πραγματικά ενεργά φίλτρα — η ταξινόμηση μόνη της δεν μετράει, δεν μειώνει
αποτελέσματα) και `<SheetContent side="top" className="max-h-[70vh]
overflow-y-auto">` (πάνελ από πάνω, όχι ολόκληρη οθόνη). "Προσχέδιο"
(`draft`) state: οι επιλογές εφαρμόζονται μόνο στο "Εφαρμογή"
(`onApply(draft)`), το "Καθαρισμός" επαναφέρει σε `DEFAULT_FILTERS`. Το
draft συγχρονίζεται με τα ήδη-εφαρμοσμένα φίλτρα ΤΗ ΣΤΙΓΜΗ που ανοίγει το
πάνελ — μέσα στο `onOpenChange` handler (`handleOpenChange`), ΟΧΙ με
`useEffect` (eslint `react-hooks/set-state-in-effect`: setState μέσα σε
effect προκαλεί επιπλέον cascading render· η σωστή θέση είναι το event
handler που προκαλεί το άνοιγμα). Μέγεθος (S/M/L/XL) εμφανίζεται μόνο
όταν `showSizeFilter` prop είναι true.

**`MerchBreadcrumb.jsx`**: νέο, προαιρετικό `action` prop — ρεντεράρεται
`absolute`-positioned ΜΕΣΑ στο ήδη sticky `<nav>` (όχι σαν ξεχωριστό
sticky sibling — δύο ξεχωριστά `position: sticky` στοιχεία με το ίδιο
`top: 0` θα επικάλυπταν μόλις "κολλήσουν" και τα δύο). Το `<nav>`
κρατάει επιπλέον δεξί padding (`pr-14 sm:pr-16`) όταν υπάρχει `action`,
ώστε το κεντραρισμένο pill να μην συγκρούεται ποτέ με το κουμπί.

**`MerchCategoryRoute.jsx`**: `sortBy` state → `filters` state
(`DEFAULT_FILTERS` ως αρχική τιμή). Νέο `filteredItems` useMemo: φιλτράρει
κατά εύρος τιμής, διαθεσιμότητα (`getTotalStock(p) > 0`, ίδιο σημείο
αλήθειας με το badge) και μέγεθος (`product_variants` με stock > 0), μετά
ταξινομεί. `hasClothingItems` (`category.items.some(p => p.category ===
"clothing")`) καθορίζει αν εμφανίζεται το φίλτρο μεγέθους — καμία επινόηση
μεγεθών σε κατηγορίες χωρίς ρούχα (π.χ. "CD & Βινύλια"). Νέο `<h1>` με
`border-b` (η "γραμμή") πάνω από τη λίστα προϊόντων, δείχνει
`category.title`. Το `<ProductFilters>` περνάει πλέον ως `action` prop
στο `<MerchBreadcrumb>` αντί να ρεντεράρεται inline.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1) — στην πρώτη προσπάθεια
είχαν προκύψει 2 νέα errors (τα δύο παραπάνω, `only-export-components` +
`set-state-in-effect`), διορθώθηκαν πριν το ζωντανό verify.

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `strafi.concerto.gr:5173`):
- `/merch/category/new`: H1 "New Arrivals" κάτω από το breadcrumb, πάνω
  από τη γραμμή· κυκλικό κουμπί φίλτρων δίπλα στο pill.
- Πάνελ ανοίγει από πάνω μέχρι ~μέσα οθόνης, με Ταξινόμηση + Τιμή +
  Διαθεσιμότητα + Μέγεθος (η "New Arrivals" περιέχει ρούχα).
- Ταξινόμηση "Τιμή: Υψηλή → Χαμηλή" + "Εφαρμογή" → η λίστα προϊόντων
  αναδιατάχθηκε σωστά (28€ → 25€ πρώτα).
- Φίλτρο τιμής "έως 22€" + "Εφαρμογή" → έμειναν ΜΟΝΟ τα 3 T-Shirts (20€
  έκαστο), τα CD/βινύλια (25€/28€) φιλτραρίστηκαν σωστά έξω· πράσινη
  κουκκίδα ενεργού φίλτρου εμφανίστηκε στο κουμπί.
- Ξανά-άνοιγμα πάνελ: το draft έδειξε σωστά τα ήδη-εφαρμοσμένα φίλτρα
  (τιμή "22", ταξινόμηση "Υψηλή → Χαμηλή").
- "Καθαρισμός" + "Εφαρμογή" → επαναφορά σε όλα τα προϊόντα.
- `/merch/category/music` (CD & Βινύλια, χωρίς ρούχα): H1 σωστό, φίλτρο
  Μέγεθος ΣΩΣΤΑ κρυμμένο.
- `/merch/category/clothing` (Ρουχισμός): H1 σωστό.

**Άμεση συνέχεια, ίδια μέρα — ρητό αίτημα χρήστη (screenshots): αλλαγή
θέσης + στυλ του κουμπιού φίλτρων.** Ο χρήστης δεν ήθελε πια το κουμπί
δίπλα στο breadcrumb — το ήθελε "στη μέση της οθόνης, αριστερά" (δηλ.
κατακόρυφο κέντρο του viewport, όχι απλά κοντά στην κορυφή), και πιο
"liquid glass" (πιο blur).

**`ProductFilters.jsx`**: το trigger button έγινε `position: fixed`
(`fixed top-1/2 left-4 -translate-y-1/2 z-30`) αντί για μέρος του
breadcrumb — μένει ΠΑΝΤΑ στο ίδιο σημείο του viewport ανεξάρτητα από
scroll (καλύπτει και το παλιό "να πηγαίνει μαζί με το scroll", απλά με
πιο δραστικό τρόπο: δεν κινείται καθόλου). Στυλ "liquid glass": πιο δυνατό
`backdrop-blur-2xl` (αντί `md`), πιο διάφανο φόντο `bg-white/20` (αντί
`/80`), λευκό `ring-white/40` (αντί `ring-gray-900/5`) — θολωμένο γυαλί
αντί για σχεδόν-συμπαγές λευκό.

**`MerchBreadcrumb.jsx`**: αφαιρέθηκε το `action` prop (δεν χρειάζεται
πια — το κουμπί δεν ρεντεράρεται μέσα στο breadcrumb). Γύρισε στην απλή
του μορφή (μόνο `crumbs`).

**`MerchCategoryRoute.jsx`**: το `<ProductFilters>` ρεντεράρεται πλέον ως
ανεξάρτητο sibling (Fragment) αντί να περνάει ως `action` prop — η θέση
του καθορίζεται εξ ολοκλήρου από το ίδιο το κουμπί (`fixed`), όχι από πού
βρίσκεται στο DOM (το Radix Sheet trigger/content pattern δουλεύει μέσω
context ούτως ή άλλως).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, mobile viewport,
`/merch/category/clothing`): το κουμπί εμφανίζεται στο αριστερό-κέντρο
της οθόνης, με θολωμένο/ημιδιάφανο φόντο· scroll test — μένει ΑΚΡΙΒΩΣ στο
ίδιο σημείο ενώ το breadcrumb (sticky, ξεχωριστό μηχανισμό) και τα
προϊόντα περνάνε από πίσω/κάτω του· άνοιγμα πάνελ φίλτρων δουλεύει
κανονικά από τη νέα θέση.

**Άμεση συνέχεια, ίδια μέρα — ρητό αίτημα χρήστη (νέα screenshots): πίσω
στην ίδια γραμμή με το breadcrumb + liquid glass και στα δύο.** Το
`position: fixed` πείραμα δεν ήταν αυτό που ήθελε τελικά ο χρήστης — ζήτησε
το κουμπί να ξαναμπεί "στην ίδια ευθεία με το Merch Store" (ίδια γραμμή με
το breadcrumb pill) ΚΑΙ να γίνουν και τα δύο (pill + κουμπί) στυλ "liquid
glass" (πιο blur και τα δύο, όχι μόνο το κουμπί).

**`ProductFilters.jsx`**: το trigger button ξαναγύρισε από `position:
fixed` σε κανονικό, μη-fixed στοιχείο (`relative`, ώστε η πράσινη κουκκίδα
ενεργού φίλτρου να δεσμεύεται σωστά πάνω του) — η θέση του καθορίζεται
πλέον ΞΑΝΑ από το MerchBreadcrumb (`action` prop). Στυλ liquid glass:
`bg-white/25 backdrop-blur-2xl ring-1 ring-white/40 shadow-lg`.

**`MerchBreadcrumb.jsx`**: επανήλθε το `action` prop (absolute, δεξιά μέσα
στο sticky nav, ίδιο μηχανισμό με πριν). Το ΙΔΙΟ το breadcrumb pill πήρε
επίσης liquid-glass αναβάθμιση: `bg-white/50` (από `/80`),
`backdrop-blur-xl` (από `md`), `ring-1 ring-white/40` (από
`ring-gray-900/5`), `shadow-lg` (από `shadow-sm`) — λίγο πιο σκούρο κείμενο
(`text-gray-600` από `text-gray-500`) για να μείνει ευανάγνωστο παρά το
πιο διάφανο φόντο.

**`MerchCategoryRoute.jsx`**: το `<ProductFilters>` περνάει ξανά ως
`action` prop στο `<MerchBreadcrumb>` αντί για ανεξάρτητο sibling.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, mobile viewport,
`/merch/category/clothing`): breadcrumb pill + κουμπί φίλτρων ξανά στην
ίδια γραμμή, και τα δύο με ορατό glass/blur effect· scroll test — μένουν
sticky μαζί, ίδιο ύψος, με το περιεχόμενο να περνάει θολό από πίσω τους.

**Άμεση συνέχεια, ίδια μέρα — ρητό αίτημα χρήστη (νέα screenshots): 3η
(τελική) θέση κουμπιού φίλτρων + κεντραρισμένο H1 + γκρι πλαίσιο + πιο
"3D" κάρτες.** Ο χρήστης εξήγησε ΓΙΑΤΙ η "ίδια γραμμή με το breadcrumb"
δεν δούλευε: όταν το pill μεγαλώνει (μεγαλύτερα crumbs), μπορεί να
σκεπάσει/σπρώξει το κουμπί. Ζήτησε το κουμπί σε ΔΙΚΗ ΤΟΥ γραμμή, ΚΑΤΩ από
το breadcrumb, τέρμα αριστερά με μικρό κενό από την άκρη της οθόνης —
ανεξάρτητο πλάτος pill. Επιπλέον, 3 ξεχωριστά αιτήματα: (1) το H1 τίτλου
κατηγορίας κεντραρισμένο (ήταν αριστερά)· (2) H1 + λίστα προϊόντων μέσα σε
ΕΝΑ γκρι πλαίσιο με στρογγυλεμένες γωνίες, αντί για "γκρι σελίδα + άσπρο
ορθογώνιο πίσω από τις κάρτες"· (3) περισσότερη σκιά κάτω από κάθε κάρτα
προϊόντος, ώστε να φαίνεται 3D.

**`MerchBreadcrumb.jsx`**: το εξωτερικό sticky element έγινε ΤΟ ΙΔΙΟ το
`<div>` (πριν ήταν το `<nav>`) — περιέχει 2 γραμμές: `<nav>` με το
κεντραρισμένο pill, και από κάτω (`mt-2`) το `action` σε δική του γραμμή,
`justify-start pl-4 sm:pl-6` (τέρμα αριστερά, μικρό κενό). Και οι δύο
γραμμές μένουν ΜΕΣΑ στο ΙΔΙΟ sticky container — ΟΧΙ δύο ξεχωριστά sticky
στοιχεία (ίδιο σκεπτικό με τα προηγούμενα sticky fixes: θα
αλληλοεπικαλύπτονταν). Έτσι το πλάτος του pill δεν μπορεί ΠΟΤΕ να
επηρεάσει τη θέση του κουμπιού — εντελώς ανεξάρτητα οριζόντια.

**`MerchCategoryRoute.jsx`**: η σελίδα γύρισε σε `bg-white` (ήταν
`bg-gray-50`)· το γκρι μπαίνει ΜΟΝΟ σε ΕΝΑ ενιαίο `<div>`
(`rounded-2xl bg-gray-50 ring-1 ring-gray-200`) που περιέχει ΚΑΙ το H1
ΚΑΙ το `<ProductList>` — αντί για δύο ξεχωριστά φόντα (γκρι σελίδα +
λευκό ορθογώνιο πίσω από τις κάρτες). Το H1 πήρε `text-center` (ήταν
αριστερά). Το ίδιο μοτίβο εφαρμόστηκε και στο σκελετό φόρτωσης
(`isLoading`) για συνέπεια, ώστε να μην υπάρχει "flash" διαφορετικού
φόντου κατά τη φόρτωση.

**`ProductList.jsx`**: αφαιρέθηκε το δικό του `bg-white` + max-width
wrapper (το max-width container έρχεται πλέον απ' έξω, από το γκρι
πλαίσιο) — επιστρέφει πλέον ΜΟΝΟ το grid. Η κάρτα πήρε `shadow-2xl` (ήταν
`shadow-lg`) — πιο έντονη σκιά, πιο ορατή τώρα που οι κάρτες επιπλέουν
πάνω σε γκρι (πριν πάνω σε λευκό, η σκιά ξεχώριζε λιγότερο).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, mobile viewport,
`/merch/category/clothing`): breadcrumb pill σε 1η γραμμή (κεντραρισμένο),
κουμπί φίλτρων σε 2η γραμμή ΑΠΟ ΚΑΤΩ, τέρμα αριστερά· H1 "Ρουχισμός"
κεντραρισμένο μέσα σε γκρι πλαίσιο με στρογγυλεμένες γωνίες· κάρτες
προϊόντων floating με ορατά πιο έντονη σκιά (3D αίσθηση)· scroll test —
breadcrumb+κουμπί μένουν σταθερά μαζί, ο ένας κάτω από τον άλλο.

## 📤 Κουμπί κοινοποίησης σε κάθε κάρτα προϊόντος (16/9)

Ρητό αίτημα χρήστη: εικονίδιο "share" σε κάθε κάρτα προϊόντος στο grid,
ώστε ο επισκέπτης να μπορεί να το κάνει share σε Instagram και "παντού".

Ανακαλύφθηκε ότι ΥΠΗΡΧΕ ήδη ολόκληρη η λογική κοινοποίησης
(`navigator.share` native OS sheet → `navigator.clipboard` → legacy
`document.execCommand` fallback, με toast feedback) στο
`ProductOverviewRoute.jsx` (14/9, "product overview για να μπορεί να το
κάνει share το link") — αλλά ΜΟΝΟ εκεί, όχι στις κάρτες του grid.

**Νέο αρχείο `lib/shareLink.js`**: η λογική εξήχθη σε κοινό helper
(`shareLink({ url, title })`) — ένα σημείο αλήθειας, ίδια συμπεριφορά
παντού αντί για διπλασιασμό κώδικα. Σειρά προτεραιότητας: (1)
`navigator.share` — σε κινητό ανοίγει το native share sheet του
λειτουργικού με ΟΛΕΣ τις εγκατεστημένες εφαρμογές (Instagram, WhatsApp,
Messages, ό,τι έχει ο χρήστης)· (2) `navigator.clipboard.writeText` —
desktop χωρίς Web Share API, αντιγράφει τον σύνδεσμο με toast
επιβεβαίωσης· (3) legacy `execCommand("copy")` fallback για μη-secure
context (plain http, π.χ. τοπικό dev server).

**`ProductOverviewRoute.jsx`**: αναδιαρθρώθηκε ώστε να χρησιμοποιεί το
κοινό `shareLink()` αντί για τη δική του (ίδια, τώρα διαγραμμένη)
αντιγραφή της λογικής — καμία αλλαγή συμπεριφοράς, μόνο DRY.

**`ProductList.jsx`**: νέο κουμπί κοινοποίησης σε κάθε κάρτα, ΙΔΙΟ στυλ με
το ήδη υπάρχον κουμπί αγαπημένων (`bg-white/80 backdrop-blur-sm rounded-
full`, κυκλικό), τοποθετημένο συμμετρικά στην ΑΠΕΝΑΝΤΙ γωνία
(`top-2 left-2`, η καρδιά είναι `top-2 right-2`). `handleShare`
(`stopPropagation`, ίδιο μοτίβο με το αγαπημένα-icon — δεν πρέπει να
πυροδοτεί ΚΑΙ την πλοήγηση της κάρτας) καλεί `shareLink()` με URL προς τη
μοιράσιμη σελίδα προϊόντος (`/merch/overview/:slug` — ΟΧΙ τη λίστα
κατηγορίας), ίδιο URL που θα άνοιγε ένα κλικ πάνω στην κάρτα.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/merch/category/clothing`):
εικονίδιο κοινοποίησης ορατό πάνω-αριστερά σε κάθε κάρτα· κλικ σε desktop
(χωρίς Web Share API) → "Ο σύνδεσμος αντιγράφηκε" toast, η κάρτα ΔΕΝ
πλοηγήθηκε (stopPropagation δούλεψε σωστά).

**Άμεση συνέχεια, ίδια μέρα — μικρό αίτημα χρήστη:** το κουμπί
"Ακολουθείς" (`Header.jsx`, εμφανίζεται όταν ο fan ακολουθεί ήδη τον
tenant) έγινε μικρότερο — `px-2 py-1 text-xs` αντί για `px-3 py-1.5
text-sm`. `npx eslint .` αμετάβλητο (19/1), ζωντανά επιβεβαιωμένο.

**Άμεση συνέχεια, ίδια μέρα — μικρή διόρθωση θέσης:** το κουμπί φίλτρων
(`MerchBreadcrumb.jsx`, δεύτερη γραμμή) μετακινήθηκε ακόμα πιο αριστερά —
`pl-1 sm:pl-2` αντί για `pl-4 sm:pl-6`.

## 🖼️ Ίδιο στυλ (γκρι πλαίσιο) και στη σελίδα "Κατηγορίες" (16/9)

Ρητό αίτημα χρήστη: το ίδιο στυλ πλαισίου που μπήκε στη σελίδα κατηγορίας
(`MerchCategoryRoute.jsx` — bg-white σελίδα, γκρι πλαίσιο με στρογγυλεμένες
γωνίες γύρω από τίτλο+περιεχόμενο) να μπει ΚΑΙ στη σελίδα "Κατηγορίες"
(`/merch`), ΧΩΡΙΣ όμως το κουμπί φίλτρων — ρητά όχι, δεν έχει νόημα εκεί
(δεν υπάρχει λίστα προϊόντων προς φιλτράρισμα, μόνο κάρτες κατηγοριών).

**`MerchCategoriesRoute.jsx`**: η σελίδα έγινε `bg-white` (ήταν
`bg-gray-50`) — ίδιο μοτίβο με το `MerchCategoryRoute.jsx`. Το `action`
prop ΔΕΝ περνάει στο `<MerchBreadcrumb>` εδώ (καμία αλλαγή σε σχέση με
πριν — απλά επιβεβαιώνεται ρητά στο σχόλιο ότι είναι σκόπιμο). Το ίδιο
μοτίβο εφαρμόστηκε και στο σκελετό φόρτωσης για συνέπεια.

**`CategoryGrid.jsx`**: όλο το περιεχόμενο (τίτλος "Κατηγορίες" + banner
"New Arrivals" + grid υπόλοιπων κατηγοριών) μπήκε μέσα σε ΕΝΑ
`rounded-2xl bg-gray-50 ring-1 ring-gray-200` πλαίσιο — ίδιες τιμές με το
πλαίσιο στη σελίδα κατηγορίας. Ο τίτλος "Κατηγορίες" (H2) πήρε
`text-center` + `border-b` (ήταν αριστερά, χωρίς γραμμή) — ίδιο στυλ με το
H1 εκεί. Το outer padding κανονικοποιήθηκε σε `py-8` (ήταν `py-16
sm:py-24`) ώστε να ταιριάζει με το ύψος padding της σελίδας κατηγορίας.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/merch`): τίτλος
"Κατηγορίες" κεντραρισμένος με γραμμή, μέσα σε γκρι πλαίσιο με
στρογγυλεμένες γωνίες, όλες οι κάρτες κατηγοριών (New Arrivals, Ρουχισμός,
CD & Βινύλια) μέσα στο ίδιο πλαίσιο· ΚΑΝΕΝΑ κουμπί φίλτρων (σωστά).

**Άμεση συνέχεια, ίδια μέρα — ρητό αίτημα χρήστη:** κάθε κάρτα κατηγορίας
(`CategoryGrid.jsx`) να πάρει "λίγο άσπρο γύρω γύρω και σκιά, όπως τα
product" — μέχρι τότε η εικόνα γέμιζε κολλητά ολόκληρο το πλαίσιο
(`overflow-hidden rounded-lg` απευθείας πάνω στο `<Link>`), χωρίς λευκό
περιθώριο ή σκιά, σε αντίθεση με τις κάρτες προϊόντων.

**Fix**: κάθε κάρτα (το "New Arrivals" banner ΚΑΙ κάθε κάρτα στο
`rest.map`) τυλίχτηκε στο ΙΔΙΟ shadcn `<Card>`/`<CardContent>` που ήδη
χρησιμοποιεί το `ProductList.jsx` — λευκό φόντο, padding γύρω από την
εικόνα, στρογγυλές γωνίες, `shadow-2xl` (ίδια τιμή με τις κάρτες
προϊόντων, για συνεπές "3D" ύφος). Η ίδια η εικόνα/overlay/κείμενο μένουν
ΑΚΡΙΒΩΣ όπως ήταν, μόνο πλέον μέσα σε `rounded-md` (αντί `rounded-lg`,
ώστε να ταιριάζει με τις εσωτερικές γωνίες του Card) container μέσα στο
Card αντί να είναι η ίδια η εξωτερική κάρτα.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/merch`): και οι 3 κάρτες
κατηγοριών (New Arrivals, Ρουχισμός, CD & Βινύλια) εμφανίζονται με λευκό
περιθώριο γύρω από την εικόνα και ορατή σκιά — ίδιο ύφος με τις κάρτες
προϊόντων.

## 18/9 — Διάγνωση: 400 errors στο deployed Netlify site (refresh_token + sync_own_fan_from_auth)

**Αναφορά χρήστη:** στο `https://concertofamily.netlify.app/merch/overview/t-shirt-roosters`,
ενώ ήταν συνδεδεμένος, έβλεπε 2 console errors (HTTP 400) — ένα σε
`.../auth/v1/token?grant_type=refresh_token`, ένα στο RPC
`sync_own_fan_from_auth`. ΔΕΝ εμφανίζονταν στο τοπικό dev server.

**Διάγνωση:** επιβεβαιώθηκε ζωντανά (Claude in Chrome) ότι χωρίς login,
όλα τα requests σε εκείνο το link γυρνάνε 200 — άρα το πρόβλημα αφορά
ΜΟΝΟ ένα ήδη-αποθηκευμένο session σε εκείνον τον browser/domain. Αλυσίδα:
το `useAuth.js` καλεί `supabase.auth.getSession()` στο mount, το οποίο
πίσω από τις σκηνές προσπαθεί να κάνει refresh το session με το
αποθηκευμένο refresh token — αν αυτό είναι μπαγιάτικο/ήδη χρησιμοποιημένο
(π.χ. Supabase's refresh token rotation), το refresh 400άρει. Το
`useFanSession.js` καλεί ΑΜΕΣΩΣ μετά (μέσω `syncFanFromAuth`) το RPC
`sync_own_fan_from_auth` με ό,τι `user` υπάρχει ακόμα στο React state·
μέσα στη function, `insert into fans (id) values (auth.uid())` — αν το
session δεν είναι πια έγκυρο, το `auth.uid()` γυρνάει `null`, το `fans.id`
είναι `NOT NULL`, Postgres error 23502 → PostgREST το μεταφράζει σε HTTP
400. Αυτό είναι το δεύτερο error.

**Fix (`useFanSession.js`):** το υπάρχον auto-local-sign-out (μέχρι τώρα
μόνο για `23503`, foreign-key violation — π.χ. διαγραμμένος λογαριασμός
από άλλο subdomain) επεκτάθηκε σε νέα function `isBrokenSessionError()`
που καλύπτει ΚΑΙ `23502` (not-null violation στο `fans.id`, δηλαδή
`auth.uid()` = null) ΚΑΙ τους δικούς του κωδικούς του PostgREST για
ληγμένο/άκυρο JWT (`PGRST301`, `PGRST303`). Σε κάθε τέτοια περίπτωση,
`supabase.auth.signOut({ scope: "local" })` — καθαρίζει ΜΟΝΟ το τοπικό
cookie/storage της συσκευής, καμία server-side ενέργεια, ο fan απλά
ξαναγίνεται "επισκέπτης" και μπορεί να ξανακάνει σύνδεση καθαρά αντί να
μένει κολλημένος με σπασμένα requests σε κάθε φόρτωση. Standard,
καθιερωμένο pattern σε production apps (graceful session recovery).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Άμεσο fix για τον ίδιο τον χρήστη (μη-κώδικας):** logout/clear cookies
στο `concertofamily.netlify.app` και ξανά-login, καθαρίζει αμέσως το
συγκεκριμένο μπαγιάτικο session.

## 18/9 — Share button στα events (κάρτα λίστας + ticket modal)

**Ρητό αίτημα χρήστη:** κουμπί share σε κάθε event ώστε να μπορεί να το
κοινοποιήσει σε Instagram/Facebook/παντού (διαφήμιση). Ρώτησε επίσης αν
χρειάζεται αλλαγή στη δομή routing αφού "δεν είναι ήδη κάθε event route
από μόνο του;"

**Απάντηση/επιβεβαίωση:** ΟΧΙ, καμία αλλαγή δομής δεν χρειάστηκε — το
`/events/event/:eventId` ήταν ΗΔΗ πραγματικό, μοιράσιμο route πριν από
αυτό το feature (`EventModalRoute.jsx`, δέχεται slug ή UUID ρητά για
"κοινοποιημένα links", με ειδικό χειρισμό `cameFromSharedLink` για το
πώς συμπεριφέρεται το κουμπί "πίσω" όταν κάποιος έρχεται από κοινοποιημένο
σύνδεσμο). Απλά δεν υπήρχε ακόμα ΚΟΥΜΠΙ που να το κάνει εύκολο.

**Fix:** ίδιο `shareLink()` helper (`lib/shareLink.js`) με το Merch,
προστέθηκε σε 2 σημεία:
- `EventsList.jsx` — νέο κουμπί share δίπλα στην καρδούλα favorite,
  πάνω-δεξιά στην εικόνα κάθε κάρτας event (ίδιο μοτίβο absolute/
  backdrop-blur με το ProductList.jsx στο Merch).
- `TicketDialog.jsx` (το modal που ανοίγει όταν πατήσεις "Ticket") — νέο
  κουμπί share πάνω-δεξιά, αριστερά από το X κλεισίματος
  (`absolute top-2 right-10`, ίδιο positioning pattern με το ήδη υπάρχον
  X). Ο τίτλος πήρε `pr-16` ώστε μεγάλοι τίτλοι να μην κρύβονται πίσω
  από τα δύο κουμπιά.

Και τα δύο καλούν `shareLink({ url: `${origin}/events/event/${event.slug}`,
title: event.title })` — ίδιο URL με αυτό που ήδη δούλευε ως μοιράσιμο
route.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/events`): το κουμπί στην
κάρτα λίστας αντιγράφει το σωστό link (toast "Ο σύνδεσμος αντιγράφηκε.")·
το ίδιο και το κουμπί μέσα στο ticket modal, χωρίς να συγκρούεται
οπτικά με το κουμπί κλεισίματος.

## 18/9 — ProductQuickShop.jsx: μόνο το κουμπί "Πληρωμή" μένει

**Ρητό αίτημα χρήστη:** στο "Γρήγορη αγορά" modal (`ProductQuickShop.jsx`)
υπήρχαν 2 κουμπιά κάτω από την επιλογή μεγέθους/ποσότητας —
"Προσθήκη στο καλάθι" (λειτουργικό) και "Πληρωμή" (ανενεργό placeholder,
"Έρχεται σύντομα"). Ζήτησε να μείνει ΜΟΝΟ το "Πληρωμή".

**⚠️ Ρωτήθηκε ρητά πριν την αλλαγή** (γιατί το "Πληρωμή" είναι ΣΗΜΕΡΑ
ανενεργό, χωρίς κανένα σύστημα πληρωμής από πίσω του) — ο χρήστης
επιβεβαίωσε: ναι, θέλει κυριολεκτικά μόνο το σημερινό ανενεργό "Πληρωμή",
όχι μετονομασία του λειτουργικού κουμπιού. **Συνέπεια: το Quick Shop modal
δεν μπορεί πλέον να προσθέσει τίποτα στο καλάθι — μόνο δείχνει
μέγεθος/ποσότητα και ένα ανενεργό κουμπί.** Ρητά ενήμερος ο χρήστης,
είπε "θα το συζητήσουμε τη συνέχεια μετά" (προφανώς: πραγματικό checkout
flow γι' αυτό το modal, μελλοντικό task).

**Fix:** αφαιρέθηκε το `<Button onClick={handleAdd}>Προσθήκη στο
καλάθι</Button>`. Αφαιρέθηκαν ως νεκρός κώδικας (ESLint no-unused-vars):
η `handleAdd()` function, η `canAddToCart` μεταβλητή, και τα πλέον
αχρησιμοποίητα props `onAddToCart`/`isLoggedIn`/`onRequireAuth` από το
destructuring (ο caller, `ProductModalRoute.jsx`, συνεχίζει να τα περνάει
κανονικά — απλά δεν διαβάζονται προς το παρόν). Το μέγεθος/ποσότητα UI
(SizeSelector, quantity stepper) ΔΕΝ άγγιξε καθόλου — μένει ορατό, απλά
δεν οδηγεί πουθενά ακόμα.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, "Γρήγορη αγορά" στο T-Shirt
Roosters): μόνο το "Πληρωμή" εμφανίζεται, ανενεργό.

## 18/9 — ProductQuickShop.jsx: ίδιο γκρι πλαίσιο/λευκή κάρτα ύφος + liquid-glass "Πληρωμή"

**Ρητό αίτημα χρήστη**, με αναφορά screenshot της σελίδας κατηγορίας ως
πρότυπο ύφος: το "Γρήγορη αγορά" modal να πάρει το ίδιο "γκρι πλαίσιο +
λευκή κάρτα με σκιά" ύφος με τις σελίδες Merch. Συγκεκριμένα:
- Όλο το modal γκρι φόντο (όπως το `bg-gray-50` του
  `MerchCategoryRoute.jsx`) με στρογγυλεμένες γωνίες γύρω γύρω.
- Το περιεχόμενο (εικόνα/όνομα/τιμή/μέγεθος) μέσα σε λευκή κάρτα με σκιά
  ("θόλωμα από πίσω, σαν 3D" — η ίδια περιγραφή που είχε δώσει νωρίτερα
  για τη σκιά κάτω από τις κάρτες προϊόντων).
- Το κουμπί "Πληρωμή" να βγει ΕΞΩ από τη λευκή κάρτα, μόνο του μέσα στο
  γκρι πλαίσιο, πλήρες πλάτος με κενό αριστερά/δεξιά, κεντραρισμένο
  κείμενο, liquid-glass στυλ.

**Fix (`ProductQuickShop.jsx`):**
- `DialogContent` πήρε `bg-gray-50 ring-gray-200` μέσω className override
  — ΜΟΝΟ σε αυτό το instance (το κοινό `ui/dialog.jsx` δεν άλλαξε, όλα τα
  υπόλοιπα dialogs του project μένουν όπως ήταν).
- Η εικόνα/όνομα/τιμή/περιγραφή/μέγεθος τυλίχτηκαν σε `Card`/`CardContent`
  (ίδιο shadcn component με CategoryGrid.jsx/ProductList.jsx) με
  `shadow-2xl`.
- Το "Πληρωμή" έγινε plain `<button>` (όχι πια το shadcn `Button`, αφού
  δεν χρειαζόταν πια — αφαιρέθηκε το import), `w-full`, `rounded-full`,
  κεντραρισμένο κείμενο, liquid-glass (`bg-white/25 backdrop-blur-2xl
  ring-1 ring-white/40 shadow-lg` — ίδιο μοτίβο με το κουμπί φίλτρων στο
  ProductFilters.jsx), ΕΞΩ από το Card, σαν sibling μέσα στο γκρι πλαίσιο.
  Παραμένει `disabled`/"Έρχεται σύντομα", καμία αλλαγή λειτουργικότητας —
  μόνο εμφάνιση.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, "Γρήγορη αγορά" στο T-Shirt
Roosters): γκρι φόντο ορατό γύρω από τη λευκή κάρτα (λεπτή αλλά καθαρή
αντίθεση, ίδια απόχρωση με το υπόλοιπο site), κάρτα με σκιά, "Πληρωμή"
πλήρους πλάτους/κεντραρισμένο/liquid-glass κάτω από την κάρτα.

## 18/9 — Fix: το X του Dialog "έφευγε" με το scroll (κοινό component) + "Πληρωμή" δυναμικά ενεργό

**Ρητή αναφορά χρήστη** (screenshot): στο "Γρήγορη αγορά" modal, το X
κλεισίματος πάνω-δεξιά δεν έμενε στη θέση του — "έπεφτε"/έφευγε προς τα
πάνω όταν το περιεχόμενο είχε scroll.

**Root cause:** το `ui/dialog.jsx` (κοινό component, ΟΛΑ τα dialogs του
project) είχε το `overflow-y-auto` απευθείας πάνω στο ίδιο το
`DialogPrimitive.Content` — δηλαδή το X (absolute μέσα σε αυτό) ήταν ΜΕΣΑ
στο ίδιο το scrollable container, οπότε scroll-άριζε ΜΑΖΙ με το
περιεχόμενο αντί να μένει σταθερό. Δεν φαινόταν πριν επειδή τα
περισσότερα dialogs χωρούσαν χωρίς scroll — έγινε ορατό τώρα που το
ProductQuickShop.jsx μεγάλωσε (Card wrapper, gray frame κ.λπ.).

**Fix (`ui/dialog.jsx`, αφορά ΟΛΑ τα dialogs, όχι μόνο ένα):** το scroll
μετακόμισε σε ΕΣΩΤΕΡΙΚΟ wrapper `<div>` γύρω από το `{children}`
(`grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain p-4`) — το
ίδιο το `DialogPrimitive.Content` έγινε `flex flex-col overflow-hidden`,
ένα σταθερό "πλαίσιο" χωρίς δικό του scroll. Το X, ως sibling του
wrapper (όχι μέσα του πια), μένει πάντα στην ίδια θέση όσο scroll-άρει το
εσωτερικό. Ζωντανά επιβεβαιωμένο σε 2 dialogs: ProductQuickShop.jsx (το X
μένει σταθερό κατά το scroll) ΚΑΙ TicketDialog.jsx (το `DialogFooter` με
"Κλείσιμο" παραμένει σωστό, flush στην κάτω στρογγυλή γωνία — καμία
παλινδρόμηση).

**Δεύτερο, ρητό αίτημα χρήστη στο ίδιο μήνυμα:** το "Πληρωμή"
(`ProductQuickShop.jsx`) να ΞΕΚΙΝΑΕΙ ανενεργό και να ΕΝΕΡΓΟΠΟΙΕΙΤΑΙ μόλις
επιλεγεί έγκυρο μέγεθος+ποσότητα (αντί για πάντα-ανενεργό). Επανέφερα το
`canAddToCart` (ίδια συνθήκη με πριν: `hasVariants ? hasSizeSelection :
simpleCanAdd`) και το `disabled={!canAddToCart}` στο κουμπί — ΧΩΡΙΣ
πραγματικό onClick/checkout πίσω του ακόμα, μόνο η οπτική/disabled
κατάσταση. Επίσης: πιο έντονη σκιά (`shadow-2xl`, ίδια "3D" λογική) και
border ίδιο με το product Card (`ring-1 ring-foreground/10`, αντί για το
αχνό `ring-white/40`). Ζωντανά επιβεβαιωμένο (JS check στο `disabled`
attribute): `false` με S=1 επιλεγμένο, `true` μετά την επαναφορά σε 0.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 18/9 — Καλάθι: ανάλυση καθαρής αξίας/ΦΠΑ 24%/εξόδων αποστολής

**Ρητό αίτημα χρήστη:** στη "Σύνοψη παραγγελίας" (CartRoute.jsx) να μην
δείχνει πια ένα μονολιθικό "Σύνολο", αλλά: καθαρή αξία, ΦΠΑ 24%, μετά το
τελικό σύνολο — και ξεχωριστά να προστίθενται 3€ έξοδα αποστολής.
Ανέφερε παλιό κώδικα που είχε στείλει σε προηγούμενο session — δεν ήταν
διαθέσιμος σε αυτό το session, οπότε **ρωτήθηκε ρητά πριν την υλοποίηση**
το κρίσιμο ερώτημα: η τιμή προϊόντος (π.χ. 20.00€) εμπεριέχει ήδη ΦΠΑ ή
είναι καθαρή; Απάντηση: ΗΔΗ περιλαμβάνει ΦΠΑ (συνηθισμένο στο
λιανεμπόριο) — άρα η καθαρή αξία εξάγεται ΑΝΑΔΡΟΜΙΚΑ (διαίρεση με 1.24),
ΔΕΝ προστίθεται ΦΠΑ πάνω στην τιμή (αυτό θα αύξανε το ποσό που πληρώνει ο
fan πάνω απ' όσο έδειχνε η κάρτα προϊόντος).

**Νέο αρχείο `lib/pricing.js`** — ένα σημείο αλήθειας:
```js
export const VAT_RATE = 0.24
export const SHIPPING_COST = 3
export function getOrderTotals(subtotal) {
  const net = subtotal / (1 + VAT_RATE)
  const vat = subtotal - net
  const grandTotal = subtotal + SHIPPING_COST
  return { net, vat, shipping: SHIPPING_COST, grandTotal }
}
```
Το `subtotal` (ήδη υπάρχον, από `useCart.js`) παραμένει το ΙΔΙΟ
άθροισμα `price × quantity` (ΦΠΑ-συμπεριλαμβανόμενο) — ΔΕΝ άλλαξε πώς
υπολογίζεται, μόνο πώς παρουσιάζεται/αναλύεται.

**`CartRoute.jsx`:** η ενότητα "Σύνοψη παραγγελίας" δείχνει τώρα 4
γραμμές: Καθαρή αξία, ΦΠΑ 24%, Έξοδα αποστολής (3.00€ σταθερά), Τελικό
σύνολο (= παλιό Σύνολο + 3€).

**⚠️ Σημαντικό όριο, ενημερώθηκε ο χρήστης:** αυτή είναι ΜΟΝΟ αλλαγή στην
ΟΘΟΝΗ του καλαθιού. Η πραγματική παραγγελία που δημιουργείται όταν
πατηθεί "Ολοκλήρωση παραγγελίας" (μέσω `useCreateOrder`/
`create_order_from_cart` RPC, βλ. `OrderSummaryRoute.jsx`) ΔΕΝ αγγίχτηκε
— το `order.subtotal` στη βάση εξακολουθεί να ΜΗΝ περιλαμβάνει τα 3€
αποστολής ούτε ξεχωριστή γραμμή ΦΠΑ (δεν υπάρχει τέτοιο πεδίο στο
`orders` table σήμερα). Θα χρειαστεί ξεχωριστό, μελλοντικό migration/RPC
αλλαγή αν θέλουμε το πραγματικό ποσό της παραγγελίας/του Stripe payment
(όταν φτιαχτεί, βλ. TODO στο `handlePayment` του OrderSummaryRoute.jsx) να
συμπεριλαμβάνει και αυτό.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

**Ζωντανά επιβεβαιωμένο** (Claude in Chrome, `/merch/cart`): Καθαρή αξία
48.39€ + ΦΠΑ 11.61€ = 60.00€ (ίδιο με το παλιό Σύνολο, αμετάβλητο) +
3.00€ αποστολή = 63.00€ τελικό — η αριθμητική επαληθεύτηκε σωστή.

## 18/9 — ConcertoBar: animated λογότυπο (GSAP) + avatar redesign

Ρητό αίτημα χρήστη: `npm install gsap @gsap/react` (έτρεξε ο ίδιος στο
δικό του τερματικό, per κανόνα). Νέο, reusable component
`components/Concerto/ConcertoLogo.jsx` — τυλίγει το ήδη υπάρχον
`assets/images/concerto-logo.jpg` σε κυκλικό badge, με `gsap.to()` (μέσω
`useGSAP()` από `@gsap/react` — αυτόματο cleanup σε unmount) να το κάνει
να "επιπλέει" απαλά (μικρό `y`/`x`/`rotation`, `duration: 3.4`,
`ease: "sine.inOut"`, `yoyo`+`repeat: -1`) — σέβεται
`prefers-reduced-motion`. Ήδη χρησιμοποιείται στατικά (χωρίς animation)
στο `FanDashboardLayout.jsx`· ΔΕΝ αντικαταστάθηκε εκεί ακόμα, μόνο στο
`ConcertoBar.jsx` προς το παρόν.

**`ConcertoBar.jsx`, πολλαπλά γύρους ρητής διόρθωσης από τον χρήστη μετά
από demo screenshots:**
1. Αφαιρέθηκε η συμπαγής navy μπάρα (μαύρο φόντο + κείμενο "Concerto").
2. `position: fixed` πάνω-αριστερά, ΠΑΝΩ από το cover image του tenant
   (Header.jsx) αντί για δική του γραμμή· το εξωτερικό wrapper αντιγράφει
   επίτηδες τις ίδιες responsive κλάσεις του cover image
   (`w-full ... sm:w-2/3 sm:mx-auto`) ώστε η αριστερή άκρη να ταιριάζει
   πάντα με την πραγματική φωτογραφία, σε κάθε πλάτος οθόνης.
3. Λογότυπο (48px) και avatar (32px) ΞΕΧΩΡΙΣΤΑ στοιχεία — ΟΧΙ ενωμένα σε
   ένα pill (πρώτη δοκιμή το είχε έτσι, ρητά απορρίφθηκε). Μόνο το avatar
   έχει "liquid glass" πλαίσιο (border/bg-background/70/backdrop-blur/
   shadow — ίδιο στυλ με το pill nav του Fan Dashboard,
   `FanDashboardLayout.jsx`). Avatar τέρμα δεξιά (`justify-between` στη
   γραμμή), με κενό από τη δεξιά άκρη.
4. Account-avatar dropdown (φωτογραφία/Προφίλ/Διαγραφή/Αποσύνδεση) ΔΕΝ
   άλλαξε λειτουργικά καθόλου — μόνο το οπτικό πλαίσιο γύρω του.

**`Header.jsx`:** cover image λίγο ψηλότερο (`h-32`→`h-40` mobile,
`sm:h-64`→`sm:h-72`) — ρητό αίτημα χρήστη, ώστε να έχει παραπάνω χώρο
τώρα που το ConcertoBar επιπλέει πάνω του.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1) σε κάθε βήμα.

## 19/9 — orders: αποθήκευση ΦΠΑ breakdown (ΧΩΡΙΣ αποστολή, ρητά)

Πλαίσιο: βρέθηκε κενό ελέγχοντας αν η εφαρμογή είναι έτοιμη για Stripe — ο
fan έβλεπε "Τελικό σύνολο 63€" στο καλάθι (60€ + ΦΠΑ ήδη μέσα + 3€
αποστολή), αλλά η πραγματική παραγγελία στη βάση αποθήκευε μόνο 60€
(`orders.subtotal`, χωρίς αποστολή, χωρίς ανάλυση ΦΠΑ) — δύο διαφορετικά
νούμερα σε διαδοχικές σελίδες.

**Ρητή απόφαση χρήστη:** να διορθωθεί ΜΟΝΟ το ΦΠΑ κομμάτι (γνωστό, σταθερό
24%) — να ΜΗΝ προστεθεί καμία στήλη/λογική αποστολής ακόμα, γιατί το
πραγματικό κόστος δεν είναι γνωστό (εκκρεμεί συνεργασία BOX NOW/Skroutz
Point, βλ. αντίστοιχη ενότητα παρακάτω/παραπάνω). Άρα το "Σύνολο" στη
σελίδα παραγγελίας (χωρίς αποστολή) θα συνεχίσει να διαφέρει από το
"Τελικό σύνολο" του καλαθιού (με τα 3€) — αναμενόμενο, σκόπιμο, μέχρι να
κλείσει η συνεργασία courier και να προστεθεί η αποστολή και στα δύο μαζί.

**Migration** (`20260919071300_add_order_vat_breakdown.sql`): δύο νέες
στήλες `orders.net_amount`/`orders.vat_amount`. `create_order_from_cart`
(`create or replace`, ίδιο signature) υπολογίζει τώρα `v_net`/`v_vat` με
ΙΔΙΑ λογική με το `lib/pricing.js` (SQL `v_vat_rate constant := 0.24` —
δύο ξεχωριστές υλοποιήσεις, JS+SQL, πρέπει να μείνουν συγχρονισμένες αν
αλλάξει ποτέ το ΦΠΑ). `net_amount + vat_amount == subtotal` πάντα — δεν
αλλάζει το χρεούμενο ποσό, μόνο προσθέτει την ανάλυση.

**`OrderSummaryRoute.jsx`:** το παλιό μονολιθικό "Σύνολο" έγινε 3 γραμμές
(Καθαρή αξία / ΦΠΑ 24% / Σύνολο) + σημείωση "Δεν περιλαμβάνει έξοδα
αποστολής." Fallback σε `order.subtotal` αν μια παλιά παραγγελία (πριν το
migration) δεν έχει `net_amount`/`vat_amount`.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1). Migration δεν έχει τρέξει
ακόμα από τον χρήστη στο Supabase — commit μόνο μετά από ρητό αίτημα, ίδιο
πάντα.

## 19/9 — CartRoute.jsx: αφαίρεση εξόδων αποστολής από την οθόνη (συνέπεια με τη βάση)

Ρητό αίτημα χρήστη, αμέσως μετά την προηγούμενη ενότητα: "να μην
μπερδευτούμε, θέλω ο fan να βλέπει το κανονικό ποσό, αυτό που βγαίνει από
τη βάση δεδομένων". Το καλάθι έδειχνε "Τελικό σύνολο" με +3€ αποστολή
(client-side μόνο, lib/pricing.js) ενώ η σελίδα παραγγελίας από κάτω
έδειχνε "Σύνολο" χωρίς αποστολή (order.subtotal) — δύο διαφορετικά
νούμερα στην ίδια διαδρομή, ακόμα κι αφού διορθώθηκε το ΦΠΑ breakdown.

**Fix:** αφαιρέθηκαν οι γραμμές "Έξοδα αποστολής"/"Τελικό σύνολο" από το
`CartRoute.jsx` — το "Σύνολο" εκεί είναι πλέον ακριβώς το `subtotal`
(καθαρή αξία + ΦΠΑ, ΧΩΡΙΣ αποστολή), ίδιο νούμερο με το
`OrderSummaryRoute.jsx`/`order.subtotal` σε κάθε βήμα του merch flow.
`lib/pricing.js`/`getOrderTotals()` ΔΕΝ αλλάζει — `shipping`/`grandTotal`
συνεχίζουν να υπολογίζονται (θα χρειαστούν όταν υπάρξει πραγματικό κόστος
αποστολής), απλά δεν εμφανίζονται πουθενά προς το παρόν.

Θα ξαναμπεί η γραμμή αποστολής σε ΚΑΙ τα δύο σημεία μαζί, μία φορά, όταν
κλείσει η συνεργασία courier (βλ. "BOX NOW/Skroutz Point" ενότητα).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — 401 σε cart_items: ίδιο "σπασμένο session" root cause, γενικεύτηκε το fix

**Αναφορά χρήστη:** 401 (Unauthorized) στο console, σε GET request προς
`cart_items`. Ίδιο ΑΚΡΙΒΩΣ root cause με το diagnosis της 18/9 (ληγμένο/
ήδη χρησιμοποιημένο refresh token σε αυτή τη συσκευή/browser) — απλά
εμφανίστηκε σε ΔΙΑΦΟΡΕΤΙΚΟ query (cart, μέσω `useCart.js`) από αυτό που
είχε διορθωθεί τότε (`sync_own_fan_from_auth`, μέσω `useFanSession.js`).

**Γιατί ξαναεμφανίστηκε:** το `isBrokenSessionError()`/local sign-out
recovery ζούσε ΜΟΝΟ μέσα στο `useFanSession.js` — έπιανε σπασμένο session
ΜΟΝΟ σε αυτό το ένα σημείο, όχι στα υπόλοιπα queries/mutations της
εφαρμογής (cart, favorites, orders, κ.λπ.). Δεν ήταν λάθος διόρθωση, απλά
πολύ στενή εμβέλεια.

**Fix, γενικευμένο:** `isBrokenSessionError()`/`recoverFromBrokenSession()`
μετακόμισαν σε κοινό αρχείο (`lib/authRecovery.js`). Το `main.jsx`
εφαρμόζει το recovery **κεντρικά**, μέσω `QueryCache`/`MutationCache`
`onError` στο `QueryClient` — ΚΑΘΕ query ή mutation στην εφαρμογή
αυτόματα κάνει local sign-out αν χτυπήσει έναν από τους γνωστούς κωδικούς
"άκυρο session" (`23503`, `23502`, `PGRST301`, `PGRST303`), όχι μόνο το
ένα σημείο που το είχαμε διορθώσει πριν. Το `useFanSession.js`
απλοποιήθηκε — δεν κάνει πια το δικό του, τοπικό check.

**Άμεσο fix για τον χρήστη (μη-κώδικας, ίδιο με 18/9):** logout/clear
cookies και ξανά-login καθαρίζει αμέσως το τρέχον μπαγιάτικο session σε
αυτή τη συσκευή.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — ProductOverviewRoute.jsx: ίδιο "γκρι πλαίσιο" ύφος σε όλη τη σελίδα

Ρητό αίτημα χρήστη, δύο γύροι: αρχικά μόνο γύρω από το "Μέγεθος" section
(ώστε τα ανοιχτόχρωμα pastel pill του `SizeSelector.jsx` να ξεχωρίζουν
όπως στο `ProductQuickShop.jsx` modal, όχι να "χάνονται" σε λευκό φόντο) —
μετά ζητήθηκε ολόκληρη η σελίδα προϊόντος (`/merch/overview/:slug`).

**Fix:** ίδιο, ήδη καθιερωμένο pattern με `MerchCategoriesRoute.jsx`/
`MerchCategoryRoute.jsx` (`rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200
sm:p-8`) γύρω από ΟΛΟ το περιεχόμενο (gallery + λεπτομέρειες) — όχι κάτι
νέο, αντιγραφή του υπάρχοντος μοτίβου. Το breadcrumb μένει ΕΞΩ από το γκρι
πλαίσιο, ίδιος κανόνας με τις άλλες σελίδες merch. Το fieldset "Μέγεθος"
άλλαξε από bg-gray-50 σε bg-white + shadow-2xl (λευκή κάρτα πάνω σε γκρι
πλαίσιο πλέον, ίδιο μοτίβο με τις κάρτες προϊόντων — αλλιώς θα ήταν γκρι
μέσα σε γκρι, αόρατο).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — ProductOverviewRoute.jsx: τα κουμπιά ενέργειας βγήκαν έξω από το γκρι πλαίσιο

Ρητό αίτημα χρήστη (screenshot σύγκρισης με το `ProductQuickShop.jsx`
modal, όπου το κουμπί "Πληρωμή" είναι sibling ΕΞΩ από το λευκό Card, όχι
εμφωλευμένο μέσα του): η σειρά κουμπιών ("Προσθήκη στο καλάθι" / αγαπημένα
/ κοινοποίηση, και "Ολοκλήρωση παραγγελίας") μετακινήθηκε από μέσα στη
στήλη λεπτομερειών (μέσα στο `rounded-2xl bg-gray-50 ...` γκρι πλαίσιο) σε
sibling ΜΕΤΑ το γκρι πλαίσιο, ακριβώς όπως στο modal.

**Fix:** το `<div className="mt-6 flex flex-col gap-2">` με τα κουμπιά
βγήκε από τη στήλη λεπτομερειών και το `lg:grid` layout, και μπήκε ως
sibling αμέσως μετά το κλείσιμο του γκρι πλαισίου, μέσα στο ίδιο
`mx-auto max-w-5xl` container (άρα ίδιο πλάτος σελίδας, απλά πλέον σε
λευκό φόντο κάτω από το πλαίσιο αντί για μέσα σε αυτό). Καμία αλλαγή στη
λογική των κουμπιών (disabled/onClick κ.λπ.) — μόνο θέση.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — CartRoute.jsx: ίδιο "γκρι πλαίσιο" ύφος με τις υπόλοιπες σελίδες merch

Ρητό αίτημα χρήστη (screenshot, "εδώ θέλω το ίδιο style όπως έκανες πριν"):
η σελίδα καλαθιού (`/merch/cart`) πήρε το ίδιο, ήδη καθιερωμένο
`rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8` πλαίσιο με
`MerchCategoriesRoute.jsx`/`MerchCategoryRoute.jsx`/`ProductOverviewRoute.jsx`
— γύρω από ΟΛΟ το περιεχόμενο (τίτλος "Το καλάθι σου" + λίστα προϊόντων +
"Σύνοψη παραγγελίας"), όχι κάτι νέο, αντιγραφή του ίδιου μοτίβου. Το
breadcrumb μένει ΕΞΩ από το γκρι πλαίσιο, ίδιος κανόνας παντού.

Η "Σύνοψη παραγγελίας" είχε ήδη δικό της `bg-gray-50` πλαίσιο — τώρα που η
γύρω σελίδα έγινε γκρι, θα ήταν γκρι μέσα σε γκρι (αόρατο περίγραμμα), οπότε
άλλαξε σε `bg-white` + `shadow-2xl` (λευκή κάρτα πάνω σε γκρι πλαίσιο, ίδιο
μοτίβο με το "Μέγεθος" fieldset στο `ProductOverviewRoute.jsx`).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — CartRoute.jsx: 5 μικρές βελτιώσεις, ρητό αίτημα χρήστη (screenshots)

1. **Bug, αργή απόκριση στο +/-**: γρήγορα διαδοχικά κλικ στο +/- έστελναν
   ΚΑΘΕ φορά δικό τους αίτημα στη βάση (RPC `adjust_cart_quantity`) —
   παράλληλα αιτήματα/refetches "τσακώνονταν" και η οθόνη καθυστερούσε.
   **Fix σε `useCart.js`**: η οθόνη ενημερώνεται πάντα ΑΜΕΣΩΣ/τοπικά σε
   κάθε κλικ (μηδενική καθυστέρηση, ίδιο πνεύμα με το τοπικό state του
   ProductOverviewRoute.jsx), αλλά το πραγματικό αίτημα προς τη βάση κάνει
   debounce 400ms — μαζεύει τα διαδοχικά clicks σε ΕΝΑ αίτημα με το
   άθροισμά τους.
2. **Ένδειξη διαθέσιμης ποσότητας**: δίπλα στο +/- κάθε προϊόντος πλέον
   φαίνεται πάντα "(Ν)" — ίδιο στυλ με το `SizeSelector.jsx`.
3. **Κλικ στη φωτογραφία προϊόντος** → πάει στο `ProductOverviewRoute`
   (`/merch/overview/:slug`), ίδιο URL με τις κάρτες στο `ProductList.jsx`.
4. **Τίτλος "Το καλάθι σου"**: κεντραρισμένος, με κάτω γραμμή — ίδιο μοτίβο
   με τον τίτλο κατηγορίας στο `MerchCategoryRoute.jsx`.
5. **"Άδειασμα καλαθιού"**: μετακόμισε από πάνω-δεξιά της λίστας σε κάτω
   από τη λίστα/πάνω από τη "Σύνοψη παραγγελίας", ως κυκλικό (rounded-full)
   κόκκινο κουμπί. Το `window.confirm` αντικαταστάθηκε από πραγματικό
   Dialog (ίδια primitives με το `CartDialog.jsx`) με ρητή προειδοποίηση
   πριν διαγραφούν όλα τα προϊόντα.

**ΣΗΜΕΙΩΣΗ**: το μικρό `CartDialog.jsx` (άνοιγμα από το εικονίδιο καλαθιού
στο header) συνεχίζει να χρησιμοποιεί `window.confirm` για το ίδιο
άδειασμα καλαθιού — δεν άλλαξε, δεν ζητήθηκε ρητά. Πες αν το θες ίδιο και
εκεί.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — CartRoute.jsx / useCart.js: η ΠΡΑΓΜΑΤΙΚΗ αιτία της αργής απόκρισης στο +/-

Το προηγούμενο fix (debounce στο δίκτυο) βοήθησε αλλά δεν έλυσε πλήρως το
πρόβλημα — ο χρήστης ξαναανέφερε ότι η απόκριση ΑΚΟΜΑ δεν ήταν αρκετά
γρήγορη. Βρέθηκε η πραγματική αιτία: το `useQuery` στο `useCart.js` ζει
στο cache-key `["cart", fanId, tenantId]`, αλλά το "άμεσο/τοπικό" update
μέσα στο `updateQuantity()` έγραφε σε `["cart", fanId]` — ΔΙΑΦΟΡΕΤΙΚΟ
κλειδί (το `setQueryData` χρειάζεται ΑΚΡΙΒΕΣ match, σε αντίθεση με το
`invalidateQueries` που κάνει prefix-match και γι' αυτό ΔΕΝ έδειχνε
σφάλμα). Άρα η "στιγμιαία" ενημέρωση έγραφε σε ένα cache entry που καμία
οθόνη δεν διάβαζε ποτέ — η οθόνη πάντα περίμενε το πραγματικό network
round-trip. Fix: `setQueryData(["cart", fanId, tenantId], ...)`, ΑΚΡΙΒΩΣ
το ίδιο κλειδί με το `useQuery`. Τώρα το +/- ενημερώνεται πραγματικά
στιγμιαία.

Μαζί, 3 ακόμα μικρές διορθώσεις στο `CartRoute.jsx` (ρητό αίτημα χρήστη,
screenshots):
- Το "(Ν)" (διαθέσιμη ποσότητα) μετακόμισε ΠΡΙΝ από το stepper αντί για
  μετά — ίδια σειρά/θέση με το `SizeSelector.jsx`.
- Το κουμπί "Άδειασμα καλαθιού" πήρε το κάδο εικονίδιο (δεξιά από το
  κείμενο) και κεντραρίστηκε πλήρως — τόσο το ίδιο το κουμπί μέσα στη
  σειρά του (`flex justify-center`), όσο και το περιεχόμενό του μέσα στο
  κουμπί (`inline-flex items-center justify-center`).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — CartRoute.jsx: γιατί "πηδούσαν" τα προϊόντα + ετικέτα "Διαθεσιμότητα"

Ρητή ερώτηση χρήστη (screenshot): "γιατί αλλάζουν θέση αυτά όταν φτάνει το
μέγιστο στην ποσότητα ο user;". Αιτία: το μήνυμα "Έχεις ήδη όλη τη
διαθέσιμη ποσότητα (Ν)." εμφανιζόταν/εξαφανιζόταν εντελώς (conditional
render) όταν ο fan έφτανε/έφευγε από το όριο — αυτό άλλαζε το ύψος ΤΟΥ
συγκεκριμένου `<li>`, οπότε όλα τα επόμενα προϊόντα της λίστας από κάτω
μετακινούνταν οπτικά (φυσιολογική συμπεριφορά του document flow, όχι bug
στα δεδομένα — απλά ενοχλητικό οπτικά).

**Fix:** το μήνυμα είναι πλέον ΠΑΝΤΑ στο DOM (σταθερό ύψος γραμμής), απλά
γίνεται `invisible` (καταλαμβάνει τον ίδιο χώρο, δεν φαίνεται) όταν δεν
ισχύει το όριο — καμία μετατόπιση πια στα υπόλοιπα προϊόντα.

Επίσης, ρητό αίτημα χρήστη: το "(Ν)" δίπλα στο stepper δεν εξηγούσε τι
ήταν — μπήκε μπροστά η λέξη "Διαθεσιμότητα" ("Διαθεσιμότητα (5)").

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — "Μη διαθέσιμο" vs "Εξαντλημένο" + προσωρινό 1λεπτο hold (test)

Ρητή παρατήρηση χρήστη (screenshot, "Επίθεση (βινύλιο)" έδειχνε
"Εξαντλημένο"): σωστό στα δεδομένα (το `stock_quantity` ΕΙΝΑΙ μηδέν), αλλά
παραπλανητικό στη λέξη — το μηδέν οφειλόταν σε ΕΝΕΡΓΟ 10λεπτο hold ενός
άλλου fan (μέσα στο παράθυρο να πληρώσει), ΟΧΙ σε πραγματική πώληση. Αφού
το Stripe integration δεν υπάρχει ακόμα, ΚΑΝΕΝΑ order δεν φτάνει σήμερα σε
status='completed' — άρα κάθε "μηδέν" αυτή τη στιγμή είναι ΠΑΝΤΑ προσωρινό
hold, ποτέ πραγματική πώληση.

**Backend (2 νέα migrations):**
- `20260919090100_add_active_stock_holds_rpc.sql`: νέο SECURITY DEFINER RPC
  `get_active_stock_holds(p_tenant_id)` — επιστρέφει ΜΟΝΟ ανώνυμα
  αθροίσματα (product_id/variant_id/held_qty) από ενεργά (pending, μη
  ληγμένα) order_items, ΚΑΜΙΑ αναφορά σε ποιος/fan_id/order_id. Δημόσιο
  (anon + authenticated), ίδιο μοτίβο ασφάλειας με τα υπόλοιπα RPC.
- `20260919090000_temp_1min_hold_for_testing.sql`: **ΠΡΟΣΩΡΙΝΟ, ΜΟΝΟ για
  δοκιμή** — `create_order_from_cart` interval `10 minutes` -> `1 minute`,
  ρητό αίτημα χρήστη, ώστε να δει ζωντανά την επιστροφή διαθεσιμότητας.
  ⚠️ **ΠΡΕΠΕΙ να γυρίσει πίσω σε 10 λεπτά πριν πάει σε πραγματικούς
  χρήστες** — θα το θυμίσω όταν ξαναμιλήσουμε Stripe. Το pg_cron
  (`expire-stale-orders`) ήδη τρέχει κάθε λεπτό, καμία αλλαγή χρειάστηκε
  εκεί.

**Frontend:**
- `lib/stockTiers.js`: `getStockTier(quantity, hasActiveHold)` — νέο,
  προαιρετικό 2ο όρισμα. Όταν `quantity <= 0` ΚΑΙ `hasActiveHold=true`,
  γκρι tier "Μη διαθέσιμο" αντί για κόκκινο "Εξαντλημένο". Η δυνατότητα
  αγοράς ΔΕΝ αλλάζει (παραμένει disabled) — αλλάζει ΜΟΝΟ η ετικέτα/χρώμα.
- Νέο `queries/useActiveStockHolds.js`: διαβάζει το RPC, `refetchInterval:
  15000` (τα holds λήγουν μόνα τους χωρίς ενέργεια του fan στην ίδια
  οθόνη), επιστρέφει `heldProductIds`/`heldVariantIds` (Sets, για γρήγορο
  lookup).
- `StockBadge.jsx`: νέο προαιρετικό `hasActiveHold` prop.
- `SizeSelector.jsx`: νέο προαιρετικό `heldVariantIds` prop (Set).
- Ενημερώθηκαν όλα τα call sites: `ProductList.jsx` (κάρτα grid),
  `ProductOverviewRoute.jsx`, `ProductQuickShop.jsx` (και τα δύο badge ΚΑΙ
  SizeSelector).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — bug: ο αριθμός stock έμενε "παγωμένος" μετά τη λήξη hold

Ρητή αναφορά χρήστη (screenshot): πέρασε το 1λεπτο test-hold, η ετικέτα
σωστά ξαναγύρισε σε "Διαθέσιμα", αλλά ο ΙΔΙΟΣ ο αριθμός (π.χ. "(9)" αντί
για το πραγματικό "10") έμενε στην παλιά τιμή — μόνο πλήρες page refresh
έδειχνε το σωστό νούμερο.

**Αιτία:** το `useActiveStockHolds.js` (η ετικέτα "Μη διαθέσιμο"/
"Διαθέσιμα") είχε `refetchInterval: 15000`, αλλά το `useProducts.js` (η
ΠΗΓΗ του ίδιου του αριθμού `stock_quantity`) δεν είχε ΚΑΝΕΝΑ — ξανακαλούσε
τη βάση μόνο σε mount/window-focus (React Query default), όχι μόνο του.
Έτσι η ετικέτα (σωστή, ζωντανή) και ο αριθμός (παγωμένος) μπορούσαν να
δείχνουν ασύγχρονα πράγματα.

**Fix:** ίδιο `refetchInterval: 15000` και στο `useProducts.js` — τώρα ο
αριθμός ΚΑΙ η ετικέτα ενημερώνονται πάντα μαζί, στο ίδιο interval. Το
`useMerchCategories.js`/`ProductList.jsx`/`ProductOverviewRoute.jsx`
μοιράζονται όλα το ίδιο `useProducts(tenantId)` query-key, οπότε το fix
καλύπτει αυτόματα ΟΛΕΣ τις σελίδες merch, όχι μόνο μία.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 19/9 — bug: στιγμιαίο λάθος "Εξαντλημένο" ανάμεσα σε "Μη διαθέσιμο" και "Διαθέσιμα"

Ρητή αναφορά χρήστη (screenshot + observed timing): κατά τη διάρκεια του
(test) 1λεπτου hold σωστά έδειχνε "Μη διαθέσιμο" -- αλλά ΜΟΛΙΣ πέρασε το 1
λεπτό, έδειξε για λίγο "Εξαντλημένο" (κόκκινο) πριν ξαναγίνει "Διαθέσιμα",
αντί να πάει κατευθείαν "Μη διαθέσιμο" -> "Διαθέσιμα".

**Αιτία:** το `get_active_stock_holds` (migration 20260919090100)
φιλτράριζε με `expires_at > now()` -- "μόνο holds που δεν έχουν ΑΚΟΜΑ λήξει
βάσει ρολογιού". Το pg_cron (`expire_stale_orders`) όμως τρέχει μόνο μία
φορά το λεπτό -- υπάρχει φυσιολογικό κενό (έως ~60 δευτ.) ανάμεσα στη
στιγμή που περνάει το `expires_at` ΚΑΙ στη στιγμή που ο cron πραγματικά
τρέχει και επαναφέρει το stock. Μέσα σε αυτό το κενό το order είναι ΑΚΟΜΑ
`pending` και το stock ΑΚΟΜΑ μηδέν -- αλλά το RPC δεν το μετρούσε πια ως
"ενεργό hold" (`expires_at` είχε περάσει), οπότε το frontend έβλεπε μηδέν
ΧΩΡΙΣ καμία εξήγηση -> "Εξαντλημένο" λανθασμένα, μέχρι τον επόμενο cron tick.

**Fix** (migration `20260919091000_fix_active_stock_holds_cron_gap.sql`):
αφαιρέθηκε η συνθήκη `expires_at > now()`. Όσο το order παραμένει
`status='pending'` (ο cron αλλάζει status ΚΑΙ επαναφέρει stock ΜΕΣΑ στην
ΙΔΙΑ function call), το stock ΔΕΝ έχει ακόμα πραγματικά επιστραφεί, άρα
ΠΡΕΠΕΙ να μετράει ως ενεργό hold -- καμία πια ασυμφωνία/ενδιάμεσο
"Εξαντλημένο". Frontend: καμία αλλαγή χρειάστηκε, μόνο η SQL συνθήκη.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 20/9 — bug: sticky MerchBreadcrumb δεν πατιόταν σε scroll (κάτω από ConcertoBar)

Ρητή αναφορά χρήστη (screenshots): στη σελίδα κατηγορίας merch ("New
Arrivals"), όταν ο χρήστης είχε κάνει scroll αρκετά κάτω ώστε το sticky
breadcrumb pill να "κολλήσει" στην κορυφή, το πάτημα πάνω στο "Merch
Store" (για επιστροφή στις κατηγορίες) δεν δούλευε καθόλου -- μόνο αν
γύριζε πίσω στην αρχική θέση της σελίδας. Ο χρήστης ρητά ζήτησε
επιβεβαίωση ότι δεν χάλασε κάτι από πρόσφατη αλλαγή αυτής της
συνεδρίας.

**Επιβεβαιώθηκε via `git log`** ότι ΟΥΤΕ το `ConcertoBar.jsx` ΟΥΤΕ το
`MerchBreadcrumb.jsx` είχαν αγγιχτεί στη σημερινή συνεδρία -- προϋπήρχε
από το redesign του `ConcertoBar.jsx` σε προηγούμενη συνεδρία (commit
`f71845b`), απλά δεν είχε φανεί μέχρι τώρα (χρειάζεται συγκεκριμένο
συνδυασμό scroll + merch σελίδα).

**Αιτία:** το `ConcertoBar.jsx` είναι `fixed inset-x-0 top-4 z-40` --
καλύπτει ΟΛΟ το πλάτος της οθόνης σε μια λωρίδα, ΑΚΟΜΑ και στις διάφανες
περιοχές του (π.χ. το κενό logo<->avatar). Το `MerchBreadcrumb.jsx` είναι
`sticky top-0 z-20` -- χαμηλότερο z-index. Μόλις το sticky breadcrumb
"κολλήσει" στην κορυφή και μπει στην ίδια λωρίδα με το ConcertoBar, το
ConcertoBar (z-40 > z-20) έκλεβε το click πριν φτάσει στο breadcrumb από
κάτω.

**Fix** (`ConcertoBar.jsx` μόνο, ΚΑΜΙΑ αλλαγή στο `MerchBreadcrumb.jsx`):
`pointer-events-none` σε όλο το `<header>` + `pointer-events-auto` ρητά
ΜΟΝΟ στα δύο πραγματικά interactive στοιχεία μέσα του (avatar/κουμπί
λογαριασμού, κουμπί "Σύνδεση"). Το `ConcertoAuthDialog`/
`DeleteAccountDialog`/`DropdownMenuContent` δεν επηρεάζονται -- Radix τα
κάνει portal σε `document.body`, εκτός του `<header>` subtree.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19/1).

## 20/9 — "Πρόσθεσε προϊόν": ο tenant admin προσθέτει/επεξεργάζεται/διαγράφει merch προϊόντα από το ίδιο το site

Ρητό αίτημα χρήστη: μέχρι τώρα κάθε νέο merch προϊόν έμπαινε χειροκίνητα
μέσα από το Supabase table editor. Νέο κουμπί "Πρόσθεσε προϊόν" στο Merch
Store (`CategoryGrid.jsx`, ΜΟΝΟ σε `isAdmin` -- ίδιο ΑΚΡΙΒΩΣ μοτίβο/θέση
με το ήδη υπάρχον "Προσθήκη event" στο `EventsRoute.jsx`) ανοίγει
πραγματική σελίδα (`merch/product/new`, flat sibling route -- ίδιο μοτίβο
με `events/event/new`) με πλήρη φόρμα: όνομα, περιγραφή, κατηγορία
(Ρουχισμός/CD & Βινύλια/Διάφορα -- ΟΧΙ "New Arrivals", αυτό υπολογίζεται
αυτόματα από `created_at`, δεν είναι πραγματική επιλέξιμη κατηγορία),
τιμή, απόθεμα (απλό νούμερο, ή γραμμές ανά μέγεθος S/M/L/XL για
"Ρουχισμός" -- ίδιο μοτίβο με τα `tickets` field-array στο
`EventFormPage.jsx`), πολλαπλές φωτογραφίες.

Επεξεργασία: `merch/product/:productId/edit` (ίδιο component,
`ProductFormPage.jsx`, με `product` prop). Διαγραφή: κόκκινος κάδος
(`DeleteProductDialog.jsx`, modal επιβεβαίωσης) ΚΑΙ πάνω σε κάθε κάρτα
προϊόντος στο grid (`ProductList.jsx`, κάτω-αριστερά στην εικόνα, μαζί με
μολύβι επεξεργασίας) ΚΑΙ μέσα στην ίδια τη σελίδα προϊόντος
(`ProductOverviewRoute.jsx`, δίπλα σε favorite/share -- ρητό αίτημα
χρήστη "και τα δύο").

**Ασφάλεια** (migration `20260920080000_add_products_admin_write.sql`,
ΙΔΙΟ ΑΚΡΙΒΩΣ μηχανισμό με events/tickets): RLS insert/update/delete στο
`products` + `product_variants`, μόνο για πραγματικό admin ΤΟΥ
συγκεκριμένου tenant (`tenant_admins`). Route guard (`ProductFormRoute.jsx`)
επιπλέον, για UX -- η πραγματική ασφάλεια είναι πάντα το RLS.

**Εικόνες:** ΚΑΝΕΝΑ νέο storage bucket -- ξαναχρησιμοποιεί το ήδη
υπάρχον `tenant-images` bucket με path `<tenant_id>/products/...` (η
storage RLS εκεί ελέγχει μόνο το πρώτο folder = tenant_id, δουλεύει ήδη
σωστά για οποιοδήποτε sub-path).

**Slug:** ΚΑΘΟΛΟΥ δεν στέλνεται από το frontend -- υπάρχει ήδη αυτόματο
DB trigger (`set_product_slug`, migration `20260906075738`) που το
παράγει από το `name`, με μοναδικότητα ανά tenant.

**Διαγραφή προϊόντος με ήδη υπάρχουσες παραγγελίες:** ΔΕΝ διαγράφουμε
ποτέ σιωπηλά `order_items` (ιστορικό παραγγελιών/τιμών). Το
`useDeleteProduct.js` σβήνει μόνο `cart_items` (ενεργά καλάθια, ασφαλές)
πριν το `products` -- αν υπάρχουν ήδη `order_items`, το DELETE στο
`products` αποτυγχάνει (foreign key, code `23503`) και το
`DeleteProductDialog.jsx` δείχνει φιλικό μήνυμα αντί για το ωμό Postgres
error. `product_variants` φεύγουν αυτόματα (`on delete cascade`, ήδη
υπήρχε).

✅ **Migration `20260920080000_add_products_admin_write.sql` επιβεβαιωμένο
ΤΡΕΞΕ στη ζωντανή βάση** (20/9, επιβεβαιώθηκε με `select policyname, cmd
from pg_policies where tablename in ('products','product_variants')` --
8 policies συνολικά, INSERT/UPDATE/DELETE για tenant admins + SELECT
δημόσιο σε ΚΑΘΕ table, ακριβώς όπως αναμενόταν).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19 errors/1 warning βάση +
1 ακόμα warning, ίδιας ακριβώς φύσης με το ήδη υπάρχον στο
`EventFormPage.jsx` line 495 -- `watch()` μέσα σε per-row Combobox, το
React Compiler προειδοποιεί σε ΚΑΘΕ τέτοια χρήση σε όλο το project, όχι
κάτι νέο/σπασμένο).

## 20/9 — "Πρόσθεσε προϊόν" #2: χειροκίνητο New Arrivals + προγραμματισμένη διαθεσιμότητα

Ρητό αίτημα χρήστη, δύο ακόμα επιλογές μέσα στη φόρμα προϊόντος
(`ProductFormPage.jsx`):

**1) "Να εμφανίζεται και στα New Arrivals"** — checkbox, νέα στήλη
`products.is_new_arrival` (boolean, default false). Μέχρι τώρα το "New
Arrivals" ήταν ΑΠΟΚΛΕΙΣΤΙΚΑ αυτόματο (`created_at` μέσα στους τελευταίους
6 μήνες, `hooks/useMerchCategories.js`) — τώρα ο admin μπορεί να το
τσεκάρει χειροκίνητα, ανεξάρτητα από πότε καταχωρήθηκε πραγματικά. Filter
έγινε `p.is_new_arrival || <παλιά συνθήκη ημερομηνίας>` — πλήρως backward
compatible, όλα τα ήδη υπάρχοντα προϊόντα έχουν `is_new_arrival=false`.

**2) Προγραμματισμένη διαθεσιμότητα** — νέα στήλη
`products.available_from` (timestamptz, nullable — NULL = διαθέσιμο
αμέσως, όπως σήμερα, καμία αλλαγή για ήδη υπάρχοντα προϊόντα). Ο admin
μπορεί να καταχωρήσει το προϊόν ΜΕ τις πραγματικές του ποσότητες πριν
"ανοίξει" η πώληση — ρητή απαίτηση χρήστη: **"να εμφανίζεται κανονικά"**
το προϊόν στο κατάστημα από τώρα (ΔΕΝ κρύβεται), αλλά να μην μπορεί να
μπει στο καλάθι μέχρι εκείνη την ημερομηνία/ώρα, και **"να αλλάζει
αυτόματα... να μην ξανασχολείται ο admin"** μόλις περάσει.

**Σκόπιμα ΚΑΜΙΑ server-side/cron λογική εδώ** — ούτε δεύτερο pg_cron
job, ούτε boolean flag που κάτι πρέπει να "γυρίσει" τη σωστή στιγμή. Το
ίδιο το session είχε ήδη δείξει (bug `20260919091000`, το κενό ~60 δευτ.
ανάμεσα σε `expires_at` και το επόμενο cron tick) ότι stored state που
πρέπει να "προλάβει" ρολόι είναι εύθραυστο. Αντ' αυτού: η διαθεσιμότητα
υπολογίζεται ΖΩΝΤΑΝΑ σε κάθε render/refetch
(`lib/stockTiers.js#isScheduledUnavailable`: `available_from` vs
`Date.now()`) — το ήδη υπάρχον `refetchInterval: 15000` στο
`useProducts.js` κάνει το "αυτόματα" να δουλεύει μόνο του, μηδέν νέο
background job.

Νέο, τρίτο tier σε `getStockTier()` (μαζί με "Διαθέσιμα"/"Εξαντλημένο"/
"Μη διαθέσιμο"): "Διαθέσιμο από [ημ/νία ώρα]" (μπλε, ΟΧΙ κόκκινο — δεν
είναι sold out, υπάρχει πραγματικό απόθεμα), με απόλυτη προτεραιότητα
έναντι quantity/hold. Εφαρμόζεται ΚΑΙ στο συνολικό badge ΚΑΙ σε κάθε
pill μεγέθους (`SizeSelector.jsx`, νέο `scheduledFrom` prop) — όχι μόνο
στην κορυφή της σελίδας. Gating του "πόσο χωράει να προστεθεί" γίνεται
στο ΙΔΙΟ σημείο που ήδη υπολόγιζε το πραγματικό όριο
(`simpleMaxAddable`/`maxByVariant`, σε `ProductOverviewRoute.jsx` ΚΑΙ
`ProductQuickShop.jsx`) — μηδενίζεται όσο `isScheduledUnavailable`.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19 errors baseline + 2
warnings — ίδιας ακριβώς φύσης με το ήδη υπάρχον στο EventFormPage.jsx,
τίποτα νέο/σπασμένο).

⚠️ **Νέο migration να τρέξει στο Supabase SQL editor:**
`20260920090000_add_products_scheduling.sql` (προσθέτει τις δύο στήλες,
πλήρως backward compatible — καμία αλλαγή σε ήδη υπάρχοντα προϊόντα).

## 20/9 — "Πρόσθεσε προϊόν" #3: 24ωρη ώρα + live αυτόματο refresh (χωρίς extra φόρτο)

Δύο ρητά bug reports του χρήστη μετά από ζωντανό test του παραπάνω
feature:

**1) Ώρα σε 24ωρη μορφή, χωρίς AM/PM.** Το native
`<input type="datetime-local">` στο `ProductFormPage.jsx` έδειχνε
AM/PM ανάλογα με τις ρυθμίσεις browser/OS. Λύση: ΑΚΡΙΒΩΣ το ίδιο,
ήδη δοκιμασμένο πρότυπο του `EventFormPage.jsx` — χωρισμός σε δύο
ξεχωριστά πεδία, native `type="date"` (χωρίς πρόβλημα) + text input
με `inputMode="numeric"`, `maxLength={5}`, αυτόματο `:` μετά το 2ο
ψηφίο, και αυστηρό zod regex `^([01]\d|2[0-3]):[0-5]\d$` σαν τελικό
δίχτυ ασφαλείας. Τα δύο πεδία (`available_date`/`available_time`)
συνδυάζονται σε ISO timestamp ΜΟΝΟ κατά το submit
(`new Date(\`${date}T${time}\`).toISOString()`), ακριβώς όπως τα
events. Νέος έλεγχος στο `productFormSchema.js`
(`superRefine`): αν συμπληρωθεί μόνο το ένα από τα δύο πεδία, error
μήνυμα να συμπληρωθεί και το άλλο.

**2) Χρειαζόταν χειροκίνητο refresh για να φανεί "διαθέσιμο".** Ρητό
αίτημα χρήστη να εξεταστεί το κόστος πριν εφαρμοστεί λύση ("αν
βαραίνουμε το app... πες μου για να πάρω την απόφαση εγώ"). Η
πραγματική αιτία ΔΕΝ ήταν stale data — το `refetchInterval: 15000`
στο `useProducts.js` έκανε ήδη σωστά refetch κάθε 15". Το πρόβλημα
ήταν React Query's `structuralSharing`: όταν το refetch φέρνει
ΑΚΡΙΒΩΣ τα ίδια τιμές (τίποτα δεν άλλαξε στη βάση, μόνο το ρολόι
προχωράει), κρατάει το ΙΔΙΟ object reference για να αποφύγει άσκοπα
re-renders — άρα τα components που υπολογίζουν
`isScheduledUnavailable()` δεν ξανατρέχουν ποτέ τον υπολογισμό με
φρέσκια ώρα, μέχρι να γίνει πλήρες mount (γι' αυτό το "δούλευε" μόνο
με F5).

Λύση: νέο `hooks/useNow.js` — ένα καθαρά τοπικό `setInterval` (κάθε
20") που απλά αναγκάζει re-render στα components που το καλούν,
ΧΩΡΙΣ καμία επιπλέον κλήση δικτύου/Supabase. Καλείται με `useNow(20000)`
σε `ProductOverviewRoute.jsx`, `ProductQuickShop.jsx`,
`ProductList.jsx` (όπου εμφανίζεται `scheduledFrom`-aware UI).
**Μηδενικό επιπλέον φορτίο** — ούτε ένα extra query στη βάση, ούτε πιο
συχνό polling· απλά ο ήδη υπάρχων μηχανισμός (15" refetch) συνδυάζεται
τώρα με ένα local "τικ ρολογιού" που κάνει τα ήδη σωστά δεδομένα να
ξαναδείχνονται σωστά χωρίς F5.

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19 errors baseline +
2 warnings, ίδιας φύσης με πριν — το ένα νέο warning στο
`ProductFormPage.jsx` είναι το ίδιο γνωστό "React Compiler +
`watch()`" pattern που υπάρχει ήδη στο `EventFormPage.jsx`).

Καμία νέα migration αυτόν τον γύρο — και οι δύο διορθώσεις είναι
αμιγώς frontend, καμία αλλαγή σχήματος βάσης.

## 20/9 — "New" tab: instagram-stories στυλ αναρτήσεις (φωτογραφία/video)

Ρητό αίτημα χρήστη, νέα ενότητα: κάθε tenant παίρνει τέταρτο tab ("New",
δίπλα σε Πληροφορίες/Εκδηλώσεις/Merch Store) όπου ο tenant admin ανεβάζει
ΕΙΤΕ φωτογραφία ΕΙΤΕ video (ρητή απόφαση χρήστη — ΠΟΤΕ και τα δύο μαζί
στην ίδια ανάρτηση), π.χ. "πάμε live σε 1 ώρα" πριν ανέβει η μπάντα στη
σκηνή. Οι fans βλέπουν feed και μπορούν ΜΟΝΟ να κάνουν like — καμία
δυνατότητα σχολίου/απάντησης.

**Λήξη — ΜΟΝΙΜΗ διαγραφή, ρητή απόφαση χρήστη.** Ο admin διαλέγει
διάρκεια κατά την ανάρτηση (3/6/12/24/48 ώρες, dropdown στο
`NewPostDialog.jsx`) και η ανάρτηση διαγράφεται ΠΛΗΡΩΣ (όχι απλή
απόκρυψη/φιλτράρισμα) μόλις περάσει — ίδια φιλοσοφία με το ήδη υπάρχον
`expire_stale_orders`, αλλά με ένα επιπλέον, σημαντικό τεχνικό βήμα: το
`expire_tenant_posts()` (migration `20260920100000_add_tenant_posts.sql`)
χρησιμοποιεί το `pg_net` extension για να καλέσει το ΠΡΑΓΜΑΤΙΚΟ Supabase
Storage HTTP API (`DELETE /storage/v1/object/tenant-posts/<path>`) ΠΡΙΝ
σβήσει τη γραμμή — μια απλή SQL διαγραφή πάνω στο `storage.objects` θα
άφηνε το πραγματικό αρχείο "ορφανό" στο backend για πάντα (συνεχίζει να
μετράει storage/κόστος, ειδικά κρίσιμο για video). Αυτό συζητήθηκε ρητά
με τον χρήστη ως τεχνικό trade-off πριν χτιστεί — επέλεξε το πλήρως
αυτόματο pg_net + Vault, όχι το χειροκίνητο καθάρισμα.

⚠️ **Vault secrets, ΧΕΙΡΟΚΙΝΗΤΟ ΒΗΜΑ ΤΟΥ ΧΡΗΣΤΗ, ΠΟΤΕ μέσω chat/AI**
(το service_role key παρακάμπτει ΚΑΘΕ RLS — το πιο ευαίσθητο credential
του project, γι' αυτό ΔΕΝ το ζήτησα/το είδα ποτέ):

1. Database → Extensions → ενεργοποίησε `pg_net` (αν δεν ενεργοποιήθηκε
   ήδη από το `create extension if not exists pg_net;` μέσα στο migration).
2. Στο SQL editor, ξεχωριστά:
   `select vault.create_secret('https://<project-ref>.supabase.co', 'concerto_project_url', '...')`
3. Στο SQL editor, ξεχωριστά:
   `select vault.create_secret('<το service_role key σου>', 'concerto_service_role_key', '...')`

Μέχρι να τρέξουν τα 2)/3), οι αναρτήσεις ΔΕΝ διαγράφονται καθόλου (ασφαλές
σχεδιασμένο fallback — η function επιστρέφει αθόρυβα χωρίς να σβήσει
τίποτα αν λείπουν τα secrets, βλ. σχόλια στο migration) — απλά
συσσωρεύονται. Θα φανεί γρήγορα σε δοκιμαστική ανάρτηση 3 ωρών που δεν
εξαφανίζεται.

**Νέο, ξεχωριστό storage bucket `tenant-posts`** (ΟΧΙ το ήδη υπάρχον
`tenant-images`) — 25MB όριο, δέχεται εικόνα ΚΑΙ video mime types,
εντελώς διαφορετικός κύκλος ζωής (αυτόματη μόνιμη διαγραφή, το
tenant-images ΠΟΤΕ). Ίδιο RLS μηχανισμό με tenant-images (`tenant_admins`,
πρώτο folder = tenant_id).

**Φωτογραφία:** συμπιέζεται ΣΤΟΝ BROWSER πριν το upload (νέο
`lib/compressImage.js`, canvas resize σε max 1920px στη μεγάλη πλευρά +
JPEG quality 0.82, καμία νέα βιβλιοθήκη) — μια σύγχρονη φωτογραφία
κινητού είναι συχνά 4000×3000px/αρκετά MB, απαράδεκτο να ανέβει ωμή.

**Video:** ΔΕΝ συμπιέζεται (ρητά αναγνωρισμένο στη συζήτηση με τον
χρήστη — δεν υπάρχει απλός, ελαφρύς client-side τρόπος σαν το canvas
resize της φωτογραφίας). Αντ' αυτού, νέο `lib/checkVideoDuration.js`
διαβάζει τη διάρκεια (hidden `<video>` element, `loadedmetadata`) ΠΡΙΝ
καν ξεκινήσει το upload — απορρίπτεται με μήνυμα αν ξεπερνάει τα 20"
(ρητό όριο χρήστη), ΔΕΝ ανεβαίνει καθόλου. 25MB file size cap ελέγχεται
ΚΑΙ client-side (γρήγορο feedback) ΚΑΙ server-side (bucket
`file_size_limit`, defense in depth ίδιο μοτίβο με tenant-images).

**Νέος φάκελος** `components/News/` (ίδιο επίπεδο με About/Merch/Events):
`NewsRoute.jsx` (feed + admin "Νέα ανάρτηση" button, ίδιο layout μοτίβο
με `EventsRoute.jsx`), `PostCard.jsx` (media + like button/count + σχετική
ώρα ανάρτησης), `NewPostDialog.jsx` (admin-only φόρμα: ToggleGroup
Φωτογραφία/Video, file input με dynamic `accept`, Select διάρκειας,
προαιρετική λεζάντα — ίδιο επίπεδο πολυπλοκότητας/useState μοτίβο με
`EditCoverImageDialog.jsx`, όχι react-hook-form/zod, δεν χρειαζόταν εδώ).

**Route:** `/news`, flat sibling μέσα στο `TenantLayout`, ίδιο μοτίβο με
τα άλλα τρία tabs (βλ. `main.jsx`). **Header.jsx:** `TABS` array πήρε
τέταρτο στοιχείο ("New"), `activeTab`/`handleTabClick` πήραν νέο branch,
`grid-cols-3` → `grid-cols-4` κάτω από τα tab buttons.

**Νέα query hooks** (`queries/`): `useTenantPosts.js` (feed, embed
`tenant_post_likes(fan_id)` για like_count/isLiked χωρίς ξεχωριστή
κλήση, `refetchInterval: 15000` ίδιο με `useProducts.js`, ΚΑΙ
client-side φιλτράρισμα `expires_at > now()` ως δεύτερη γραμμή άμυνας
για το <60" παράθυρο ανάμεσα σε λήξη και το επόμενο cron tick — ίδιο
μάθημα με το bug `20260919091000` στα stock holds), `useCreateTenantPost.js`
(upload + insert, compress/duration-check πριν το upload), 
`useToggleTenantPostLike.js` (ίδιο toggle μοτίβο insert/delete με
`useFavorites.js`).

`npx eslint .` επιβεβαιώθηκε αμετάβλητο (19 errors/2 warnings βάση,
καμία παλινδρόμηση — κανένα από τα νέα αρχεία δεν εμφανίζεται στη λίστα
σφαλμάτων).

⚠️ **Migration `20260920100000_add_tenant_posts.sql` να τρέξει στο
Supabase SQL editor**, ΚΑΙ τα δύο `vault.create_secret` βήματα παραπάνω
(#2/#3) — χωρίς αυτά, το "New" tab δουλεύει κανονικά (upload/feed/like)
αλλά ΔΕΝ διαγράφει ποτέ τίποτα.

## 20/9, βραδινό — Backlog / ανοιχτά νήματα (ΔΕΝ έχουν χτιστεί ακόμα)

Ρητό αίτημα χρήστη: σημείωση ανοιχτών θεμάτων που συζητήθηκαν αλλά δεν
προχωρήσαμε σήμερα (χρήστης κουρασμένος, θα συνεχίσουμε άλλη φορά) —
ΚΑΝΕΝΑ από τα παρακάτω δεν είναι χτισμένο, μόνο σημειωμένο ώστε να μην
χαθεί.

1. **Netlify — πραγματικό wildcard subdomain σε production** (π.χ.
   `<tenant>.concerto.gr` ζωντανά, όχι μόνο τοπικά μέσω `/etc/hosts` —
   βλ. ήδη υπάρχουσα σημείωση γραμμή ~1133 για το τοπικό setup). Λόγος
   που το θέλει ο χρήστης ΤΩΡΑ: να μπορεί να δοκιμάσει/δει ζωντανά
   πράγματα που θα μπορούν να κάνουν οι fans μεταξύ τους ΚΑΙ με τις
   μπάντες (βλ. σημείο 2 παρακάτω) — χρειάζεται πραγματικό, προσβάσιμο
   URL ανά tenant για ρεαλιστικό testing, όχι μόνο ένα deployed URL.
   Ήδη υπάρχει έρευνα Netlify vs Cloudflare Pages vs Vercel από
   νωρίτερα στη συνεδρία (σύσταση: μείνε Netlify προς το παρόν).

2. **Λίστα νέων "social" features μεταξύ fans, και μεταξύ fans/μπάντων**
   — ιδέα ρίχτηκε, ΔΕΝ έχει καταγραφεί ακόμα συγκεκριμένη λίστα. Να
   συζητηθεί/καταγραφεί σε επόμενη συνεδρία, πέρα από το ήδη υπάρχον
   like-only στο "New" tab.

3. **Βελτιώσεις στο ήδη υπάρχον "New" tab**, με βάση ό,τι θα προκύψει
   από το ζωντανό test του χρήστη (φωτογραφία/video, 3ωρη δοκιμαστική
   ανάρτηση σε εξέλιξη — βλ. ενότητα ακριβώς πάνω). Καμία συγκεκριμένη
   λεπτομέρεια ακόμα, θα προστεθεί μόλις ο χρήστης πει τι τον
   προβλημάτισε.

4. **Μελλοντικό ξαναχτίσιμο του Concerto σε Next.js** — ρητή πρόθεση
   χρήστη ("μετά να ξεκινήσουμε να κάνουμε το Concerto με Next"), ΑΦΟΥ
   ολοκληρωθούν τα παραπάνω. Καμία υλοποίηση ακόμα, ΑΛΛΑ μία αρχιτεκτονική
   απόφαση ήδη συζητήθηκε και συμφωνήθηκε με τον χρήστη, ΝΑ ΘΥΜΗΘΕΙ το
   AI assistant όταν ξεκινήσει πραγματικά αυτό το κομμάτι:
   - **ΜΕΣΑ στο ίδιο repo/φάκελο** (`Concerto/`), ΟΧΙ νέο ξεχωριστό project
     από την αρχή.
   - Νέο app μέσα στο ήδη υπάρχον npm workspaces monorepo, π.χ.
     `apps/tenant-site-next/`, ΔΙΠΛΑ στο ήδη υπάρχον `apps/tenant-site`
     (ΟΧΙ αντικατάσταση αμέσως) — ώστε να χτίζεται/δοκιμάζεται σταδιακά
     χωρίς διακοπή στο ήδη live site.
   - Ξαναχρησιμοποιεί `packages/shared` (π.χ. το κοινό Supabase client
     wrapper) ΚΑΙ ολόκληρο το `supabase/migrations` ως ενιαίο σημείο
     αλήθειας για το schema — το Next.js είναι ΜΟΝΟ νέο frontend πάνω
     στο ίδιο backend, καμία αλλαγή στη βάση χρειάζεται γι' αυτό καθαυτό
     το migration στοίβας.
   - Netlify build/publish config θα χρειαστεί ενημέρωση όταν
     αποφασιστεί το cutover — λεπτομέρεια για τότε, όχι τώρα.

## 20/9, βραδινό #2 — Σημείωση: αρχιτεκτονική/κόστος για scale (ΔΕΝ χρειάζεται τώρα)

Ρητή συζήτηση χρήστη για το αν το Netlify+Supabase setup αντέχει σε πολύ
μεγάλη κλίμακα (ρητό παράδειγμα: 120.000 **ταυτόχρονους** χρήστες) — ΔΕΝ
είναι σημερινή ανάγκη, μόνο προβληματισμός/σχεδιασμός για το μέλλον.
Καταγράφεται εδώ ώστε να μην χρειαστεί να ξαναγίνει η ίδια συζήτηση από
την αρχή.

**Συμπέρασμα:** εφικτό, ΔΕΝ χρειάζεται server με PHP/δικό του
disk-RAM-CPU (Netlify = στατικό hosting μέσω CDN, Supabase = ήδη
διαχειριζόμενος Postgres — αυτό αντικαθιστά πλήρως ένα παραδοσιακό
VPS/shared hosting). Για emails σε fans (παραγγελίες κ.λπ.): ΟΧΙ PHP,
μία μικρή serverless function (Supabase Edge Function ή Netlify
Function) + email API (π.χ. Resend) — ήδη προγραμματισμένο να χτιστεί
ΜΑΖΙ με το Stripe checkout (βλ. ήδη υπάρχουσα σημείωση, "Ρητά εκτός
scope σήμερα" στην ενότητα ~14/9).

**Backups:** Free plan Supabase = ΚΑΝΕΝΑ αυτόματο backup (χρειάζεται
χειροκίνητο `supabase db dump` περιοδικά). Pro/Team/Enterprise = αυτόματα
καθημερινά backups (7/14/30 μέρες retention αντίστοιχα). Ο χρήστης δεν
έχει ακόμα επιβεβαιώσει σε ποιο πλάνο είναι.

**Τεχνικά σημεία που ΘΑ χρειαστούν σε πολύ μεγάλη ταυτόχρονη κίνηση**
(όχι τώρα, μόνο όταν πλησιάσει πραγματικά):
- Μεγαλύτερο Supabase compute tier (Large/XL/2XL) — connection pooling
  (Supavisor) ήδη υπάρχει, δεν χρειάζεται 1:1 σύνδεση ανά χρήστη.
- Αλλαγή από interval polling (`refetchInterval: 15000`, ήδη σε
  `useProducts.js`, `useTenantPosts.js`, κ.ά.) σε Supabase Realtime
  (websocket push) — σε πολύ μεγάλη κλίμακα το polling παράγει περιττό
  φόρτο.
- CDN/edge caching για δημόσιες σελίδες με πολλή ανάγνωση.
- Load testing ΠΡΙΝ φτάσει πραγματικά εκεί, όχι ζωντανή ανακάλυψη.

**Ενδεικτικό, σταδιακό μηνιαίο κόστος** (Supabase+Netlify+email, USD,
βάσει επίσημων τιμολογίων 20/9, ΘΑ αλλάξουν με τον καιρό — να
ξαναελεγχθούν πριν ληφθεί απόφαση):

| Στάδιο | Ταυτόχρονοι | Μηνιαίο σύνολο (εκτίμηση) |
|---|---|---|
| Ξεκίνημα | 0–300 | ~$0 (Free tiers, χωρίς backups) |
| Πρώτη κίνηση | 300–2.000 | ~$45–65 |
| Μεσαία κίνηση | 2.000–10.000 | ~$120–250 |
| Μεγάλη κίνηση | 10.000–50.000 | ~$300–500 |
| Στόχος 120.000 | 120.000 | ~$400–650+ |

Ανεβαίνει σταδιακά, ΟΧΙ όλο μαζί από την αρχή — ο χρήστης ανεβάζει tier
όποτε το δείχνουν πραγματικά τα dashboards (Supabase connections/CPU,
Netlify bandwidth), όχι προληπτικά.

## Οδηγία προς AI assistant (Claude ή άλλο)

> Λειτούργησε σαν senior SaaS architect. Μην αλλάζεις αποφάσεις που έχουν ήδη παρθεί (multi-tenant μοντέλο, fan ownership στο Concerto με κεντρικό auth, custom/dynamic ticket types, subscription-based tickets-per-event όριο, δομή Radix/shadcn στα UI components) χωρίς να αιτιολογήσεις ρητά γιατί. Όταν δίνεται reference component, ακολούθησε αυστηρά τη δομή του. Συνέχισε από τα "Επόμενα βήματα" παραπάνω.
>
> **Κανόνας του χρήστη (14/9):** Ποτέ μην κάνεις πρωτοβουλία σε κάτι "από την αρχή" — και ειδικά καμία διαγραφή (δεδομένων, jobs, αρχείων, migrations, ό,τι) — χωρίς να ρωτήσεις πρώτα τον χρήστη και να πάρεις ρητή απάντηση. Αυτό ισχύει ακόμα κι αν κάτι φαίνεται προφανές, ασφαλές, ή προϋπάρχον/undocumented. Ό,τι κάνεις, ενημέρωσε τον χρήστη μετά.

---

## 22/9 — Stripe Connect Integration & Netlify Functions (Ενσωμάτωση & Production)

### Τι χτίστηκε

**Phase 1 (Stripe Connect Setup):**

Κάθε tenant (artist/band) τώρα μπορεί να συνδέσει το δικό του Stripe account μέσω OAuth flow (Stripe Connect).

- **`FanStripeAccountRoute.jsx`** — Νέα σελίδα στη tenant dashboard όπου ο artist:
  - Κάνει connect το Stripe account του μέσω λίγα κλικ (OAuth redirect σε Stripe)
  - Βλέπει το status (connected/pending/error) του account του
  - Μπορεί να αποσυνδεθεί (disconnect)
  - Σίγουρα δεν έχουμε κλειδιά/credentials του artist αποθηκευμένα — μόνο το Stripe account ID και κάποια metadata για status

- **`useConnectStripeAccount.js`** — React query hook που διαχειρίζεται το OAuth callback + account status
- **`useTenantStripeStatus.js`** — Hook για να σηκώσεις το τρέχον status ενός tenant's Stripe account
- **Database migration `20260922160000_add_tenant_stripe_account.sql`:**
  - Νέα στήλη `stripe_account_id` στο `tenants` table (nullable, unique, indexed)
  - Νέα στήλη `stripe_account_status` (enum: `'pending'`, `'active'`, `'restricted'`, `'disconnected'`)
  - Audit columns: `stripe_connect_at`, `stripe_last_sync_at`

**Phase 1b (Netlify Functions - Serverless Backend):**

Δεν μπορούμε να χειριστούμε Stripe OAuth ή payments σε stateless frontend. Χτίσαμε Netlify Functions (serverless) ως backend:

- **`apps/tenant-site/netlify.toml`** — Configuration για Netlify builds + function deployment
- **`apps/tenant-site/netlify/functions/stripe-connect-onboarding.mjs`** — Κύριο function:
  - Λαμβάνει POST request από frontend (`{ tenantId, returnUrl }`)
  - Δημιουργεί Stripe Connect OAuth link για αυτόν τον tenant
  - Επιστρέφει redirect URL
  - **Σημαντικό:** Κλειδί Stripe API σε `.env` (Netlify env vars), ΔΕΝ hardcoded
  - Return URL pointing back σε `/tenant/stripe/callback` (handled από React component)

- **Deployment:** Όταν pushάρεις στον main branch, Netlify αυτόματα:
  - Builds `apps/tenant-site/` (Vite)
  - Deploys functions από `netlify/functions/` ως `/.netlify/functions/<filename>`
  - Publishes το site

### News/Posts Feature (Sidebar addition)

Παράλληλα χτίστηκε ένα απλό social features:

- **`NewsRoute.jsx`** — Νέα σελίδα όπου ο artist δημοσιεύει updates (photos, small videos, text)
- **`NewPostDialog.jsx`** — Modal για δημοσίευση
- **`PostCard.jsx`** — Κάρτα για εμφάνιση κάθε post (π.χ. στο News tab)
- **Database migration `20260920100000_add_tenant_posts.sql`:**
  - Νέα table `tenant_posts` (id, tenant_id, content, media_urls, created_by, created_at)
  - Νέα table `tenant_post_likes` (id, post_id, fan_id, created_at) — fans μπορούν να κάνουν like
- **Queries:**
  - `useCreateTenantPost.js` — POST request για δημοσίευση
  - `useTenantPosts.js` — Fetch posts με pagination (refetch κάθε 15 sec)
  - `useToggleTenantPostLike.js` — Like/unlike logic
- **Utilities:**
  - `checkVideoDuration.js` — Ελέγχει αν το video είναι πάνω από το όριο (π.χ. 5 λεπτά) πριν upload
  - `compressImage.js` — Συμπιέζει εικόνες πριν upload (quality optimization)

### Architectural Decisions & Next Steps

**Τι μένει να γίνει:**

1. **Environment variables in production:**
   - Stripe secret key + publishable key στο Netlify env
   - Database URL + auth credentials στο Netlify (για τα functions να χτυπήσουν τη Supabase)
   - Βλ. Netlify docs για secrets management

2. **Live Stripe testing:**
   - Δημιουργία test Stripe account (δωρεάν, sandbox mode)
   - Configuration του OAuth application στο Stripe dashboard
   - Test του full flow (connect → onboarding → callback)

3. **Payment checkout (βλ. φλους σχόλιο στο CartDialog — ΔΕΝ χρειάζεται σήμερα):**
   - Μόλις ο artist έχει connected Stripe account, τα checkout payments (κάρτες fan) θα πάνε στο δικό του Stripe account
   - Stripe fee (~2.9% + $0.30 ανά transaction) αφαιρείται αυτόματα, ο artist παίρνει το καθάρό
   - Concerto δεν λαμβάνει άμεση cut από τα payments (ήδη πληρώθηκε από tenant setup fee ή θα γίνει subscription model)

4. **Rate limiting / Security:**
   - Netlify functions είναι public — χρειάζεται rate limiting στο OAuth endpoint (αποφυγή spam/brute force)
   - Request signing ή API key validation (TODO, όχι σημερινή ανάγκη, αλλά documentation για μελλοντικό dev)

5. **Email notifications (Resend integration — ΔΕΝ χτίστηκε σήμερα):**
   - Όταν artist συνδεθεί, λαμβάνει email confirmation
   - Όταν fan αγοράσει, receives invoice (Stripe → Resend → email)
   - Χτίζεται ΜΕ checkout function όταν εκείνη γίνει, όχι ξεχωριστά

### Updated Components

- **Header.jsx:** Προστέθηκε link προς νέα "Stripe Settings" σελίδα (conditionally για tenants που έχουν admin perms)
- **FanDashboardLayout.jsx:** Προστέθηκε νέο sidebar item για "News" route
- **Main.jsx:** Registered νέες routes για Stripe + News

### Testing Checklist (user's responsibility, όχι χτίστηκε)

- [ ] Δημιουργία test Stripe account
- [ ] Configuration OAuth app στο Stripe dashboard — **⚠️ 23/9: ξεπερασμένο item, το flow ΔΕΝ είναι OAuth — βλ. ενότητα "23/9 — Διευκρίνιση ορολογίας" παρακάτω, δεν υπάρχει "OAuth app" να ρυθμιστεί**
- [x] Netlify deploy (push main → auto-deploy) — επιβεβαιώθηκε 23/9, μετά το bug fix του base directory (βλ. "23/9 — Bug fix" παρακάτω)
- [ ] Live test: artist connects Stripe account via UI — **σε εξέλιξη 23/9: έφτασε σε πραγματική Stripe-hosted onboarding σελίδα, ΔΕΝ έχει ολοκληρωθεί ακόμα η φόρμα — βλ. "23/9 — Κατάσταση live testing" παρακάτω**
- [ ] Callback redirect works correctly
- [ ] Database row created με σωστό account ID
- [ ] News posts can be created + liked by fans
- [ ] Video duration check blocks > 5 min
- [ ] Image compression reduces file size

---


---

## 23/9 — Bug fix: Netlify Functions επέστρεφαν 404 (base directory mismatch)

**Σύμπτωμα:** `POST /.netlify/functions/stripe-connect-onboarding` → 404, γύριζε στο React app's δικό του client-side "not found" page αντί για πραγματικό Netlify response.

**Αιτία (επιβεβαιώθηκε από Netlify dashboard → Project configuration → General → Build settings):** Το πραγματικό **Base directory** του site είναι `/` (root του repo) — ΟΧΙ `apps/tenant-site` όπως υπέθετε λανθασμένα το αρχικό `apps/tenant-site/netlify.toml` (γραμμένο 22/9). Το Netlify διαβάζει `netlify.toml` ΜΟΝΟ μέσα στο base directory, άρα αυτό το αρχείο ποτέ δεν διαβαζόταν — το `[functions] directory` μέσα του αγνοούνταν πλήρως, το function ποτέ δεν έγινε bundle/deploy.

**Fix:** Νέο `netlify.toml` στη **ΡΙΖΑ** του repo με `[functions] directory = "apps/tenant-site/netlify/functions"` (path σχετικό με root). Το παλιό `apps/tenant-site/netlify.toml` κρατήθηκε (όχι διαγραφή) αλλά άδειασε από directives — έχει μόνο επεξηγηματικό σχόλιο για μελλοντική αναφορά. Base directory / Build command / Publish directory ΔΕΝ πειράχτηκαν — ήδη δούλευαν σωστά από το dashboard.

**Εκκρεμεί:** Push + νέο production deploy για να επιβεβαιωθεί ζωντανά (πρόσεξε το banner "operational credits" από 22/9 — μπορεί να χρειάζεται upgrade πριν επιτραπεί νέο production deploy).

---

## 23/9 — Bug fix #2: Stripe Accounts v1 αποσύρθηκε, migration σε v2

**Σύμπτωμα (μετά το fix του 404):** το function πλέον βρισκόταν/έτρεχε (502 → πραγματικό error αντί για routing 404), αλλά έσκαγε με `StripeInvalidRequestError`: *"Stripe no longer recommends Accounts v1 for new Connect integrations."*

**Αιτία:** ο κώδικας χρησιμοποιούσε `stripe.accounts.create({ type: 'standard' })` (Accounts v1) — το Stripe το απέσυρε πλέον για ΝΕΕΣ Connect ενσωματώσεις (existing v1 accounts συνεχίζουν κανονικά, μόνο η δημιουργία νέων μπλοκάρεται).

**Fix:** migration σε Accounts v2 (`stripe.v2.core.accounts.create`) + Account Links v2 (`stripe.v2.core.accountLinks.create`) στο `stripe-connect-onboarding.mjs`. Έρευνα στην επίσημη τεκμηρίωση Stripe (docs.stripe.com/connect/accounts-v2) πριν την αλλαγή — όχι μάντεμα, θέμα πληρωμών.

**Δύο ρητές, νέες αποφάσεις (v2 απαιτεί πεδία που το v1 άφηνε προαιρετικά):**
- `identity.country` **hardcoded σε `"gr"`** — το v2 API το απαιτεί υποχρεωτικά στη δημιουργία (το v1 το άφηνε κενό, το συμπλήρωνε ο tenant μέσα στο Stripe onboarding). Αφού το Concerto απευθύνεται σε Ελληνικά συγκροτήματα (€, ελληνικό UI παντού), θεωρήθηκε ασφαλής προσωρινή τιμή. **Αν ποτέ χρειαστεί tenant εκτός Ελλάδας, αυτό θα χρειαστεί να γίνει επιλογή στη φόρμα.**
- `contact_email` — υποχρεωτικό πλέον, χρησιμοποιεί το ήδη-επιβεβαιωμένο `userData.user.email` του συνδεδεμένου tenant admin (καμία νέα φόρμα).
- `dashboard: "full"` + `defaults.responsibilities.fees_collector/losses_collector: "stripe"` = το v2 ισοδύναμο του παλιού `type: "standard"`.

**Εκκρεμεί/επόμενο βήμα (ΔΕΝ έγινε σήμερα, out of scope):** το `useTenantStripeStatus.js`/`tenant_settings.stripe_charges_enabled` πεδίο πιθανώς χρειάζεται να ενημερωθεί ώστε να διαβάζει το status από τη νέα v2 shape (`configuration.merchant.capabilities.card_payments.status`) αντί για το παλιό v1 `charges_enabled` boolean — θα το δούμε μόλις φανεί πρόβλημα στο status display μετά από επιτυχημένο onboarding.


---

## 23/9 — FanStripeAccountRoute.jsx: επανασχεδίαση σε merch style

Ρητό αίτημα χρήστη: το component να ακολουθεί το ίδιο οπτικό στυλ με το Merch
section (`ProductFormPage.jsx`/`ProductOverviewRoute.jsx`) — αντικαταστάθηκε
το γενικό shadcn `Card`/`CardHeader`/`CardTitle`/`CardContent` με το
καθιερωμένο μοτίβο: εξωτερικό γκρι πλαίσιο (`rounded-2xl bg-gray-50 p-4
sm:p-6`) γύρω από εσωτερική λευκή bordered κάρτα (`rounded-xl border
border-gray-200 p-4 shadow-sm sm:p-5`). Καμία αλλαγή λειτουργικότητας/λογικής
— μόνο markup/classes. Επιβεβαιώθηκε ζωντανά (screenshot, desktop) ότι
αποδίδεται σωστά.

---

## 23/9 — Διευκρίνιση ορολογίας: το flow είναι Stripe Connect Onboarding (Account Links), ΟΧΙ OAuth

Η αρχική περιγραφή στην ενότητα "22/9 — Stripe Connect Integration &
Netlify Functions" παραπάνω ("OAuth flow (Stripe Connect)") είναι ανακριβής
ορολογία, ξεπερασμένη από το πραγματικό migration σε v2 (βλ. "23/9 — Bug fix
#2" παραπάνω): αυτό που χτίστηκε και τρέχει σήμερα είναι Stripe-hosted
**Connect Onboarding** μέσω **Account Links**
(`stripe.v2.core.accountLinks.create`), ΟΧΙ OAuth redirect/authorize flow.
Πρακτικά η εμπειρία για τον χρήστη είναι παρόμοια (redirect σε Stripe-hosted
σελίδα, επιστροφή μέσω `return_url`/`refresh_url`), αλλά ο μηχανισμός από
κάτω είναι διαφορετικός — καμία αλλαγή κώδικα απαιτείται, μόνο διόρθωση
τεκμηρίωσης ώστε μελλοντικός dev/AI να μην ψάξει για OAuth callback route
που δεν υπάρχει. Το testing checklist item "Configuration OAuth app στο
Stripe dashboard" (ενότητα 22/9 παραπάνω) σημειώθηκε ως ξεπερασμένο για τον
ίδιο λόγο.

---

## 23/9 — Κατάσταση live testing (μέχρι στιγμής, ΜΗ ολοκληρωμένο)

- **Function deploy:** επιβεβαιώθηκε — το 404 έγινε 502 μετά το root
  `netlify.toml` fix (το function πλέον βρίσκεται/εκτελείται, βλ. "23/9 —
  Bug fix" παραπάνω).
- **`STRIPE_SECRET_KEY`:** σωστά ρυθμισμένο ως secret env var στο Netlify
  (μετά από δύο γύρους διόρθωσης — αρχικά λάθος/ασαφές όνομα μεταβλητής,
  μετά σωστή δημιουργία με "Contains secret values" τσεκαρισμένο, ΟΧΙ
  αποτσεκαρισμένο όπως λανθασμένα προτάθηκε αρχικά). Είναι το **test** key
  (`sk_test_...`), ΟΧΙ live/production.
- Μετά τη διόρθωση #2 (v2 migration), ο χρήστης έφτασε σε πραγματική
  Stripe-hosted onboarding σελίδα (θετικό σημάδι, function → Stripe API →
  account link → redirect δουλεύουν end-to-end μέχρι εκεί) — **δεν έχει
  ακόμα επιβεβαιωθεί η επιτυχής ολοκλήρωση** της φόρμας onboarding στο
  Stripe, ούτε ένα καθαρό, χωρίς-σφάλμα test μετά το τελευταίο deploy.
- **`useTenantStripeStatus.js`/`tenant_settings.stripe_charges_enabled`:**
  πιθανώς χρειάζεται update ώστε να διαβάζει το v2 status shape (βλ. "23/9
  — Bug fix #2" παραπάνω) — ΔΕΝ έχει ελεγχθεί ακόμα, μόνο υποψία/σημείωση.

**Επόμενα βήματα (χρήστη):** ολοκλήρωση onboarding φόρμας στο Stripe (test
δεδομένα), επιβεβαίωση σωστής επιστροφής στο `/account/stripe`, έλεγχος αν
το status στο UI ενημερώνεται σωστά μετά την ολοκλήρωση.


---

## 23/9 — Σημείωση handoff προς επόμενο AI session: αύριο live test Stripe onboarding

Ο χρήστης αλλάζει AI session εδώ — το brief/docs είναι ενημερωμένα (commit
`e8b020b`), οπότε η επόμενη session μπορεί να ξεκινήσει κατευθείαν από εδώ,
χωρίς επανάληψη ολόκληρου του context.

**Τι εκκρεμεί, ακριβώς:** αύριο ο χρήστης θα κάνει το ζωντανό (live) test
της ολοκλήρωσης του Stripe Connect onboarding flow. Πλήρες context στην
ενότητα "23/9 — Κατάσταση live testing (μέχρι στιγμής, ΜΗ ολοκληρωμένο)"
παραπάνω — διάβασέ την πρώτη πριν ξεκινήσεις. Συνοπτικά τι μένει να
ελεγχθεί:
- Ολοκλήρωση της φόρμας onboarding στο Stripe (test δεδομένα) μέχρι το
  τέλος.
- Σωστή επιστροφή στο `/account/stripe` μέσω του `return_url`.
- Αν το status στο UI (`FanStripeAccountRoute.jsx`) ενημερώνεται σωστά
  μετά την ολοκλήρωση — **ύποπτο σημείο**: το `useTenantStripeStatus.js`/
  `tenant_settings.stripe_charges_enabled` πιθανώς διαβάζει ακόμα το παλιό
  v1 `charges_enabled` shape αντί για το νέο v2 (`configuration.merchant.
  capabilities.card_payments.status`) — αν το status δεν φανεί σωστά μετά
  το onboarding, ξεκίνα το debugging από εκεί.
- Ό,τι άλλο σφάλμα/απρόοπτο προκύψει κατά το testing — δες τα σχετικά
  testing-checklist items στο `concerto-testing-checklist.md`, ενότητα
  "Stripe Connect Onboarding + Netlify Functions (23/9)".


---

## 23/9 — TODO (μελλοντικό checkout): μπλοκάρισμα καταστήματος μέχρι να επαληθευτεί το Stripe account του tenant

Συζήτηση με τον χρήστη για το πώς θα δουλεύει το checkout όταν χτιστεί
(ΔΕΝ χτίζεται σήμερα, καταγράφεται εδώ ως backlog task για τότε):

- Μέχρι ένας tenant να συνδέσει το Stripe account του **και αυτό να έχει
  πραγματικά ενεργοποιηθεί/επαληθευτεί από το Stripe**, το κατάστημά του
  (checkout) πρέπει να είναι μπλοκαρισμένο — δεν πρέπει να μπορεί να δεχτεί
  πληρωμές.
- **Σημαντική λεπτομέρεια, ρητά διευκρινισμένη στον χρήστη:** η επιστροφή
  στο `return_url` (`/account/stripe`) μετά το Stripe-hosted onboarding
  **ΔΕΝ σημαίνει ότι το account είναι ήδη ενεργό**. Σημαίνει μόνο ότι ο
  tenant ολοκλήρωσε/έφυγε από τη φόρμα — το Stripe χρειάζεται δικό του
  χρόνο από πίσω για να επαληθεύσει ταυτότητα/τραπεζικό λογαριασμό κλπ,
  πριν το account γίνει πραγματικά ικανό να δέχεται χρήματα.
- **Άρα χρειάζεται ξεχωριστός μηχανισμός ελέγχου status** πριν
  ενεργοποιηθεί το checkout για συγκεκριμένο tenant — π.χ. listen στο
  Stripe `account.updated` webhook event, ή/και explicit έλεγχος του
  account status όταν φορτώνει η σελίδα του tenant, πριν επιτραπεί
  οποιαδήποτε πληρωμή. Σχετίζεται άμεσα με το ήδη σημειωμένο TODO για το
  `useTenantStripeStatus.js`/status shape (βλ. "23/9 — Bug fix #2"
  παραπάνω) — το ίδιο σημείο του κώδικα πιθανότατα θα φέρει και αυτόν τον
  έλεγχο.
- Δεν έχει σχεδιαστεί ακόμα η ΑΚΡΙΒΗΣ υλοποίηση (webhook vs. polling
  status vs. κάτι άλλο) — μόνο η απαίτηση/κανόνας έχει καταγραφεί εδώ, θα
  αποφασιστεί όταν χτιστεί το ίδιο το checkout.


---

## 23/9 — FanDashboardLayout.jsx: λογότυπο Concerto + tenant avatar βγήκαν από το pill, με animation

Ρητό αίτημα χρήστη, με screenshots: το λογότυπο Concerto (αριστερά) και το
ήδη υπάρχον "πίσω στον tenant" avatar (δεξιά — δείχνει πάντα το
`settings.logo_url` ΑΥΤΟΥ του tenant, click γυρίζει στο `/about` του) δεν
είναι πλέον μέσα στο κοινό pill nav του Fan Dashboard — έγιναν δύο
ξεχωριστά, floating στοιχεία (`top-20`, πιο χαμηλά από το pill που έμεινε
στο `top-4`) ώστε να μην στριμώχνονται με το pill όταν προστεθούν κι άλλα
icons εκεί στο μέλλον. Ίδιο μοτίβο με το ήδη υπάρχον `ConcertoBar.jsx`
στην αρχική σελίδα του tenant (ξεχωριστά στοιχεία, όχι ενωμένα σε ένα
pill — βλ. "18/9 — ConcertoBar" παραπάνω).

**Ολοκληρώθηκε ένα ήδη σημειωμένο TODO από τις 18/9:** το
`ConcertoLogo.jsx` (reusable, animated component — GSAP "επιπλέει απαλά")
χρησιμοποιούνταν μέχρι σήμερα ΜΟΝΟ στο `ConcertoBar.jsx`· στο
`FanDashboardLayout.jsx` υπήρχε ακόμα η παλιά, στατική (χωρίς animation)
εικόνα. Το component έγινε **γενικό** (νέα προαιρετικά props
`src`/`alt`/`ariaLabel`, default στο ίδιο το λογότυπο Concerto — η ήδη
υπάρχουσα χρήση στο `ConcertoBar.jsx` μένει ΑΚΡΙΒΩΣ ίδια, αμετάβλητη) ώστε
το ΙΔΙΟ animation να μπορεί να αποδώσει είτε το λογότυπο Concerto είτε
οποιαδήποτε άλλη εικόνα — εδώ, το `settings.logo_url` του tenant. Ένα
σημείο αλήθειας για το animation, αντί για δύο ξεχωριστά implementations.

`pt-20` → `pt-32` στο περιεχόμενο της σελίδας (κάτω από το pill) ώστε να
μην κρύβεται πίσω από τα νέα, χαμηλότερα floating στοιχεία σε στενό
(mobile) viewport.

`npx eslint .` επιβεβαιώθηκε καθαρό εκτός του ήδη γνωστού baseline (19
errors, `src/components/ui/*.jsx`) — καμία παλινδρόμηση.

**⚠️ Εκκρεμεί ζωντανό οπτικό test** (mobile ΚΑΙ desktop) — οι ακριβείς
τιμές θέσης (`top-20`, `pt-32`) επιλέχθηκαν λογικά αλλά ΔΕΝ έχουν
επιβεβαιωθεί ζωντανά ακόμα σε πραγματικό browser. Βλ. νέο item στο
`concerto-testing-checklist.md`.
