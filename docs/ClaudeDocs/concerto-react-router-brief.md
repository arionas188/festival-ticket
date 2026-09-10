# CONCERTO — REACT ROUTER: Πλάνο Υλοποίησης (Ξεχωριστό Brief)

## Σκοπός αυτού του εγγράφου

Ξεχωριστό, τεχνικό brief αποκλειστικά για το React Router task — ώστε να μην μπερδεύεται με το ήδη μεγάλο κύριο brief. Καταγράφει τη σειρά υλοποίησης, τι έχει γίνει, τι μένει.

## Κανόνες εργασίας (ισχύουν αυστηρά, ήδη καταγεγραμμένοι και στο κύριο brief)

1. **Επίσημο "Data Router" pattern μόνο** — `createBrowserRouter`, `<RouterProvider>`, από την επίσημη τεκμηρίωση `reactrouter.com`. Καμία αυτοσχέδια παραλλαγή.
2. **Επιλεκτική εφαρμογή, όχι "όλα ή τίποτα".** Κάθε νέο κομμάτι εξετάζεται ξεχωριστά: χρειάζεται πραγματικά μοιράσιμο URL/routing, ή μπορεί να μείνει απλό React state; Παρουσιάζονται και οι δύο επιλογές πριν αποφασιστεί.
3. Πριν από κάθε διόρθωση σε υπάρχον αρχείο, ζητείται πρώτα το τρέχον περιεχόμενό του (ίδιος γενικός κανόνας του project).
4. Bundle size / ταχύτητα: η απουσία router δεν κάνει τίποτα πιο αργό από μόνη της — το πραγματικό κριτήριο είναι το μέγεθος του κώδικα, όχι η παρουσία/απουσία routing.

## Προαπαιτούμενο (ολοκληρώθηκε πριν ξεκινήσει το routing)

✅ **Bfcache fix** — διορθώθηκε στο `useAuth.js` (βλ. κύριο brief, ενότητα "Bfcache fix") πριν ξεκινήσει το routing task, ώστε να μην μπερδεύεται με τυχόν νέα, άσχετα συμπτώματα κατά τη διάρκεια του routing.

---

## Σχέδιο — τι γίνεται route, τι όχι

### ✅ Γίνονται πραγματικά routes (μοιράσιμα links, το βασικό ζητούμενο)
- Μεμονωμένα **merch products** (π.χ. `/merch/villagers-tshirt-black`)
- Μεμονωμένα **events** (π.χ. `/events/live-at-gazi`)
- Η **αρχική** σελίδα κάθε tenant (`/`)

### ✅ Αποφασίστηκε — και τα τρία tabs είναι πλέον routes
- Ρωτήθηκε ρητά ο χρήστης (Κανόνας #2/#5) αν αξίζει το tab **Πληροφορίες** να γίνει κι αυτό πραγματικό route ή να μείνει state αφού δεν έχει sub-links για μοίρασμα. Επιλέχθηκε να γίνει route, για αρχιτεκτονική συνέπεια με Merch/Events.
- Το `Header.jsx` είναι πλέον **πλήρως route-driven**: το `activeTab` υπολογίζεται αποκλειστικά από `location.pathname` (καθόλου `useState` για tabs), και υπάρχει **ένα μόνο** `<Outlet context={...} />` — το router αποφασίζει ποιο route-component ταιριάζει, όχι το tab state.

### ❌ Δεν γίνονται routes (παραμένουν όπως είναι)
- Modals (Ticket, Favorites, Cart, Search, AuthGate) — δεν βγάζει νόημα να έχουν δικό τους URL

---

## Σειρά υλοποίησης (αποφασίστηκε: MerchStore πρώτο, μετά τα υπόλοιπα)

1. ✅ **Merch Store πλήρες** (routing για κατηγορίες + μεμονωμένα προϊόντα) — **ΟΛΟΚΛΗΡΩΘΗΚΕ**
2. ✅ **Events πλήρες** (routing για μεμονωμένα events) — **ΟΛΟΚΛΗΡΩΘΗΚΕ**
3. ✅ **Tenant home page (`/`)** — **ΟΛΟΚΛΗΡΩΘΗΚΕ** (Πληροφορίες έγινε index route)
4. *(Εκκρεμεί απόφαση)* Tabs Πληροφορίες/Εκδηλώσεις ως routes ή όχι

---

## Status

**Το Merch Store routing ολοκληρώθηκε και επαληθεύτηκε στον browser. Το Events routing και το Tenant home page (index route) ολοκληρώθηκαν και περνάνε lint + build (δες ενότητες παρακάτω) — δεν έχει γίνει ακόμα browser verification για κανένα από τα δύο.**

### Αποφάσεις που κλείδωσαν
- Μεμονωμένο προϊόν → **modal** με το υπάρχον `ProductQuickShop`, όχι νέα πλήρης σελίδα. Το `ProductOverview` παραμένει άγραφο και εκτός scope.
- **AuthGate → παραμένει modal, χωρίς `/login` route.** Το login είναι διακοπή μέσα σε ενέργεια, όχι πύλη· υπάρχει ένα μόνο κουμπί (Google)· και το `redirectTo` επιστρέφει ήδη τον χρήστη στη σελίδα του, χωρίς `?next=` param που θα ήταν open-redirect ρίσκο (Κανόνας 6).

### Routes που υπάρχουν
```
/                                            → tenant home (tab από React state)
/merch                                       → CategoryGrid
/merch/category/:categoryKey                 → λίστα προϊόντων
/merch/category/:categoryKey/product/:productId → modal πάνω στη λίστα
/merch/product/:productId                    → modal πάνω στο CategoryGrid
```

Το modal υλοποιήθηκε ως **child route με `<Outlet />`**, όχι με το `backgroundLocation` κόλπο. Είναι καθαρό Data Router, δουλεύει σε refresh και σε direct link, και το back button κλείνει το modal φυσικά. Τα δεδομένα περνούν στα route components με `<Outlet context={...} />` / `useOutletContext()`.

### Αρχεία
- **Νέα:** `src/hooks/useMerchCategories.js`, `src/components/Merch/MerchCategoriesRoute.jsx`, `MerchCategoryRoute.jsx`, `ProductModalRoute.jsx`, `public/_redirects`
- **Άλλαξαν:** `src/main.jsx` (router), `src/components/Header/Header.jsx` (Outlet + tab από URL), `src/components/Merch/ProductQuickShop.jsx` (auth guard στο καλάθι)
- **Διαγράφηκε:** `src/components/Merch/MerchStore.jsx` (η λογική του πήγε στο hook + στα route components)

### Bugs που βρέθηκαν και διορθώθηκαν στην πορεία
1. **Δεν υπήρχε SPA fallback για Netlify.** Χωρίς `public/_redirects`, κάθε refresh σε `/merch/...` θα έδινε 404 στο production. Προστέθηκε.
2. **Το καλάθι αποτύγχανε σιωπηλά για αποσυνδεδεμένους.** Με δημόσιο URL προϊόντος, ο επισκέπτης έφτανε στο modal χωρίς session και το `addItem` έκανε `insert({ fan_id: undefined })`, που το RLS απορρίπτει. Τώρα το `ProductQuickShop` ζητά σύνδεση και **μένει ανοιχτό**, ώστε το OAuth `redirectTo` να τον φέρει πίσω στο ίδιο προϊόν.
3. **`Date.now()` μέσα σε render** (προϋπήρχε στο `MerchStore.jsx`) — το έπιανε ο νέος κανόνας `react-hooks/purity`. Ο υπολογισμός του cutoff βγήκε σε module scope.
4. **Περιττό `useEffect`** στο `ProductQuickShop` που επανέφερε ποσότητα/μέγεθος. Το σχόλιό του βασιζόταν στο ότι το component δεν κάνει unmount — δεν ισχύει πια, αφού είναι route. Αντικαταστάθηκε με `key={product.id}`.

### Εκκρεμότητες / γνωστά όρια
- Τα URLs χρησιμοποιούν **UUID**. Το `slug` migration σε `products`/`events` παραμένει ανοιχτό.
- **Τοπικό dev:** ο έλεγχος γίνεται στο `http://villagers.concerto.gr:5173` (υπάρχει εγγραφή στο `/etc/hosts`). Το `localhost` **δεν** έχει εγγραφή στο `tenant_domains`, οπότε δείχνει «Tenant not found».
- Το `AddedToCartDialog.jsx` δεν το εισάγει κανείς — dead code, δεν το άγγιξα.

---

## Events routing — ολοκληρώθηκε (lint + build περνάνε, εκκρεμεί browser verification)

### Απόφαση
Το tab **Εκδηλώσεις** έγινε de facto route (`/events`), ίδιο σκεπτικό με το Merch: χωρίς αυτό το `/events/event/:eventId` δεν θα ήξερε ποιο background να δείξει. Το **Πληροφορίες** παραμένει `useState` (μερική μετάβαση, όπως προτεινόταν).

### Routes που προστέθηκαν
```
/events                → EventsList (ίδια λίστα με πριν, τώρα route)
/events/event/:eventId → TicketDialog modal πάνω στη λίστα
```
Ίδιο pattern με το Merch: modal ως **child route** με `<Outlet />`, δεδομένα μέσω `<Outlet context={...} />` / `useOutletContext()`, κλείσιμο με `navigate(-1)` ή `navigate("..", {replace:true})` ανάλογα με `location.key === "default"` (κοινοποιημένο link vs. εσωτερική πλοήγηση).

### Αρχεία
- **Νέα:** `src/components/Events/EventsRoute.jsx`, `src/components/Events/EventModalRoute.jsx`
- **Άλλαξαν:**
  - `src/main.jsx` — προστέθηκαν τα routes `events` / `events/event/:eventId`
  - `src/components/Header/Header.jsx` — `isEventsRoute`, tab sync με URL, `<Outlet context={{tenantId, isLoggedIn, onRequireAuth}} />` αντί για άμεσο `<EventsSection />`
  - `src/components/Events/TicketDialog.jsx` — refactor σε **controlled** `open`/`onOpenChange` (όπως το `ProductQuickShop`)· αφαιρέθηκε το δικό του trigger button/`useState`
  - `src/components/Events/EventsList.jsx` — το κουμπί "Ticket" τώρα κάνει `navigate(\`event/${event.id}\`)` αντί να ανοίγει τοπικό dialog state
- **Διαγράφηκε:** `src/components/Events/EventsSection.jsx` (η λογική του πήγε στο `EventsRoute.jsx`)

### Auth guard (Κανόνας #4 του handoff)
Το άνοιγμα του event (view) είναι δημόσιο — δεν υπάρχει πια guard στο άνοιγμα του dialog (η παλιά υλοποίηση έμπαινε λάθος εκεί). Το guard μετακινήθηκε στο κουμπί **"Επιλογή"** ticket μέσα στο dialog: αν ο χρήστης δεν είναι συνδεδεμένος, καλείται `onRequireAuth()`. Το ίδιο το booking/reservation flow δεν έχει χτιστεί ακόμα (`TODO` comment στο σημείο) — μεγάλο μελλοντικό task, βλ. "Εξαρτήσεις" παρακάτω.

### Verification
- **Lint:** `npx eslint src/` καθαρό για όλα τα αρχεία που άλλαξαν/προστέθηκαν σε αυτό το task. Τα μόνα errors που εμφανίζονται είναι σε `src/components/ui/*.jsx` (shadcn scaffold, `no-unused-vars: React`) — προϋπήρχαν, επιβεβαιώθηκε με `git stash` πριν τις αλλαγές.
- **Build:** `npm run build` πέρασε. Χρειάστηκε πρώτα `npm i` για ένα άσχετο, προϋπάρχον πρόβλημα περιβάλλοντος (λείπον optional native binding του rolldown/vite σε αυτό το μηχάνημα — [γνωστό npm bug](https://github.com/npm/cli/issues/4828)), όχι κάτι που προκάλεσε αυτό το task.
- **Δεν έγινε:** browser test (άνοιγμα `/events`, κλικ σε event, κοινοποίηση link, refresh) — συνιστάται πριν γίνει commit/deploy. Τοπικό dev: `http://villagers.concerto.gr:5173`.
- **Δεν έγινε commit.** Οι αλλαγές (Merch + Events) παραμένουν uncommitted στο working directory.

---

## Tenant home page (`/`) — ολοκληρώθηκε (lint + build περνάνε, εκκρεμεί browser verification)

### Απόφαση (ρωτήθηκε ο χρήστης πριν, Κανόνας #2/#5)
Επιλέχθηκε να γίνει το **Πληροφορίες** tab πραγματικό route (`index: true` κάτω από `/`), παρότι δεν έχει δικό του sub-link για μοίρασμα — για χάρη αρχιτεκτονικής συνέπειας, ώστε και τα τρία tabs (Πληροφορίες/Εκδηλώσεις/Merch Store) να ακολουθούν το ίδιο μοτίβο route + `Outlet`, αντί για μείγμα state+routes.

### Τι άλλαξε
- **Νέο:** `src/components/BandInfo/InfoRoute.jsx` — index route, παίρνει `bandBio` από `useOutletContext()`, renders bio + `<BandInfo />` (ίδιο περιεχόμενο με πριν, απλά ως route-component)
- **`src/main.jsx`** — προστέθηκε `{ index: true, element: <InfoRoute /> }` ως πρώτο child του `/`
- **`src/components/Header/Header.jsx`** — μεγάλη απλοποίηση:
  - Το `activeTab` δεν είναι πια `useState` — υπολογίζεται αποκλειστικά από `location.pathname` (`/merch*` → Merch Store, `/events*` → Εκδηλώσεις, οτιδήποτε άλλο → Πληροφορίες)
  - `handleTabClick` έγινε καθαρό `navigate(...)`, χωρίς πια `setStateTab`/ελέγχους `isMerchRoute`/`isEventsRoute`
  - Τα τρία conditionally-rendered blocks (Πληροφορίες inline JSX / Events Outlet / Merch Outlet) έγιναν **ένα** ενιαίο, πάντα-ενεργό `<Outlet context={{ tenantId, fanId, isLoggedIn, onRequireAuth, onAddToCart, bandBio }} />` — το ποιο route-component θα φανεί το αποφασίζει αποκλειστικά ο router
  - Αφαιρέθηκε το πλέον περιττό `import BandInfo` (μετακόμισε στο `InfoRoute.jsx`)

### Verification
- **Lint:** καθαρό για όλα τα αρχεία που άλλαξαν/προστέθηκαν σε αυτό το task (ίδια 13 προϋπάρχοντα errors μόνο σε `src/components/ui/*`, άσχετα).
- **Build:** `npm run build` περνάει.
- **Δεν έγινε:** browser test (κλικ σε κάθε tab, refresh σε κάθε route, επιβεβαίωση ότι back/forward δουλεύουν σωστά μεταξύ Πληροφορίες/Merch/Events).
- **Δεν έγινε commit.** Όλες οι αλλαγές (Merch + Events + Home) παραμένουν uncommitted.

---

## 404 / route-error handling — ολοκληρώθηκε (lint + build περνάνε, εκκρεμεί real-browser click test)

### Τι προστέθηκε
- **Νέο:** `src/components/ErrorPage/ErrorPage.jsx` — επίσημο React Router "Data Router" error pattern (`useRouteError`, `isRouteErrorResponse`, `Link`), επιβεβαιωμένα υπαρκτά exports στο εγκατεστημένο `react-router-dom@7.18.3` (ελέγχθηκε με `node -e`).
- **`src/main.jsx`** — `errorElement: <ErrorPage />` στη ρίζα (`path: '/'`). Ένα errorElement εκεί αρκεί: πιάνει και τελείως άγνωστα paths (React Router πετάει synthetic 404 `ErrorResponse` όταν καμία διαδρομή δεν ταιριάζει) και οποιοδήποτε uncaught error μέσα σε render των child routes.
- Σκόπιμη απόκλιση από το tutorial-παράδειγμα: **δεν** δείχνουμε `error.message`/`statusText` στον χρήστη (μόνο `console.error` για εμάς) — δημόσια σελίδα προς fans/επισκέπτες, όχι τεχνικές λεπτομέρειες σφάλματος προς τα έξω.
- Η `ErrorPage` είναι εντελώς αυτόνομη (δεν διαβάζει `useOutletContext`) — σωστό εξ ορισμού, αφού και στις δύο περιπτώσεις (total 404 ή error bubble-up) το `<App/>`/`Header` δεν είναι απαραίτητα ακόμα mounted.

### Verification
- **Lint:** καθαρό (`npx eslint src/components/ErrorPage src/main.jsx`).
- **Build:** `npm run build` περνάει.
- **✅ Επιβεβαιώθηκε σε πραγματικό browser από τον χρήστη:** `http://villagers.concerto.gr:5173/kati-pou-den-yparxei` → εμφανίζει σωστά τη σελίδα "Η σελίδα δεν βρέθηκε".

---

## Cards → πραγματικά `<Link>` — ολοκληρώθηκε (lint + build περνάνε, εκκρεμεί real-browser check)

### Τι άλλαξε
Τα "cards" που πριν έκαναν `navigate()` μέσα από `onClick` έγιναν πραγματικά `<Link>` (React Router), ώστε right-click/"open in new tab"/ctrl+click να δουλεύουν κανονικά, και να υπάρχει ορατό/crawlable `href`:

- **`src/components/Merch/CategoryGrid.jsx`** — τα δύο category tiles (New Arrivals + οι υπόλοιπες κατηγορίες) έγιναν `<Link to="/merch/category/:key">` αντί για `<button onClick={onSelect}>`. Το prop `onSelect` αφαιρέθηκε εντελώς.
- **`src/components/Merch/MerchCategoriesRoute.jsx`** — αφαιρέθηκε το `useNavigate`/`onSelect` callback που δεν χρειάζεται πια.
- **`src/components/Merch/ProductList.jsx`** — το κουμπί "Γρήγορη αγορά" έγινε `<Button asChild><Link to="product/:id">...</Link></Button>` — **Radix `Slot` pattern** (`asChild`), ίδιο με `DialogTrigger`/`DialogClose asChild` που ήδη χρησιμοποιεί το project, ώστε να κρατήσει το ίδιο styling ως πραγματικό `<a>`. Το prop `onQuickBuy` αφαιρέθηκε.
- **`src/components/Merch/MerchCategoryRoute.jsx`** — αφαιρέθηκε το `handleQuickBuy`/`useNavigate` που δεν χρειάζεται πια.
- **`src/components/Events/EventsList.jsx`** — το κουμπί "Ticket" έγινε `<Link to="event/:id">` αντί για `<button onClick={navigate}>`. Αφαιρέθηκε το `useNavigate`.

**Εκτός scope (σκόπιμα, εκτός του "ProductList/EventsList" wording):** το `onQuickBuy` που ξεκινάει από `Header.jsx` → `TenantTopBar` → `FavoritesDialog`/search (άνοιγμα `/merch/product/:id` απευθείας από αγαπημένα/search/καλάθι) παραμένει `navigate()`-based — διαφορετικό, ξεχωριστό κομμάτι, δεν το αγγίξαμε.

### Bug-check πριν παρουσιαστεί
- Επιβεβαιώθηκε ότι το shadcn `Button` (`src/components/ui/button.jsx`) υποστηρίζει ήδη `asChild` μέσω `Slot.Root` (`radix-ui`) — δεν εφευρέθηκε νέο pattern.
- `grep` για stray αναφορές σε `onQuickBuy`/`onSelect`/`handleQuickBuy` μετά τις αλλαγές — καμία σπασμένη αναφορά, μόνο το άσχετο `TenantTopBar`/`FavoritesDialog` κομμάτι (αναμενόμενο, εκτός scope).
- Ελέγχθηκε ότι δεν υπάρχει nested-interactive-element bug (το favorite `<button>` είναι sibling, όχι nested μέσα στο νέο `<Link>`).
- **Lint:** καθαρό. **Build:** περνάει.
- **Δεν έγινε ακόμα:** πραγματικό click-test (right-click → "open in new tab", ctrl/cmd+click, hover-preview href) σε browser.

---

## Auth gate μετακινήθηκε στο ΑΝΟΙΓΜΑ του modal (όχι μόνο στην ενέργεια) — ρητή επιχειρηματική απόφαση

### Αλλαγή απόφασης (αντικαθιστά ό,τι έγραφε παραπάνω για "δημόσιο view")
Ο χρήστης ζήτησε ρητά: το login πρέπει να ζητείται μόλις πατηθεί το **"Ticket"** (event) ή το **"Γρήγορη αγορά"** (merch) — δηλαδή στο ΑΝΟΙΓΜΑ του modal, όχι μόνο στην "Επιλογή"/"Προσθήκη στο καλάθι" μέσα σε αυτό. Αιτιολογία του χρήστη: fan ownership = **global signup σε όλο το Concerto** (ένα Supabase Auth, κοινό σε όλα τα tenants — ήδη έτσι σχεδιασμένο, βλ. κύριο brief). Αυτό αντιστρέφει το προηγούμενο "δημόσιο view, guard μόνο στην ενέργεια" pattern που είχε τεκμηριωθεί στο Merch section παραπάνω.

**⚠️ Επίπτωση που επισημάνθηκε στον χρήστη:** ένα κοινοποιημένο link προϊόντος/event δεν δείχνει πλέον τίποτα δημόσια σε μη συνδεδεμένο επισκέπτη (τιμή, τύπους εισιτηρίων, φωτογραφίες) — ζητάει login αμέσως. Το marketing use case ("στείλε link σε φίλο") παραμένει (το link ανοίγει σωστά μετά το login, χάρη στο ίδιο OAuth `redirectTo` pattern), αλλά ο επισκέπτης δεν βλέπει preview πριν συνδεθεί. Ρητή, ενημερωμένη επιλογή του χρήστη.

### Υλοποίηση
- **`src/components/Events/EventModalRoute.jsx`** και **`src/components/Merch/ProductModalRoute.jsx`** — προστέθηκε `useEffect(() => { if (!isLoggedIn) onRequireAuth() }, [isLoggedIn, onRequireAuth])` πριν το render του dialog, και `if (!isLoggedIn) return null` (δεν κάνουμε redirect/`navigate` — μένουμε στο ΙΔΙΟ URL, ώστε το OAuth `redirectTo` να φέρει τον χρήστη πίσω ακριβώς εδώ μετά το login, ίδιο pattern με το ήδη υπάρχον cart guard).
- Το guard μέσα στο `TicketDialog`/`ProductQuickShop` (στην "Επιλογή"/"Προσθήκη στο καλάθι") **παρέμεινε** — δεύτερο επίπεδο άμυνας (π.χ. αν λήξει session ενόσω το modal είναι ήδη ανοιχτό), δεν είναι πλέον το μόνο σημείο ελέγχου.
- Καθαρίστηκαν temporary `console.log` debug statements που είχαν μπει προσωρινά για διάγνωση πριν διευκρινιστεί ότι δεν ήταν bug αλλά αλλαγή requirement.

### Verification
- **Lint:** καθαρό, μηδέν errors/warnings.
- **Build:** περνάει.
- **Δεν έγινε ακόμα:** browser click-test της νέας συμπεριφοράς (αποσυνδεδεμένος, πάτα Ticket/Γρήγορη αγορά, δες ότι ζητάει login πριν δείξει τίποτα, μετά login γύρνα στο ίδιο modal ανοιχτό).

### ⚠️ ΑΝΑΙΡΕΘΗΚΕ — γύρισε στο "δημόσιο view" pattern
Μόλις επισημάνθηκε το trade-off (χάνεται το δημόσιο preview σε shared link), ο χρήστης αποφάσισε να μείνει στο **αρχικό** pattern: το άνοιγμα του modal είναι δημόσιο, το guard μπαίνει μόνο στην ενέργεια ("Επιλογή"/"Προσθήκη στο καλάθι") — δηλαδή ΟΠΩΣ ήταν πριν από αυτή την ενότητα. Το `EventModalRoute.jsx`/`ProductModalRoute.jsx` επανήλθαν στην προηγούμενη μορφή τους (αφαιρέθηκε το `useEffect` gate). Lint+build ξαναπέρασαν, ίδιο bundle hash με πριν την αλλαγή — επιβεβαιώνει ότι το revert είναι ακριβές.

**Μάθημα για του λοιπού (σημειώνεται ρητά εδώ):** όταν μια αλλαγή έχει σημαντική επίπτωση αλλού (εδώ: marketing/shareable-link value), το trade-off πρέπει να ειπωθεί ΠΡΙΝ την υλοποίηση, όχι μετά — ίδιο πνεύμα με τον Κανόνα #2/#5 στην κορυφή αυτού του εγγράφου.

## Slug migration — ολοκληρώθηκε (κώδικας), εκκρεμεί το SQL να τρέξει ο χρήστης

### Αποφάσεις (συζητήθηκαν ΠΡΙΝ την υλοποίηση, με τον χρήστη)
- **Μεταγραφή Ελληνικά → Λατινικά** για το slug (π.χ. "Καλοκαιρινό Φεστιβάλ" → `kalokairino-festival`), όχι raw ελληνικοί χαρακτήρες στο URL. Επιλογή του χρήστη.
- **Backward compatibility, ρητό αίτημα του χρήστη** ("θέλω να τελειώσω με αυτό και να μην το ξαναπιάσω"): το route δέχεται είτε UUID (παλιά links, ήδη δοκιμασμένα σήμερα σε browser) είτε slug (νέα links) — dual lookup στο ίδιο route param, όχι ξεχωριστό legacy route.
- **Δημιουργία slug σε επίπεδο DB (Postgres trigger)**, όχι σε επίπεδο εφαρμογής: δεν υπάρχει ακόμα admin dashboard, τα rows μπαίνουν χειροκίνητα μέσω Supabase SQL editor — το trigger δουλεύει ανεξάρτητα από το πώς μπαίνει μια εγγραφή, τώρα ή στο μελλοντικό dashboard.
- **Uniqueness ανά tenant** (`UNIQUE(tenant_id, slug)`), όχι global — δύο διαφορετικά tenants μπορεί να έχουν προϊόν/event με ίδιο όνομα.
- Slug **δεν αλλάζει ποτέ μόνο του** όταν αλλάζει το name/title (μόνο explicit `UPDATE ... SET slug = NULL`) — προστατεύει τα ήδη κοινοποιημένα slug links.

### Υλοποίηση
- **Νέο SQL migration file**: `supabase/migrations/20260906075738_add_product_event_slugs.sql`. Περιέχει: `slugify(text)` function (Ελληνικά→Λατινικά, NFC normalize πρώτα για precomposed/decomposed input, πολυχαρακτηρικά θ/χ/ψ πριν το `translate()`), trigger functions `set_product_slug`/`set_event_slug` (`SECURITY DEFINER`, collision suffix `-2`/`-3`... ανά tenant), deterministic set-based backfill για τα υπάρχοντα rows, `NOT NULL` + `UNIQUE(tenant_id, slug)` + shape `CHECK` constraint σε κάθε table.
  - **⚠️ ΔΕΝ το έτρεξα εγώ** — δεν έχω δίκτυο/credentials από το sandbox προς το production Supabase project (ίδιος περιορισμός με το `git push` νωρίτερα). **Ο χρήστης πρέπει να το κάνει paste στο Supabase SQL editor μία φορά.** Sanity-check queries περιλαμβάνονται ως σχόλιο στο τέλος του αρχείου.
- **`src/lib/isUuid.js`** (νέο) — μικρό util, regex UUID detection, καμία νέα βιβλιοθήκη.
- **`src/components/Merch/ProductModalRoute.jsx`** / **`src/components/Events/EventModalRoute.jsx`** — το `.find()` γίνεται πλέον `isUuid(param) ? p.id === param : p.slug === param`. Τίποτα άλλο δεν άλλαξε (το `<Navigate to=".." replace />` fallback και το `location.key === "default"` detection δουλεύουν ήδη ανεξάρτητα).
- **`src/components/Merch/ProductList.jsx`** / **`src/components/Events/EventsList.jsx`** — τα `<Link>` δείχνουν πλέον σε `product.slug`/`event.slug` αντί για `.id`.
- **`src/components/Merch/CategoryGrid.jsx`** — καμία αλλαγή (επιβεβαιωμένο: δείχνει μόνο σε category keys, όχι μεμονωμένα προϊόντα).
- Route params `:productId`/`:eventId` στο `main.jsx` **δεν μετονομάστηκαν** (καθαρά cosmetic, ελαχιστοποίηση diff — ρητή επιλογή, όχι παράλειψη).
- Μηδέν νέο React Query hook/cache key — το `slug` έρχεται αυτόματα μέσω του ήδη υπάρχοντος `.select('*')`.

### Verification
- **Lint:** μηδέν νέα errors/warnings (τα 13 προϋπάρχοντα errors σε `src/components/ui/*` επιβεβαιώθηκαν άσχετα, ίδιος αριθμός πριν/μετά μέσω `git stash`).
- **Build:** περνάει.
- **Ο χρήστης έτρεξε το migration στο Supabase SQL editor — επιβεβαιώθηκε:** 0 rows με κενό/NULL slug σε products/events.

### 🐛 Bug εντοπίστηκε στην πράξη μετά το πρώτο run: λάθος μεταγραφή Β/β
Το `translate()` μέσα στο `slugify()` χαρτογραφούσε το ελληνικό **Β/β (βήτα) σε "b"** αντί για το σωστό **"v"** (στα νέα ελληνικά το βήτα προφέρεται "v" — π.χ. Βασίλης → Vasilis). Εντοπίστηκε από τον χρήστη στο πραγματικό αποτέλεσμα: το προϊόν "Villagers - Live at Gazi (**Βινύλιο**)" έβγαλε slug `villagers-live-at-gazi-binylio` αντί για το σωστό `...-vinylio`. Όλα τα υπόλοιπα γράμματα ελέγχθηκαν ξεχωριστά μετά (έναντι του ELOT 743/κοινής χρήσης μεταγραφής) και είναι σωστά.

**Διόρθωση:** νέο migration file `supabase/migrations/20260906081515_fix_slugify_beta_transliteration.sql` — διορθώνει το `slugify()` (`CREATE OR REPLACE FUNCTION`) και μηδενίζει το `slug` σε ΟΛΑ τα products/events ώστε το trigger να τα ξαναφτιάξει σωστά (ασφαλές: κανένα slug link δεν έχει μοιραστεί ακόμα δημόσια εκτός του σημερινού testing). Διορθώθηκε επίσης το αρχικό migration file (`20260906075738_...sql`) ώστε να είναι σωστό από την αρχή σε τυχόν μελλοντικό fresh-DB run.

### 🐛 Δεύτερο fix, κατόπιν ρητού αιτήματος του χρήστη: δίφθογγοι αυ/ευ/ου
Ο χρήστης ζήτησε να διορθωθεί και ο περιορισμός που είχε ήδη επισημανθεί (βλ. παραπάνω): το `slugify()` δεν χειριζόταν τους διφθόγγους **αυ/ευ** (προφέρονται "v" πριν από φωνήεν/ηχηρό σύμφωνο, αλλιώς "f") ούτε το **ου** (καθιερωμένη μεταγραφή "ou", όχι "oy"). Νέο migration file: `supabase/migrations/20260906082334_fix_slugify_au_eu_ou_digraphs.sql` — προσθέτει τρία `regexp_replace` βήματα πριν το υπάρχον `translate()`, χρησιμοποιώντας bracket character classes (π.χ. `[αΑ][υύΥΎ]`) αντί για case-insensitive regex flag, ώστε να μη βασίζεται σε Unicode case-folding που εξαρτάται από το locale της βάσης (ίδια λογική ασφάλειας με το ήδη υπάρχον `translate()`). Σωστά αγνοεί το "οϋ"/"αϋ" με διαλυτικά (εκεί τα φωνήεντα προφέρονται σκόπιμα ξεχωριστά, όχι ως δίφθογγος). Ίδιο μηδενισμό+regenerate των slugs όπως στο πρώτο fix. Ενημερώθηκε και το αρχικό migration file (`20260906075738_...sql`) για μελλοντικό fresh-DB setup.

**Verification πριν παρουσιαστεί:** προσομοίωση της ίδιας λογικής σε Python πάνω σε 15 δοκιμαστικές λέξεις (τα 5 ήδη υπάρχοντα ονόματα προϊόντων/events + 10 γνωστές ελληνικές λέξεις με αυ/ευ/ου σε διαφορετικά συμφραζόμενα: Ελευθερία, Αύγουστος, Αυγή, παύω, ούζο, Χριστούγεννα, αυτός, Θεσσαλονίκη, Ψυχή) — όλα σωστά, καμία παλινδρόμηση στα ήδη σωστά slugs.
- **✅ Επιβεβαιώθηκε σε πραγματικό browser από τον χρήστη:** νέο slug link προϊόντος (`/merch/product/villagers-t-shirt-black`), παλιό UUID link ίδιου προϊόντος, και UUID/slug link event — όλα ανοίγουν σωστά το ίδιο modal. **Slug migration — πλήρως ολοκληρωμένο.**

## EventInfoDialog → URL (ολοκληρώθηκε)

### Τι άλλαξε
Το "Info" modal στα event cards άνοιγε ως τοπικό `<Dialog>` state (μέσα στο ίδιο το `EventInfoDialog.jsx`, με δικό του `DialogTrigger`), χωρίς δικό του URL — τελευταίο κομμάτι που είχε μείνει εκτός routing από το αρχικό scope.

- **`src/main.jsx`** — νέο **sibling** child route κάτω από `events`: `{ path: 'event/:eventId/info', element: <EventInfoRoute /> }`, δίπλα στο ήδη υπάρχον `event/:eventId` (Ticket). Sibling και όχι nested μέσα στο ticket route, ώστε το Info να ανοίγει απευθείας πάνω στη λίστα χωρίς να περνάει από το Ticket modal.
- **`src/components/Events/EventInfoRoute.jsx`** (νέο) — ίδιο pattern με το `EventModalRoute.jsx`: `useEvents(tenantId)`, `isUuid()` dual lookup (UUID ή slug), `<Navigate replace />` fallback σε σπασμένο link, `location.key === "default"` detection. Μοναδική διαφορά: επειδή το route είναι ένα επίπεδο πιο βαθιά (`event/:eventId/info`), χρησιμοποιεί `"../.."` αντί για `".."` ώστε να γυρίζει στη λίστα events και όχι στο ticket route. Καμία ανάγκη για auth gate — το Info είναι καθαρά πληροφοριακό, καμία ενέργεια αγοράς.
- **`src/components/Events/EventInfoDialog.jsx`** — μετατράπηκε σε controlled dialog (`open`/`onOpenChange` props), ίδιος μετασχηματισμός με το `TicketDialog` νωρίτερα σήμερα. Αφαιρέθηκε το εσωτερικό `DialogTrigger`/button.
- **`src/components/Events/EventsList.jsx`** — το κουμπί "Info" έγινε πραγματικό `<Link to="event/:slug/info">` (ίδιο μοτίβο με Ticket), αντί να καλεί `<EventInfoDialog>` inline.

### Verification
- `grep` για stray αναφορές σε `EventInfoDialog` — μόνο οι αναμενόμενες (`EventInfoRoute.jsx` import/χρήση, και το ίδιο το component file). Καμία σπασμένη αναφορά.
- **Lint:** μηδέν νέα errors (ίδια 13 προϋπάρχοντα σε `ui/*`).
- **Build:** περνάει.
- **Δεν έγινε ακόμα:** browser click-test του νέου Info link (άνοιγμα/κλείσιμο, right-click/"open in new tab", back-button).

### 🐛 Bug εντοπίστηκε από τον χρήστη στο browser test: λάθος `".."` υπολογισμός
Άνοιγμα του `/events/event/<slug>/info` σε νέο tab (shared-link, `cameFromSharedLink = true`) και κλείσιμο (X) πήγαινε στο **`/`** (ρίζα) αντί για το **`/events`** (λίστα). Αιτία: υπέθεσα ότι το relative `".."` του React Router μετράει `/` στο URL string, οπότε επειδή το path `event/:eventId/info` έχει ένα επιπλέον segment σε σχέση με το `event/:eventId`, έβαλα `"../.."`. Λάθος υπόθεση — το React Router μετράει βάθος **route-tree**, όχι URL segments: το `EventInfoRoute` είναι sibling child του `events` route (ίδιο βάθος με το `EventModalRoute`), άρα ένα `".."` αρκεί, ό,τι κι αν λέει το path string. Διορθώθηκε (`"../.."` → `".."`, και στα δύο σημεία: `handleClose` και το `<Navigate>` fallback). Lint+build ξαναπέρασαν.

## Home tab ("Πληροφορίες") → ονομασμένο route `/about` (ολοκληρώθηκε)

### Γιατί
Ο χρήστης θα πουλήσει το Concerto σε tenant/venue managers (όχι μόνο μπάντες). Το home tab ήταν ήδη route, αλλά ως **ανώνυμο index route στο `/`** — χωρίς δικό του, ορατό/μοιράσιμο όνομα path, σε αντίθεση με `/merch`/`/events`. Ζητήθηκε ρητά όνομα route, με τον χρήστη να ζητάει από εμένα πρόταση. Πρότεινα `/about` (καθιερωμένη σύμβαση "About" σε κάθε site, ουδέτερο σε band/venue/festival tenant) — εγκρίθηκε.

### Υλοποίηση
- **`src/main.jsx`** — το index route (`/`) έγινε `<Navigate to="/about" replace />` (redirect, όχι 404 — το γυμνό domain συνεχίζει να δείχνει το ίδιο περιεχόμενο). Νέο route `{ path: 'about', element: <InfoRoute /> }` κάνει το πραγματικό rendering.
- **`src/components/Header/Header.jsx`** — το `handleTabClick` για το tab "Πληροφορίες" κάνει πλέον `navigate('/about')` απευθείας (όχι `navigate('/')` + redirect hop). Το `activeTab` logic **δεν χρειάστηκε αλλαγή** — το `/about` ήδη πέφτει στο else-branch (ούτε `/merch*` ούτε `/events*`), ίδιο αποτέλεσμα με πριν.
- Το `<Link to="/">` στο `ErrorPage.jsx` ("← Αρχική σελίδα") **δεν άλλαξε** — συνεχίζει να δουλεύει σωστά μέσω του ίδιου redirect.
- **Εκτός scope, σκόπιμα:** το component/folder `BandInfo` (`src/components/BandInfo/`) παραμένει ως έχει — η ονομασία είναι band-specific, κάτι που ίσως αξίζει rename αργότερα (π.χ. σε `About`) μιας και θα πουληθεί και σε venues, αλλά ο χρήστης ζήτησε συγκεκριμένα το route name, όχι refactor του component/folder. Flagged για μελλοντική συζήτηση, όχι πειραγμένο τώρα.

### Verification
- **Lint:** μηδέν νέα errors. **Build:** περνάει.
- Το redirect χρησιμοποιεί `replace: true`, άρα το `/` δεν μπαίνει στο browser history — το back-button δεν κολλάει σε redirect loop.
- **✅ Επιβεβαιώθηκε σε πραγματικό browser από τον χρήστη:** `villagers.concerto.gr/` κάνει redirect σε `/about`, το tab "Πληροφορίες" δείχνει `/about` στη γραμμή διεύθυνσης και είναι highlighted.

## Πλήρες browser testing (ολοκληρώθηκε, αυτόματα μέσω Claude in Chrome)

Ο χρήστης συνέδεσε το Claude in Chrome extension (το built-in browser pane δεν έβλεπε το `/etc/hosts` του μηχανήματος, οπότε δεν μπορούσε να τεστάρει tenant subdomains — το πραγματικό Chrome δουλεύει κανονικά). Πλήρες αυτόματο pass πάνω στο live dev server (`npm run dev`, villagers.concerto.gr:5173 / athensrock.concerto.gr:5173):

- **`/` → `/about` redirect**: ✅ δουλεύει, σωστό περιεχόμενο.
- **Merch**: κατηγορίες → λίστα προϊόντων → product modal μέσω slug URL (`.../product/villagers-t-shirt-black`) → **back-button** κλείνει το modal και γυρνάει στη λίστα (όχι έξω από το site). ✅
- **Events**: Ticket modal μέσω slug URL → **back-button** ✅. Info modal μέσω slug URL, **σε νέο tab (shared-link σενάριο)** → X-close πάει σωστά στο `/events` — **επιβεβαιώθηκε το σημερινό "../.." → ".." bugfix**. ✅
- **404**: άγνωστο path → σωστή ErrorPage. ✅
- **Cross-tenant isolation**: `athensrock.concerto.gr` δείχνει διαφορετικό branding (λογότυπο/όνομα "Athens Rock Festival"), μηδέν διαρροή δεδομένων από το villagers — άδειες κατηγορίες merch, "Δεν υπάρχουν events αυτή τη στιγμή" (το tenant αυτό δεν έχει events/προϊόντα seed data, σωστά isolated). Παρατήρηση εκτός scope: το bio κείμενο στο "Πληροφορίες" είναι πανομοιότυπο και στα δύο tenants — φαίνεται seed/test data συνήθεια, όχι routing bug, δεν πειράχτηκε.
- **Mobile viewport** (390×844): `/about` και το product modal renders καθαρά, responsive. ✅
- **Λογική "public view, gate μόνο στην ενέργεια"** (η σημερινή αρχική απόφαση): σε αποσυνδεδεμένη κατάσταση, το product/ticket modal ανοίγει δημόσια, αλλά "Προσθήκη στο καλάθι" ΚΑΙ "Επιλογή" (ticket) ενεργοποιούν σωστά το auth-gate dialog ("Σύνδεση — Συνέχεια με Google"). ✅ Επιβεβαιώνει ότι το αρχικό pattern (πριν το revert που έγινε νωρίτερα σήμερα) παραμένει σωστό.

**Δεν καλύφθηκε πλήρως:** literal Incognito/Private window (το Chrome προφίλ που χρησιμοποιήθηκε ήταν ήδη αποσυνδεδεμένο, που λειτουργικά καλύπτει το ίδιο σενάριο, αλλά δεν είναι κυριολεκτικά νέο προφίλ/session). Right-click "open in new tab" σε cards δεν ξαναδοκιμάστηκε αυτόματα (ήδη επιβεβαιωμένο χειροκίνητα από τον χρήστη νωρίτερα σήμερα για CategoryGrid/ProductList/EventsList).

## Εξαρτήσεις
- Το routing epic (Σάββατο 5/9 → Κυριακή 6/9) είναι πλέον πλήρως ολοκληρωμένο, δοκιμασμένο, **committed και pushed**. Commit `be03c85` ("nai as kanoume ena kalo commit..."), push επιβεβαιωμένο από τον χρήστη (`a672ce5..be03c85 main -> main`). Ξεκινά το Checkout/reservation flow όποτε αποφασίσει ο χρήστης (μεγάλο task, χτίζεται πάνω σε αυτό το routing).

## Tenant types (artist/venue/festival) + polymorphic `/about` — ολοκληρώθηκε (lint + build περνάνε, εκκρεμεί browser verification)

### Απόφαση
Πέρα από artist tenants (μπάντες), η πλατφόρμα θα φιλοξενεί και venue/live-stage και festival tenants (βλ. `concerto-business-venue-partnerships-brief.md`). Αποφασίστηκε ρητό πεδίο `tenants.type` (`artist`/`venue`/`festival`, check constraint — ίδιο πνεύμα με `products.category`) αντί για καθαρά data-driven inference, γιατί με 3 τύπους και πολλαπλά type-specific sections η εικασία από απουσία δεδομένων γίνεται εύθραυστη (και χρειάζεται ρητό type ούτως ή άλλως για το μελλοντικό Tenant Admin Dashboard/cross-listing UI). Ξεχωριστό, καθαρά διακοσμητικό πεδίο `tenant_settings.category_label` (ελεύθερο κείμενο, π.χ. "Μουσικό Συγκρότημα"/"DJ"/"Live Stage"/"Φεστιβάλ") κρατάει το `type` μικρό/σταθερό χωρίς να χρειάζεται νέο enum value ή migration για κάθε νέο "είδος" tenant. **Ρητός κανόνας:** το `category_label` δεν μπαίνει ΠΟΤΕ σε λογική απόφασης/`if` — μόνο το `type` αποφασίζει ποιο section φορτώνει.

### Migration (έτρεξε ο χρήστης στο Supabase SQL editor, 7/9)
```sql
alter table tenants add column type text not null default 'artist'
  check (type in ('artist', 'venue', 'festival'));
update tenants set type = 'festival' where slug = 'athens-rock';

alter table tenant_settings add column gallery_urls text[] not null default '{}';
alter table tenant_settings add column category_label text;
update tenant_settings set category_label = 'Μουσικό Συγκρότημα' where tenant_id = (select id from tenants where slug = 'villagers');
update tenant_settings set category_label = 'Φεστιβάλ' where tenant_id = (select id from tenants where slug = 'athens-rock');
```
Επιβεβαιώθηκε από τον χρήστη: `villagers` → `type='artist'`, `athens-rock` → `type='festival'`, `category_label` σωστά και στα δύο.

### Component/data layer
- **`src/queries/useTenant.js`** — το `tenants` sub-select έκανε explicit `id, name, slug` (όχι `select('*')`), οπότε το νέο `type` δεν θα περνούσε καθόλου στο frontend χωρίς αλλαγή· προστέθηκε ρητά.
- **`src/components/BandInfo/` → `src/components/About/`** (`git mv`, φάκελος) — ταιριάζει πλέον με το route name `/about`.
- **`BandInfo.jsx` → `TenantAbout.jsx`** (rename, ίδιο περιεχόμενο) — γενικό όνομα· το component μένει hardcoded test-data κείμενο όπως πριν (εκτός scope, ήδη τεκμηριωμένο στο κύριο brief).
- **Νέο `LocationGallery.jsx`** (ονομάστηκε `VenueGallery.jsx` αρχικά, μετονομάστηκε — βλ. παρακάτω) — ίδιο πνεύμα με `BandMembers.jsx` (τίτλος+subtitle+grid, καθαρά data-driven: `null` αν άδειο `gallery_urls`), αλλά ξεχωριστό component από το `BandMembers` γιατί το layout είναι πραγματικά διαφορετικό (ορθογώνιες φωτογραφίες χώρου, όχι στρογγυλά avatar προσώπων με όνομα/ρόλο).
- **`InfoRoute.jsx`** — `bandBio`→`tenantBio` context rename, νέο `tenantType`/`galleryUrls` από context. Ένα μόνο branching point πάνω σε `tenantType`: `artist` → `<TenantAbout />` + `<BandMembers members={members} />` (το query ενεργοποιείται μόνο όταν `tenantType === 'artist'`, `useBandMembers(tenantType === 'artist' ? tenantId : null)` — αποφεύγει άσκοπο query για venue/festival tenants)· `venue` **ή** `festival` → `<LocationGallery photos={galleryUrls} />` (και τα δύο έχουν φυσικό χώρο άξιο φωτογράφισης — αναθεωρήθηκε την ίδια μέρα, βλ. παρακάτω).
- **`Header.jsx`** — `bandBio`/`bandName`/`bandLogo`/`bandCover` local variables → `tenantBio`/`tenantName`/`tenantLogo`/`tenantCover` (καθαρά cosmetic, καμία εξωτερική επίπτωση). Το hardcoded `<p>Καλλιτέχνης</p>` κάτω από το tenant name έγινε `{settings?.category_label && <p>{settings.category_label}</p>}` — δυναμικό, κρύβεται αν δεν έχει οριστεί.
- **`main.jsx`** — ενημερώθηκε το import path του `InfoRoute` μετά το folder rename. Καμία αλλαγή routes.

### Revision αυθημερόν: `VenueGallery` → `LocationGallery`, και το festival παίρνει gallery
Αρχικά το gallery είχε σχεδιαστεί μόνο για `venue`. Ο χρήστης επισήμανε ότι ένα festival γίνεται επίσης κάπου (φυσικός χώρος), άρα έχει το ίδιο νόημα να δείχνει φωτογραφίες χώρου. Αντί για δεύτερο, σχεδόν πανομοιότυπο component, το `VenueGallery.jsx` μετονομάστηκε σε `LocationGallery.jsx` (ίδιο πνεύμα με το `BandInfo`→`TenantAbout` rename — δεν κρατάμε "leaky" όνομα δεμένο σε έναν μόνο τύπο tenant), και το `InfoRoute.jsx` το εμφανίζει πλέον για `venue` ΚΑΙ `festival`. Καμία αλλαγή στη βάση χρειάστηκε.

### DJ / μεμονωμένος καλλιτέχνης (συζητήθηκε, καμία νέα δουλειά)
Ρητά αποφασίστηκε ότι DJ/solo artist χρησιμοποιεί το ΙΔΙΟ `BandMembers` component/`band_members` table με τη μπάντα — ίδια πεδία (φωτογραφία/όνομα/ρόλος), απλά 1 row αντί για πολλά. Καμία ειδική περίπτωση κώδικα, καμία νέα table.

### Verification
- **Lint:** `npx eslint src/` — μηδέν νέα errors (ίδια 13 προϋπάρχοντα σε `src/components/ui/*`, επιβεβαιωμένα άσχετα).
- **Build:** `npm run build` περνάει καθαρό.
- **Δεν έγινε ακόμα:** browser test (`villagers.concerto.gr/about` δείχνει σωστά bio+members· δοκιμαστικό tenant με `type='venue'` δείχνει gallery αντί για members· `type='festival'` δείχνει μόνο bio).
- **Δεν έγινε commit.**

### Επόμενο (ανοιχτό, εκτός σημερινού scope)
Επιπλέον custom tabs ανά τύπο tenant (π.χ. `/lineup`, `/φωτογραφίες-παλιού-φεστιβάλ` για festival) — μεγαλύτερο, ξεχωριστό θέμα (αλλαγή στο πώς υπολογίζονται τα tabs στο `Header.jsx`, σήμερα σταθερά 3 για όλους). Αναβλήθηκε ρητά μέχρι να υπάρξει συγκεκριμένη ανάγκη, αντί να χτιστεί πρόωρα κάτι γενικό.

---

## Bug: "zombie session" μετά από διαγραφή λογαριασμού σε άλλο subdomain — ΕΚΚΡΕΜΕΙ (7/9, pausing για δουλειά)

### Σενάριο (αναπαράχθηκε 2 φορές από τον χρήστη)
1. Σύνδεση με Google σε δύο tenant subdomains ταυτόχρονα (π.χ. `athensrock.concerto.gr` και `villagers.concerto.gr`) — κάθε subdomain έχει δικό του, ξεχωριστό `localStorage` session (προϋπάρχων, τεκμηριωμένος περιορισμός· βλ. `concerto-brief.md`).
2. Διαγραφή λογαριασμού (νέο feature σήμερα, `delete_own_account()` RPC) από το ένα subdomain — δουλεύει σωστά εκεί.
3. Στο άλλο subdomain, το session είναι πλέον "ζόμπι": τοπικά ακόμα "συνδεδεμένο" (JWT δεν έχει λήξει χρονικά), αλλά το υποκείμενο `auth.users` row έχει διαγραφεί.

### Πρώτος γύρος fix (ήδη στο `useFanSession.js`) — ΔΕΝ αρκεί
Προστέθηκε detection του Postgres error `23503` (FK violation) στο `fans` upsert, με fallback σε `supabase.auth.signOut({ scope: "local" })` για να καθαρίσει το τοπικό session χωρίς περιττό server round-trip.

**Ο χρήστης δοκίμασε ξανά το ίδιο σενάριο (διαγραφή από athensrock ΚΑΙ villagers) και το bug επιμένει.** Νέο στοιχείο από το console:
```
POST .../rest/v1/fans?on_conflict=id            409 (Conflict)   ← ίδιο όπως πριν
POST .../auth/v1/logout?scope=local             403 (Forbidden)  ← ΝΕΟ
```
Δηλαδή το ίδιο το `signOut({ scope: "local" })` που έγραψα ως "self-healing" fallback αποτυγχάνει με 403 — άρα, αντίθετα με ό,τι υπέθεσα, το `scope: "local"` ΔΕΝ είναι καθαρά τοπικό (χωρίς server call)· κάνει network request στο `/auth/v1/logout`, και ο server το απορρίπτει με 403 επειδή το access token αναφέρεται πλέον σε ανύπαρκτο user. Χρειάζεται να επαληθευτεί με πραγματικό network trace / source του `@supabase/supabase-js` (όχι υπόθεση) τι ακριβώς κάνει το `signOut` με `scope:"local"` σε αυτή την έκδοση, και αν αυτό το 403 μπλοκάρει το `_removeSession()`/local cleanup ή απλά πετάει exception ενώ το τοπικό storage μένει βρώμικο.

### Κατάσταση
- Ο χρήστης έχει σταματήσει εδώ για δουλειά· ρητά ζήτησε να «το λύσουμε μια και καλή» σε επόμενο πέρασμα, όχι βιαστικό patch τώρα.
- Παραμένει σε ισχύ το χειροκίνητο workaround: `localStorage.clear()` στο affected subdomain + refresh.
- Καμία περαιτέρω αλλαγή κώδικα έγινε μετά το πρώτο (ανεπαρκές) fix.

### Επόμενα βήματα όταν ξαναπιάσουμε το θέμα
1. Επαλήθευση πραγματικής συμπεριφοράς του `supabase.auth.signOut({scope:"local"})` σε αυτή την έκδοση του `@supabase/supabase-js` (source ή network trace), όχι υπόθεση.
2. Πιθανή λύση: αν το session/token είναι ήδη άκυρο server-side, δεν έχει νόημα να καλέσουμε server-based signOut καθόλου — ίσως χρειάζεται καθαρισμός καθαρά τοπικού storage (χωρίς κανένα network call), π.χ. χειροκίνητο clear του σχετικού Supabase auth key από το `localStorage`, ή έλεγχος αν υπάρχει flag/παράμετρος που αποτρέπει το server call.
3. Να ελεγχθεί αν το ίδιο pattern (FK violation → πιθανό ζόμπι session) χρειάζεται προστασία και σε `useCart.js`/`useFavorites.js`.
4. Πλήρες browser verification, μετά documentation εδώ, μετά commit (αν ζητηθεί).

### Update (ίδια μέρα, 7/9): Υλοποιήθηκε global login (shared cookie σε *.concerto.gr) — λύνει το bug στη ρίζα

Αντί να κυνηγάμε το `signOut({scope:"local"})` 403 patch-πάνω-σε-patch, αποφασίστηκε (με τον χρήστη, βλ. `concerto-business-venue-partnerships-brief.md` § "Custom Domains vs Subdomains + Global SSO") να υλοποιηθεί η ήδη τεκμηριωμένη "δωρεάν" λύση: **shared session cookie με `Domain=.concerto.gr`**, αντί για το προεπιλεγμένο `localStorage` του Supabase client (που είναι per-origin — αυτό ήταν η πραγματική ρίζα του zombie-session bug, όχι κάτι που διορθώνεται με πιο έξυπνο error handling).

**Δεν είναι το ίδιο με το `concertofamily.gr` redirect bridge** (εκείνο παραμένει ρητά αναβεβλημένο, για ΜΕΛΛΟΝΤΙΚΑ custom domains όπως `villagers.gr`) — αυτό εδώ αξιοποιεί ότι όλα τα σημερινά tenants είναι ήδη `*.concerto.gr` subdomains, άρα ένα domain-scoped cookie αρκεί, καμία επιπλέον υποδομή.

**Νέα αρχεία/αλλαγές:**
- **`src/lib/cookieStorage.js`** (νέο) — custom storage adapter (`getItem`/`setItem`/`removeItem`) που ο Supabase client καλεί αντί για `localStorage`. Γράφει cookie με `Domain=.concerto.gr; Path=/; SameSite=Lax` (+ `Secure` όταν https)· σε localhost/Netlify preview δεν μπαίνει `Domain` (host-only cookie, ίδια συμπεριφορά με πριν, ώστε να μη σπάσει το dev). Το session JSON (access+refresh token+user object) μπορεί να ξεπεράσει το ~4KB όριο ενός cookie (ειδικά με μεγάλο Google `user_metadata`) — γίνεται **chunking** σε `key.0`, `key.1`, ... πολλαπλά cookies όταν χρειάζεται, ίδιο threshold/μοτίβο με το επίσημο `@supabase/ssr` πακέτο (αντιμετωπίζει ακριβώς αυτό το πρόβλημα).
- **`src/lib/supabase.js`** — προστέθηκε `auth: { storage: cookieStorage }` στο `createClient(...)`.

**Τι σημαίνει αυτό για το zombie-session bug:** πλέον υπάρχει **ένα** session, μοιρασμένο σε όλα τα subdomains — όχι ένα ξεχωριστό ανά subdomain. Διαγραφή λογαριασμού σε ένα subdomain αδειάζει το ΙΔΙΟ cookie που βλέπουν όλα τα υπόλοιπα — δεν μπορεί να μείνει "ζόμπι" σε άλλο subdomain, γιατί δεν υπάρχει πια ξεχωριστό, τοπικό session εκεί. Το προηγούμενο `23503` detection/self-heal fallback στο `useFanSession.js` **έμεινε ως έχει** (defense-in-depth για άκρες περιπτώσεις — π.χ. πολλαπλά tabs, race condition κατά τη διαγραφή), αλλά δεν είναι πια η πρωτεύουσα άμυνα.

**Verification μέχρι τώρα:**
- `npx eslint src/lib/cookieStorage.js src/lib/supabase.js` — καθαρό.
- `npm run build` — περνάει καθαρό.
- **⚠️ ΔΕΝ έχει γίνει ακόμα browser verification** — κρίσιμο εδώ, μιας και είναι αλλαγή στο auth και είχαμε ήδη 2 φορές σήμερα bug από μη-επαληθευμένη υπόθεση. Πριν θεωρηθεί λυμένο, πρέπει να δοκιμαστεί πραγματικά: σύνδεση σε ένα subdomain → επίσκεψη άλλου subdomain χωρίς νέο login (πρέπει να είναι ήδη συνδεδεμένος) → διαγραφή λογαριασμού από το ένα → επίσκεψη του άλλου (πρέπει να εμφανίζεται αποσυνδεδεμένος, όχι 409/403 σφάλματα).
- **Υπάρχοντα, ήδη-συνδεδεμένα sessions σε παλιό `localStorage`** δεν μεταφέρονται αυτόματα στο νέο cookie-based storage — κάθε ήδη-συνδεδεμένος fan θα χρειαστεί ένα νέο sign-in μετά το deploy αυτής της αλλαγής. Αποδεκτό pre-launch, να ειπωθεί ρητά αν γίνει deploy.
- **Δεν έγινε commit.**
- Ανοιχτό follow-up (ξεχωριστό, όχι επείγον): αφαίρεση του παλιού localStorage-based "Σύνδεση"/"Ακολούθησε" patch στο `useFanSession.js`/`Header.jsx` (βλ. `concerto-brief.md` TODO #12) — τώρα περιττό αφού υπάρχει πραγματικό shared session, αλλά να επιβεβαιωθεί πρώτα ότι το cookie SSO δουλεύει σωστά στο browser πριν αφαιρεθεί το παλιό fallback.

---

## ConcertoGlobalBar — υλοποιήθηκε (7/9, ίδια μέρα με το cookie SSO)

Αυτό είναι το TODO #13 του κύριου brief ("ConcertoGlobalBar, Phase 2") — τραβήχτηκε νωρίτερα, αφού μόλις χτίστηκε το shared-cookie global login και είχε νόημα να αποκτήσει άμεσα ένα πραγματικό, ενιαίο login entry point.

### Απόφαση (με τον χρήστη, 4 ανοιχτά ερωτήματα πριν ξεκινήσει κώδικας)
1. **Νέος φάκελος `src/components/Concerto/`** — μόνο για global/cross-tenant κομμάτια (το bar τώρα, μελλοντικά ίσως directory/marketplace). Ο υπάρχων κώδικας tenant/venue/festival (About/Header/Merch/Events) μένει όπως είναι.
2. **Global bar = μόνη είσοδος login.** Αφαιρέθηκε το παλιό, per-tenant `AuthGateDialog` flow από το `Header.jsx`.
3. **Νέο, γενικό "Concerto"-branded login dialog** (όχι tenant-branded) — το παλιό `AuthGateDialog.jsx` **μένει στον φάκελο, αλλά αποσυνδεδεμένο** από παντού· θα δούμε στην πορεία αν ξαναχρησιμοποιηθεί ή αν διαγραφεί.
4. **Περιεχόμενο bar προς το παρόν: μόνο wordmark + login/avatar.** Καμία πλοήγηση ακόμα.

### Σημαντικό εύρημα κατά την υλοποίηση (διάβασα το Header.jsx πριν το αγγίξω, όχι από μνήμη)
Το "login trigger" δεν ήταν ένα απομονωμένο κουμπί — ήταν συνδεδεμένο σε **δύο** σημεία: το `handleFollowClick` (το κουμπί "Ακολούθησε"/"Σύνδεση" κάτω από το λογότυπο tenant) και το `requireAuth`/`onRequireAuth` (περνιέται μέσω `Outlet context` σε child routes, π.χ. πιθανό "πρόσθεσε στο καλάθι" όταν δεν είσαι συνδεδεμένος). Και τα δύο άνοιγαν το ίδιο τοπικό `AuthGateDialog`. Ο χρήστης το επιβεβαίωσε ρητά: να αποσυνδεθεί από **όλα** τα σημεία ενεργοποίησης, "θα δούμε στην πορεία". Άρα και τα δύο έγιναν προσωρινά no-op, με σχόλιο στον κώδικα.

**⚠️ Γνωστό, αποδεκτό, προσωρινό UX κενό:** ένας μη-συνδεδεμένος fan που πατάει "Ακολούθησε" ή κάνει κάτι που χρειάζεται login **δεν παίρνει πια τοπικό popup εκεί που βρίσκεται** — πρέπει πρώτα να ανέβει στο global bar και να συνδεθεί από εκεί. Ρητά αποδεκτό ρίσκο για τώρα, όχι λάθος.

### Νέα αρχεία
- **`src/components/Concerto/ConcertoBar.jsx`** — το ίδιο το bar. `bg-gray-900`, wordmark "Concerto" αριστερά, δεξιά: avatar (`user_metadata.avatar_url`, fallback `UserCircleIcon` από `@heroicons/react` — ίδια βιβλιοθήκη με το γειτονικό Header.jsx/TenantTopBar.jsx, για συνέπεια) αν συνδεδεμένος, αλλιώς κουμπί "Σύνδεση". Το avatar εδώ είναι **μόνο ένδειξη, όχι dropdown** — η διαχείριση λογαριασμού (αποσύνδεση/διαγραφή) μένει αποκλειστικά στο υπάρχον `TenantTopBar` κάθε tenant, καμία διπλή λειτουργικότητα.
- **`src/components/Concerto/ConcertoAuthDialog.jsx`** — ίδια δομή/components (`Dialog`+`Card`) με το παλιό `AuthGateDialog.jsx`, ίδιο Google sign-in call, αλλά χωρίς tenant-specific props (λογότυπο/cover/όνομα) — γενικό "Concerto" branding.

### Αλλαγές σε υπάρχοντα αρχεία
- **`src/App.jsx`** — `<ConcertoBar />` προστέθηκε ως sibling **πριν** το tenant `<div>` (άρα πάντα πάνω από το `<Header>`, εκτός tenant-branded background).
- **`src/components/Header/Header.jsx`** — αφαιρέθηκε το `import AuthGateDialog`, το `authGateOpen` state, το `<AuthGateDialog />` render. Το `handleFollowClick`/`requireAuth` έγιναν no-op (με σχόλιο). Το follow παραμένει αυτόματο μέσω `useFanSession` μόλις ο fan συνδεθεί.

### Καθαρισμός (βρέθηκε κατά τη δουλειά, όχι ζητηθέν αρχικά)
Βρέθηκε ένα **ξεχασμένο, ημιτελές `src/components/NavBar/NavBar.jsx`** (18/8, ποτέ δεν έγινε route/import πουθενά — επιβεβαιωμένο με grep) — ίδιο concept με το σημερινό bar, αλλά με `@headlessui/react`/`@heroicons/react` Dialog/hamburger-menu πλήρες πλέγμα (άχρηστο πλέον). **Διαγράφηκε** (νεκρός κώδικας, θα μπέρδευε μελλοντικό reader με δύο "NavBar" concepts). Bonus: το `@headlessui/react` ήταν το **μοναδικό** σημείο χρήσης του σε ολόκληρο το src (επιβεβαιωμένο με grep) — τώρα εντελώς αχρησιμοποίητο dependency· θα μπορούσε να αφαιρεθεί από το `package.json` σαν ξεχωριστό, μη-επείγον chore (δεν το άγγιξα).

### Ανοιχτές, δηλωμένες υποθέσεις (να επιβεβαιωθούν/αλλάξουν αν χρειάζεται)
- Το bar **δεν** είναι `sticky`/`fixed` — απλό, στατικό block στην κορυφή της σελίδας. Εύκολο να αλλάξει αν θέλει ο χρήστης πάντα-ορατό.
- Δεν υπάρχει ακόμα dedicated "Concerto" logo asset — text wordmark προς το παρόν.

### Verification
- `npx eslint` — καθαρό (πιάστηκε και διορθώθηκε ένα ορφανό `useState` import στο Header.jsx μετά την αφαίρεση του `authGateOpen`).
- `npm run build` — περνάει καθαρό.
- **⚠️ ΔΕΝ έχει γίνει browser verification** — κρίσιμο εδώ: login flow + follow flow + avatar εμφάνιση, σε τουλάχιστον 2 tenants.
- **Δεν έγινε commit.**

---

## ConcertoBar — round 2 (ίδια μέρα, 7/9): global avatar/account menu + auto-follow-all + global login από favorite/καλάθι/εισιτήριο

Τρία ξεχωριστά, ρητά ζητηθέντα αλλαγές, μαζί σε ένα πέρασμα:

### 1. Το account menu έγινε global-only
Το `TenantTopBar.jsx` (ανά tenant) είχε `DropdownMenu` πάνω στο avatar (Διαγραφή λογαριασμού/Αποσύνδεση, βλ. προηγούμενο session). Αφαιρέθηκε εντελώς — έμεινε **σκέτο `<img>`**, καμία λειτουργικότητα. Το `DeleteAccountDialog.jsx` μετακόμισε (`git mv`) από `Header/` σε `Concerto/` (δεν είχε καμία tenant-specific εξάρτηση — καθαρά global concern). Το `ConcertoBar.jsx` απέκτησε το ΙΔΙΟ `DropdownMenu` (Προφίλ/Παραγγελίες "σύντομα", Διαγραφή λογαριασμού, Αποσύνδεση) — ένα σημείο διαχείρισης λογαριασμού για όλη την πλατφόρμα, αντί για ένα ξεχωριστό dropdown ανά tenant. Το `Header.jsx` δεν περνάει πια `onSignOut` στο `TenantTopBar` (άχρηστο πλέον) — αφαιρέθηκε και το πλέον-αχρησιμοποίητο `import { supabase }` από εκεί.

### 2. Auto-follow-all-tenants στο login ("για αρχή", ρητά προσωρινό)
Νέο `src/queries/useFollowAllTenants.js` — καλείται από το `ConcertoBar` μόλις υπάρχει συνδεδεμένος fan (`isLoggedIn ? user : null`). Κάνει δικό του `fans` upsert (ανεξάρτητο από το `useFanSession` του τρέχοντος tenant — τα δύο τρέχουν παράλληλα, δεν υποθέτει σειρά εκτέλεσης) και μετά upsert `tenant_follows` για **ΟΛΑ** τα rows του `tenants` table σε ένα batch (`onConflict: "fan_id,tenant_id", ignoreDuplicates: true`, ίδιο μοτίβο ασφάλειας/idempotency με το υπάρχον). Ίδιο `23503` zombie-session self-heal με το `useFanSession.js`, για συνέπεια.

**Ρητά δηλωμένο ως πρόχειρη, προσωρινή λογική** — ο χρήστης το περιέγραψε ο ίδιος ως "για αρχή", με σαφή πρόθεση να ξαναδουλευτεί αργότερα (π.χ. πιο έξυπνο discovery/opt-in ανά tenant αντί για blanket follow-all). Δεν είναι λάθος/παράλειψη, είναι σκόπιμη απλοποίηση v1.

### 3. Global login trigger από favorite/καλάθι/εισιτήριο
Το `onRequireAuth` (Outlet context, ήδη καλείται από `ProductList.jsx` [favorite σε προϊόν], `ProductQuickShop.jsx` [προσθήκη στο καλάθι], `TicketDialog.jsx` [επιλογή εισιτηρίου] — επιβεβαιώθηκε με grep, όχι υπόθεση) ήταν no-op από το προηγούμενο πέρασμα σήμερα. Τώρα:
- Το `authOpen`/`setAuthOpen` state **ανέβηκε (lifted) στο `App.jsx`** — έπρεπε να είναι προσβάσιμο και από το `ConcertoBar` (δικό του κουμπί "Σύνδεση") και από το `Header`/child routes (favorite/καλάθι/εισιτήριο), άρα δεν μπορούσε να μείνει τοπικό σε κανένα από τα δύο.
- `App.jsx` περνάει `onRequireAuth={() => setAuthOpen(true)}` στο `Header`, και `authOpen`/`onAuthOpenChange` στο `ConcertoBar` (το οποίο συνεχίζει να renders το `ConcertoAuthDialog`).
- `Header.jsx` χρησιμοποιεί το ίδιο `onRequireAuth` prop και για το `handleFollowClick` (το κουμπί "Ακολούθησε" όταν δεν είσαι συνδεδεμένος) και το περνάει κατευθείαν στο Outlet context (`onRequireAuth,` shorthand, όχι πια ξεχωριστή τοπική `requireAuth` function).

**Αποτέλεσμα:** favorite σε προϊόν / προσθήκη στο καλάθι / επιλογή εισιτηρίου / "Ακολούθησε", όλα ανοίγουν πλέον το ΙΔΙΟ global `ConcertoAuthDialog`, από όπου κι αν βρίσκεται ο fan.

### Verification
- `npx eslint` — καθαρό.
- `npm run build` — καθαρό.
- **⚠️ ΔΕΝ έχει γίνει browser verification.** Ειδικά εδώ χρειάζεται πραγματικό τεστ: favorite/καλάθι/εισιτήριο ενώ αποσυνδεδεμένος ανοίγουν το σωστό dialog· μετά το login, ελέγχεται ότι το `tenant_follows` γέμισε για ΟΛΑ τα tenants (όχι μόνο το τρέχον)· το global avatar δείχνει σωστά menu, ενώ το per-tenant avatar είναι πλέον απλά εικόνα.
- **Δεν έγινε commit.**

---

## Bug: 401 στο `fans` upsert μετά το cookie SSO — μερικώς διερευνήθηκε (ίδια μέρα, 7/9)

Ο χρήστης ανέφερε επαναλαμβανόμενα `401 Unauthorized` στο `POST .../rest/v1/fans?on_conflict=id` (13 φορές στο console, ίδιο request). Δοκίμασα να ανοίξω τα δύο γνωστά subdomains (`villagers.concerto.gr`, `athensrock.concerto.gr`) με το built-in browser για να το δω live — **και τα δύο navigation attempts απέτυχαν/denied**, άγνωστο γιατί (ξεχωριστό, πιθανό θέμα με το ίδιο το browser tool, όχι με το site). Άρα η παρακάτω διάγνωση είναι **βασισμένη σε code review + node experiments, ΟΧΙ σε live επιβεβαίωση** — σημειώνεται ρητά.

### Πραγματικό bug που βρέθηκε (και διορθώθηκε) στο `cookieStorage.js`
Το `setItem`'s chunking decision μετρούσε το **raw** `value.length` (JS string, πριν το `encodeURIComponent`) για να αποφασίσει αν χρειάζεται chunking και πού να κόψει. Λάθος: σημεία στίξης JSON (`"`, `{`, `}`, `:`, `,`) γίνονται 3 χαρακτήρες το καθένα μετά encoding, και ένας ελληνικός χαρακτήρας (π.χ. στο `full_name`/`name` από Google OAuth — το Concerto είναι ελληνική πλατφόρμα, θα συμβαίνει συχνά) γίνεται 6-9 χαρακτήρες. Ένα raw session JSON "μικρό" σε μήκος μπορεί εύκολα να ξεπεράσει το πραγματικό όριο cookie (~4093 bytes) μετά την κωδικοποίηση, χωρίς να το καταλάβει ο παλιός κώδικας — αθόρυβη αποκοπή/απόρριψη cookie από το browser, πιθανή αλλοίωση session.

**Διόρθωση:** νέα `chunkByEncodedLength()` — μετράει το encoded μήκος χαρακτήρα-χαρακτήρα (raw iteration, όχι πάνω στο ήδη-encoded string, ώστε να μην κόβεται ποτέ στη μέση μια πολυ-byte `%XX` ακολουθία) και κόβει chunk μόλις το ΚΩΔΙΚΟΠΟΙΗΜΕΝΟ μήκος πλησιάσει το `CHUNK_SIZE`. Επαληθεύτηκε με node script (όχι μόνο "φαίνεται σωστό"): συνθετικό session με ελληνικά ονόματα ακριβώς στα σύνορα chunk boundary → 12 chunks, όλα κάτω από το όριο μετά encoding, πλήρες round-trip (store→read) επιστρέφει byte-for-byte το ίδιο JSON, `JSON.parse` περνάει καθαρά.

**⚠️ Ειλικρινές setting expectations:** δοκίμασα να αναπαράξω ρεαλιστικό Supabase session JSON (με ελληνικό όνομα, διπλασιασμένο στο `identities[].identity_data` όπως πραγματικά κάνει το Supabase) και ΔΕΝ ξεπέρασε το όριο (2373 raw → 3423 encoded, κάτω από 4093). Άρα αυτό το bug είναι **πραγματικό και σωστά διορθωμένο**, αλλά δεν είναι σίγουρο ότι είναι **η** αιτία του συγκεκριμένου 401 που είδε ο χρήστης — μπορεί να χρειάζεται μεγαλύτερο session (μεγαλύτερο avatar URL, μεγαλύτερο refresh token) για να το πυροδοτήσει.

### Εναλλακτική, πιθανώς πιο πιθανή εξήγηση
Τίποτα από τη σημερινή δουλειά δεν έχει γίνει commit/deploy — ο χρήστης δοκιμάζει σε `npm run dev` (localhost). Μόλις άλλαξε ο μηχανισμός αποθήκευσης session (localStorage → cookie), ένα **παλιό, ήδη-συνδεδεμένο tab/browser profile** θα έχει μπερδεμένη κατάσταση (παλιό localStorage session + κενό/νέο cookie) στο πρώτο test μετά την αλλαγή — ίδιο genre προβλήματος με το "existing sessions don't migrate" που είχε ήδη σημειωθεί όταν χτίστηκε το cookie SSO.

### Ζητήθηκε από τον χρήστη (εκκρεμεί απάντηση)
1. Καθάρισμα **και** cookies **και** localStorage για το domain (DevTools → Application), hard refresh, καθαρό sign-in — αν φύγει το 401, ήταν μπερδεμένη παλιά κατάσταση, όχι bug.
2. Αν επιμένει: paste του `document.cookie` από το console, να φανεί το πραγματικό μέγεθος/αριθμός chunks του αποθηκευμένου session.

### Verification
- Το chunking fix: node-verified (raw+encoded length experiments, round-trip test).
- `npx eslint` / `npm run build` — καθαρά.
- **Δεν έγινε commit.**

### Update: πλήρες live browser verification (Claude in Chrome, ίδια μέρα)
Το `villagers.concerto.gr`/`athensrock.concerto.gr` δεν έχουν κανένα πραγματικό DNS/deploy ακόμα — δουλεύουν μόνο τοπικά μέσω `/etc/hosts` → Vite dev server (`:5173`). Γι' αυτό απέτυχαν όλα τα προηγούμενα browser attempts (δοκίμαζαν το γυμνό domain, όχι `:5173`). Με τη σωστή διεύθυνση (`http://villagers.concerto.gr:5173/...`), το Claude in Chrome μπήκε κανονικά και έγινε πραγματικό τεστ:

- **Το 401 δεν αναπαράχθηκε.** Σε φρέσκο page load, 4/4 `fans` upserts → `200`. Η αποθηκευμένη cookie session (2 chunks, 3718+642 bytes encoded) reconstruct-άρεται σε valid JSON, `access_token` μη ληγμένο. Πιθανότερη εξήγηση του αρχικού 401: μπερδεμένη state από πριν το cookieStorage fix (η δεύτερη, "εναλλακτική εξήγηση" παραπάνω), όχι το chunking bug καθαυτό — αλλά το chunking fix παραμένει σωστό/χρήσιμο ούτως ή άλλως.
- **Follow-all λειτουργεί**: 2× `tenant_follows` batch insert (`&columns=...` — το batch upsert του `useFollowAllTenants`) + 2× μονό (`useFanSession`, τρέχον tenant), όλα `201`.
- **Global avatar/menu**: δουλεύει σωστά (Ο λογαριασμός μου / Προφίλ / Παραγγελίες / Διαγραφή λογαριασμού / Αποσύνδεση) — screenshot επιβεβαιωμένο.
- **Per-tenant avatar**: click δεν κάνει τίποτα (σκέτη εικόνα, όπως ζητήθηκε) — επιβεβαιωμένο.
- **Global login trigger από favorite**: αποσυνδέθηκα (μέσω global avatar → Αποσύνδεση), πήγα σε `/merch/category/music`, click στο heart ενός προϊόντος → άνοιξε το `ConcertoAuthDialog` ("Σύνδεση — Γίνε μέλος της οικογένειας Concerto — Συνέχεια με Google") — επιβεβαιωμένο, screenshot.
- Σημείωση, όχι bug: 4 (όχι 2) requests στο `fans` σε ένα mount — πιθανό React StrictMode double-invoke σε dev (`useFanSession` + `useFollowAllTenants`, ο καθένας ×2). Ακίνδυνο (idempotent upserts), αλλά αξίζει σημείωση για μελλοντικό caching/έλεγχο αν ενοχλήσει.

**Δεν επιβεβαιώθηκε ακόμα:** favorite/καλάθι/εισιτήριο ΜΕΤΑ από επιτυχές sign-in (ότι η ενέργεια συνεχίζει κανονικά, όχι μόνο ότι ανοίγει το dialog) — TicketDialog συγκεκριμένα δεν δοκιμάστηκε καθόλου σήμερα.
- **Δεν έγινε commit.**

---

---

---

## Fan Dashboard v1 — υλοποιήθηκε (8/9, νέα μέρα μετά το ConcertoBar/cookie SSO)

### Απόφαση σειράς build (με τον χρήστη)
Fan Dashboard → Tenant Admin Dashboard → Concerto/platform Admin — ρητή επιλογή χρήστη, βλ. κύριο brief για το three-way split (Concerto admin / generic Tenant Admin / Fan Dashboard).

### Scope v1 (επιβεβαιωμένο με AskUserQuestion)
- Προφίλ (view/edit)
- Tenants που ακολουθεί (μετονομάστηκε σε "Αγαπημένα tenants", βλ. Phase 2 παρακάτω)
- Παραγγελίες (placeholder — δεν υπάρχει καθόλου checkout σύστημα ακόμα)

Ρητή πρόσθετη απαίτηση: κόκκινο badge "1" (ίδιο pattern με favorites/cart) στο avatar/menu item "Προφίλ" όταν τα στοιχεία είναι ακόμα ανεπεξέργαστα από Google — σβήνει ΜΟΝΟ όταν ο fan αποθηκεύσει πραγματική αλλαγή, ΟΧΙ απλά όταν ανοίξει τη σελίδα (ρητή, πιο "αυστηρή" επιλογή του χρήστη).

### Reference component
Ο χρήστης έδωσε ένα Tailwind Plus dashboard shell (headlessui/heroicons) και ζήτησε ρητά: "ακολούθησε τη δομή, μη σχεδιάσεις μόνος σου". Αναπαράχθηκε με τα ΔΙΚΑ ΜΑΣ primitives (Radix Sheet/DropdownMenu, ήδη εγκατεστημένα — καμία νέα shadcn εγκατάσταση χρειάστηκε), όχι headlessui.

### Νέα αρχεία
```
src/queries/syncFanFromAuth.js       → κοινή upsert λογική (fans), βγήκε από useFanSession.js/useFollowAllTenants.js (deduplication)
src/queries/useFanAccount.js          → useFanAccount(fanId) + useUpdateFanProfile(fanId)
src/queries/useFanTenants.js          → useFanTenants(fanId) + useUnfollowTenant(fanId), 3-βηματο cross-tenant query (ίδιο στυλ useTenant.js)
src/components/Header/TenantLayout.jsx           → βγήκε από App.jsx, tenant-branded chrome
src/components/Concerto/FanDashboard/
  FanDashboardLayout.jsx    → shell (mobile Sheet drawer + desktop icon-only sidebar), TenantChip
  FanProfileRoute.jsx       → uncontrolled form (defaultValue+FormData, όχι useState+useEffect — βλ. lint fix παρακάτω)
  FanTenantsRoute.jsx       → λίστα "Αγαπημένα tenants", cross-origin <a href="//{domain}/about">, Unfollow
  FanOrdersRoute.jsx        → ρητό placeholder
```
`main.jsx`: νέο sibling route `/account` (`FanDashboardLayout`) με children `profile`/`tenants`/`merch`/`events`/`orders` (index redirect σε `profile`).

### 🐛 Lint fix
`react-hooks/set-state-in-effect` στο `FanProfileRoute.jsx` (`useEffect(() => setFullName(...), [fan])` flagged). Λύση: uncontrolled input (`defaultValue` + `FormData` στο submit) αντί για `useState`+`useEffect` sync.

### 🐛 Bug: "Αποσύνδεση" μέσα στο `/account` άφηνε τον fan κολλημένο σε σπασμένη σελίδα
Root cause: το Fan Dashboard χρειάζεται fan session, δεν έχει tenant chrome να πέσει πίσω. **Λύση, ρητά προσωρινή "μέχρι να φτιάξουμε το concertofamily.gr"** (εκεί θα ανήκουν όλα τα tenants): `useEffect` guard στο `ConcertoBar.jsx`, redirect σε `/about` (του τρέχοντος tenant subdomain) όποτε logged-out ενώ βρίσκεσαι σε `/account`.

### 🐛 Race condition στο ίδιο fix (self-caught, όχι user-reported)
Το guard έτρεχε πριν προλάβει να επιβεβαιωθεί το session (`useAuth()` ξεκινάει με `session=undefined`) — false-positive redirect σε ΗΔΗ συνδεδεμένο fan. Live-confirmed screenshot (`/account/tenants` redirect σε `/about` ενώ το avatar έδειχνε ξεκάθαρα logged-in). **Λύση:** πρόσθεσα `authLoading` στο guard condition. Re-verified live.

### Migration
`20260908100000_add_fans_profile_customized.sql` — `fans.profile_customized boolean default false`.

---

## Fan Dashboard — Phase 2: tenant chip, favorites merch/events συγκεντρωτικά + notifications (ίδια μέρα, 8/9)

### Ζητήθηκε (ένα μεγάλο μήνυμα, verbatim στο chat log)
1. Tenant context chip πάνω από "Ο λογαριασμός μου" — δείχνει από ποιο tenant άνοιξε το dashboard, click γυρνάει εκεί.
2. Αγαπημένα tenants (ήδη υπήρχε από v1, polish).
3. Αγαπημένα merch από ΟΛΟΥΣ τους tenants, συγκεντρωτικά, με notification αν πέσει η τιμή.
4. Αγαπημένα events από ΟΛΟΥΣ τους tenants, συγκεντρωτικά, με notification αν αλλάξει κάτι.
5. Παραγγελίες με ολοκληρωμένες/ανολοκλήρωτες — **ΜΠΛΟΚΑΡΙΣΜΕΝΟ, δεν υπάρχει καθόλου checkout σύστημα**, παραμένει placeholder.

Δόθηκε honest scope breakdown + `AskUserQuestion` (multiSelect) — επιλέχθηκαν: chip+tenant favorites polish, merch favorites+price-drop, event favorites από μηδέν (Orders σωστά εξαιρέθηκε, παραμένει μπλοκαρισμένο).

### Pattern: "snapshot τη στιγμή του favorite" για notifications (χωρίς background jobs/cron)
`favorites.price_at_favorite` (captured στο insert) vs ζωντανό `products.price` → price-drop badge στο Fan Dashboard.
Νέο table `event_favorites` (δεν υπήρχε ΚΑΝΕΝΑΣ μηχανισμός "αγαπημένο event" πριν, μόνο το merch είχε favorites) με `snapshot_title`/`snapshot_date` vs ζωντανά `events.title`/`events.date` → "άλλαξε κάτι" badge. Υπολογίζεται ζωντανά στο read query.

### Νέα αρχεία
```
src/queries/useEventFavorites.js       → useEventFavorites(fanId) + useToggleEventFavorite(fanId)
src/queries/useFanFavoriteMerch.js     → cross-tenant aggregated, computed priceDropped/priceAtFavorite
src/queries/useFanFavoriteEvents.js    → cross-tenant aggregated, computed changed
src/components/Concerto/FanDashboard/
  FanFavoriteMerchRoute.jsx    → cross-origin links στο σωστό tenant, κόκκινο "Έπεσε από Χ€"
  FanFavoriteEventsRoute.jsx   → cross-origin links στο σωστό tenant, κόκκινο "Άλλαξε κάτι — έλεγξέ το"
```
`EventsList.jsx`: νέο heart-toggle button πάνω στην εικόνα κάθε event (ίδιο visual pattern με `ProductList.jsx` merch).
`FanDashboardLayout.jsx`: `TenantChip` component (mobile sticky topbar πλήρης γραμμή + desktop rail logo-only με tooltip), click → `/about` του tenant.

### Migrations
`20260908110000_add_favorites_price_at_favorite.sql`, `20260908120000_add_event_favorites_table.sql` (νέο table, ίδιο RLS στυλ με `favorites`).

### 🐛 Επιβεβαιώθηκε ΟΤΙ ΔΕΝ ήταν bug: tenant links στο "Αγαπημένα tenants" "δεν δουλεύουν"
Ο χρήστης το ανέφερε με screenshots. Investigation: `device_bash curl` μπλοκαρισμένο από egress allowlist proxy (`403 blocked-by-allowlist`) → δούλεψε μέσω `javascript_tool` μέσα στο πραγματικό browser page, με το πραγματικό anon key. Επιβεβαιώθηκε: τα `tenant_domains` rows υπάρχουν σωστά, το click πραγματικά navigate-άρει σωστά (`athensrock.concerto.gr/about`, confirmed live via `tabs_context_mcp`). Το πρόβλημα ήταν μόνο ότι local dev χρειάζεται χειροκίνητο `:5173` port (προϋπάρχων, ήδη τεκμηριωμένος περιορισμός — τα domains στη βάση δεν έχουν port, σωστό για production). **Καμία αλλαγή κώδικα δεν έγινε** — δόθηκε στον χρήστη η επιλογή (αφήνουμε όπως είναι ή dev-only auto-port convenience), **δεν απαντήθηκε ακόμα, ανοιχτό**.

---

## 🐛 Σοβαρό bug: cross-tenant favorites/cart leakage — διορθώθηκε (ίδια μέρα, 8/9)

### Symptom (live-επιβεβαιωμένο από τον χρήστη, screenshot)
Favorite/cart items προστέθηκαν στο Villagers Band· ο χρήστης πήγε μετά στο Athens Rock Festival — ΤΑ ΙΔΙΑ counts στα badges, και ανοίγοντας τα dialogs, ΤΑ ΙΔΙΑ (λάθος tenant's) προϊόντα εμφανίζονταν.

### Root cause
`favorites` και `cart_items` δεν είχαν ΚΑΘΟΛΟΥ `tenant_id` column — scoped μόνο ανά `fan_id`, δηλαδή στην πράξη ΕΝΑ global cart/favorites list ανά fan σε όλη την πλατφόρμα, ενώ το UI (κάθε tenant's `TenantTopBar`/`FavoritesDialog`/`CartDialog`) το παρουσίαζε σαν να είναι ξεχωριστό ανά tenant. Το `FavoritesDialog.jsx` self-corrected ΜΕΡΙΚΩΣ (client-side filter έναντι `useProducts(tenantId)`) — το `CartDialog.jsx` ΔΕΝ self-corrected ΚΑΘΟΛΟΥ, render-άριζε το fan-global cart απευθείας.

### Αρχιτεκτονική πρόθεση (επιβεβαιωμένη ρητά από τον χρήστη)
Ανά tenant: favorites/cart/favorite events ΕΙΔΙΚΑ ΚΑΙ ΜΟΝΑΔΙΚΑ σε αυτόν. Μόνο στο Fan Dashboard (global): όλα μαζί, συγκεντρωτικά — ήδη το σωστό μοτίβο του Phase 2 παραπάνω.

### Fix
Migration `20260908130000_add_tenant_scoping_favorites_cart.sql` — `tenant_id` σε ΚΑΙ τα δύο tables, backfill από `products.tenant_id`, μετά `not null`.
`useFavorites.js`/`useCart.js` rewritten πλήρως: `useFavorites(fanId, tenantId)`/`useCart(fanId, tenantId)`, φιλτράρουν με `.eq("tenant_id", tenantId)`, `enabled` απαιτεί και τα δύο.
6 call sites ενημερώθηκαν: `Header.jsx`, `TenantTopBar.jsx`, `CartDialog.jsx` (+νέο `tenantId` prop), `FavoritesDialog.jsx`, `ProductList.jsx` (+νέο `tenantId` prop), `MerchCategoryRoute.jsx` (περνάει το prop κάτω).
Το Fan Dashboard (`useFanFavoriteMerch.js`/`useFanFavoriteEvents.js`) ΣΚΟΠΙΜΑ ΔΕΝ άλλαξε — παραμένει χωρίς tenant filter, σωστά (aggregated by design).

### Verification
`npx eslint` + `npm run build` καθαρά. Live-verified από τον χρήστη μετά τα migrations ("ok ok leitourgei thanks").

---

## Follow/unfollow — πλήρης επανασχεδίαση, ΑΝΑΙΡΕΙ την προηγούμενη "auto-follow-all" απόφαση (ίδια μέρα, 8/9)

### ⚠️ Αντικαθιστά ρητά την ενότητα "ConcertoBar — round 2" παραπάνω (7/9)
Εκεί είχε αποφασιστεί (ρητά ως "για αρχή", προσωρινό): login = ακολουθεί ΑΥΤΟΜΑΤΑ ΟΛΟΥΣ τους tenants (`useFollowAllTenants`). Επιπλέον, κρυφά μέσα στο `useFanSession.js`, απλά η ΕΠΙΣΚΕΨΗ ενός tenant ενώ ήσουν συνδεδεμένος έκανε ΚΑΙ ΑΥΤΗ αυτόματο follow (silent upsert, καμία ενέργεια του fan). Ο χρήστης βρήκε αυτή τη συμπεριφορά μπερδεμένη/λάθος στην πράξη (screenshot: "+ Ακολουθείς" pill ενώ ήταν logged out — λόγω παλιού localStorage flag που "θυμόταν" follow status ΜΕΤΑ το logout) και ζήτησε ρητά νέο μοντέλο, με λεπτομερή περιγραφή.

### Νέο μοντέλο (περιγράφηκε αναλυτικά από τον χρήστη, επιβεβαιώθηκε πριν την υλοποίηση)
- Global login (ConcertoBar) ξεκλειδώνει search/favorite/καλάθι σε ΚΑΘΕ tenant — ανεξάρτητο από follow status.
- Follow είναι ΡΗΤΗ ενέργεια, ανά tenant, ΜΟΝΟ όταν πατηθεί το κουμπί — ΠΟΤΕ αυτόματο (ούτε στο login, ούτε απλά επισκεπτόμενος μια σελίδα).
- ΚΑΜΙΑ localStorage μνήμη follow status — logged-out πάντα δείχνει "Ακολούθησε", ανεξαρτήτως ιστορικού.
- Logged-in + όχι follow: ΚΑΙ τα δύο ταυτόχρονα — search/favorite/cart icons ΚΑΙ κουμπί "+ Ακολούθησε" δίπλα τους.
- Logged-in + follow: "Ακολουθείς" pill, πατήσιμο → unfollow (ίδιο mutation με το Fan Dashboard "Unfollow" button, `useUnfollowTenant`).
- Avatar (Google profile pic) αφαιρέθηκε εντελώς από το `TenantTopBar` — η κατάσταση login/follow περνάει πλέον αποκλειστικά από το κείμενο του follow button.

### Αλλαγές
`src/queries/useFollowAllTenants.js` — **διαγράφηκε εντελώς**, αφαιρέθηκε η χρήση του από `ConcertoBar.jsx`.
`src/queries/useFanProfile.js` — βρέθηκε **ορφανό, ανενεργό αντίγραφο** (debug `console.log`, ίδια παλιά auto-follow λογική), μη εισαγόμενο πουθενά — **διαγράφηκε**.
`src/queries/useFanSession.js` — rewritten: αφαιρέθηκε το silent `tenant_follows` upsert + το `localStorage.setItem`, τώρα κάνει καθαρό `select` (ζωντανή, πραγματική DB state). Νέο export `useFollowTenant()` (ρητό follow mutation, καλείται ΜΟΝΟ από το κλικ).
`src/components/Header/TenantTopBar.jsx` — αφαιρέθηκε το avatar `<img>`, μόνο search/favorite/cart icons πια, `justify-end`.
`src/components/Header/Header.jsx` — αφαιρέθηκε το `hasFollowedBefore`/localStorage read εντελώς. `handleFollowClick`: not logged in → `onRequireAuth()` · logged in + following → `unfollowTenant.mutate(tenant.id)` · logged in + not following → `followTenant.mutate({fanId, tenantId})`. Layout: follow pill/button + `TenantTopBar` ταυτόχρονα όταν logged in (πριν ήταν either/or).
`src/queries/useFanTenants.js` — `useUnfollowTenant`'s `onSuccess` invalidate-άρει τώρα ΚΑΙ `["fan_session", fanId]` (partial key, καλύπτει όλα τα tenants) ώστε το Header pill να ενημερώνεται άμεσα, όπου κι αν έγινε το unfollow (Fan Dashboard ή απευθείας από το tenant).

### Verification
`npx eslint` + `npm run build` καθαρά σε κάθε βήμα. Καμία αλλαγή στη βάση χρειάστηκε (το `tenant_follows` table υπήρχε ήδη, άλλαξε μόνο πότε γράφεται).

---

## FanIdCard — test/demo component (ίδια μέρα, 8/9)

### Ζητήθηκε
Νέο component στο Προφίλ, look σαν ευρωπαϊκή ταυτότητα (ορθογώνιο, avatar πάνω-αριστερά) — ρητά "test", για μελλοντική επιχειρηματική χρήση ("id" identity για το Concerto). Πεδία: αριθμός id (βάσει σειράς εγγραφής global — π.χ. "00004"), όνομα, επίθετο, ημερομηνία γέννησης, πόλη, σήμα verification, display name (θα χρησιμοποιηθεί αργότερα — απλά πρόσθεσέ το). Δίπλα στο "Αποθήκευση": νέο "Επεξεργασία" που ανοίγει stub φόρμα από κάτω (τα πραγματικά πεδία της TBD σε άλλο session). Test data για ό,τι δεν υπάρχει ακόμα σαν πραγματικό πεδίο στη βάση — μόνο όνομα/avatar/id number είναι πραγματικά δεδομένα του fan.

### Νέα αρχεία
```
src/components/Concerto/FanDashboard/FanIdCard.jsx   → visual card, splitName() σπάει το πραγματικό full_name σε όνομα/επίθετο, test constants για τα υπόλοιπα
src/queries/useFanIdNumber.js                          → useFanIdNumber(fanId), καλεί RPC (βλ. παρακάτω)
```
`FanProfileRoute.jsx`: render `<FanIdCard>`, νέο "Επεξεργασία" toggle button + disabled stub form preview (4 test πεδία, δεν αποθηκεύει ακόμα τίποτα — labeled ρητά ως preview).

### 🐛 RLS θέμα εντοπίστηκε ΠΡΙΝ γίνει live bug (ο χρήστης ρώτησε ρητά: "δεν έχουμε τίποτα με τα RLS θέματα τώρα μετά το migration;")
Η πρώτη υλοποίηση έκανε client-side `count` πάνω σε ΟΛΟΥΣ τους fans (`.lte("created_at", ...)`) — αλλά το `fans` table έχει RLS σαν όλα τα υπόλοιπα (`auth.uid() = id`, μόνο η δική σου γραμμή ορατή μέσω anon key). Θα επέστρεφε πάντα 1, δηλαδή "00001" σε ΚΑΘΕ fan — καμία σχέση με πραγματική σειρά εγγραφής. **Λύση, ίδιο pattern με `delete_own_account` (βλ. κύριο brief):** νέα SECURITY DEFINER function `get_own_fan_id_number()` — τρέχει server-side με αυξημένα δικαιώματα, self-scoped μέσω `auth.uid()` (καμία παράμετρος από τον client), επιστρέφει ΜΟΝΟ έναν ακέραιο· καμία διαρροή δεδομένων άλλου fan.

### Migrations
`20260908140000_add_fans_created_at.sql` — `fans.created_at`, ασφαλές additive (`IF NOT EXISTS`). Σημείωση: υπάρχουσες γραμμές παίρνουν όλες το ΙΔΙΟ timestamp (η στιγμή του migration, Postgres DDL behavior) — αποδεκτό, ο αριθμός είναι ρητά μόνο για UI/demo, όχι επίσημο μητρώο (ο ίδιος ο χρήστης το ξεκαθάρισε).
`20260908150000_add_get_own_fan_id_number_function.sql` — η RLS-safe function.

### Verification
`npx eslint` + `npm run build` καθαρά. **Δεν έχει γίνει live browser verification ακόμα** (εκκρεμούν τα δύο migrations).

---

## 📋 Migrations σε εκκρεμότητα (ενημερωμένο 9/9, να τρέξει ο χρήστης στο Supabase SQL editor, με αυτή τη σειρά)

1. `20260908100000_add_fans_profile_customized.sql` — επιβεβαιωμένο ότι έτρεξε (indirect, "already exists" σε retry).
2. `20260908110000_add_favorites_price_at_favorite.sql` — επιβεβαιωμένο ότι έτρεξε.
3. `20260908120000_add_event_favorites_table.sql` — επιβεβαιωμένο ότι έτρεξε (verification query: 3/3 policies σωστά).
4. `20260908130000_add_tenant_scoping_favorites_cart.sql` — **επιβεβαιωμένα έτρεξε, live-verified από τον χρήστη.**
5. `20260908140000_add_fans_created_at.sql` — **επιβεβαιωμένα έτρεξε ("ta etreksa ok").**
6. `20260908150000_add_get_own_fan_id_number_function.sql` — **επιβεβαιωμένα έτρεξε ("ta etreksa ok").**
7. `20260909100000_add_encrypted_fan_private_details.sql` — **επιβεβαιωμένα έτρεξε, live-verified από τον χρήστη (SQL check, όλα `1`).**
8. `20260909110000_encrypt_all_fan_personal_fields.sql` — **επιβεβαιωμένα έτρεξε, DB-verified (backfill 5/5 fans, καμία απώλεια).**
9. `20260909120000_add_full_fan_profile_fields.sql` — **επιβεβαιωμένα έτρεξε ("Success. No rows returned").**
10. `20260909130000_fan_profile_multi_tenant_and_display_name_check.sql` — **εκκρεμεί.**

---

---

## Dev-only auto-port για cross-tenant links (9/9)

### Πρόβλημα
Cross-tenant links (Fan Dashboard: tenant chip, αγαπημένα tenants/merch/events) φτιάχνονται από το καθαρό `tenant_domains.domain` — σωστό για production (κανένα port εκεί). Σε τοπικό dev όμως, το Vite server ακούει πάντα στο `:5173`· χωρίς αυτό στο URL, τα links "δεν φορτώνουν τίποτα" τοπικά (φαίνονται χαλασμένα, δεν είναι).

### Λύση
Νέο `src/lib/tenantLink.js`, `crossTenantHref(domain, path)`: προσθέτει αυτόματα `:5173` ΜΟΝΟ όταν `import.meta.env.DEV === true` (επίσημο Vite flag, `true` μόνο σε `npm run dev`, `false` αυτόματα σε production build). **Καμία χειροκίνητη αλλαγή δεν θα χρειαστεί όταν πάμε live** — το build το απενεργοποιεί μόνο του, μηδενικό ρίσκο να "ξεχαστεί" ενεργό σε production.

Εφαρμόστηκε σε 3 σημεία: `FanTenantsRoute.jsx`, `FanFavoriteMerchRoute.jsx`, `FanFavoriteEventsRoute.jsx`.

### Verification
`npx eslint` + `npm run build` καθαρά (βρέθηκε κι ένα άσχετο EPERM στο καθάρισμα του `dist/` λόγω file-delete permissions στο sandboxed shell — λύθηκε, άσχετο με τον κώδικα).

---

## Ασφαλής (κρυπτογραφημένη) αποθήκευση ευαίσθητων πεδίων προφίλ — GDPR/security συζήτηση (9/9)

### Ζητήθηκε
Ο χρήστης ρώτησε ρητά: πριν αποθηκεύσουμε πραγματικά προσωπικά δεδομένα (ημ. γέννησης, πόλη — τα test πεδία του FanIdCard) στη βάση, πώς διαχειριζόμαστε GDPR + ρίσκο hack/breach στο μέγιστο δυνατό βαθμό; Ζήτησε όλες τις δυνατές λύσεις, ιεραρχημένες από την καλύτερη στη χειρότερη.

### Απάντηση (δόθηκε στο chat, όχι εδώ αναλυτικά) — 5 βαθμίδες
1. Data minimization (μη συλλέγεις ό,τι δεν χρειάζεσαι) — προαπαιτούμενο, όχι εναλλακτική αρχιτεκτονική.
2. **Encryption για ευαίσθητα πεδία** (ξεχωριστό table, κρυπτογραφημένο, RLS) — **επιλέχθηκε από τον χρήστη**.
3. Απλό RLS όπως το υπόλοιπο project (ήδη το βασικό μας επίπεδο).
4. Ίδιο με #3 χωρίς σαφή πολιτική retention/διαγραφής.
5. Plaintext/χαλαρά policies/no MFA — να αποφευχθεί εντελώς.
Επισημάνθηκε ρητά (νομικό κομμάτι, με caveat "δεν είμαι δικηγόρος"): EU region confirmation, Privacy Policy/ToS, DPA με Supabase — ήδη pending items στο κύριο brief. Και ξεχωριστή σημείωση: πραγματικό επίσημο έγγραφο ταυτότητας (ΑΔΤ/διαβατήριο) θα ήταν εντελώς διαφορετική κατηγορία — εξειδικευμένος πάροχος KYC, όχι δική μας αποθήκευση, αν ποτέ χρειαστεί.

### Υλοποίηση: Επιλέχθηκε tier 2 (encryption)
**Μηχανισμός:** Supabase Vault (`vault.create_secret`/`vault.decrypted_secrets`) κρατάει ένα symmetric encryption key — δημιουργείται ΜΙΑ φορά, τυχαίο, ΠΟΤΕ ορατό εκτός βάσης. `pgcrypto` (`pgp_sym_encrypt`/`pgp_sym_decrypt`) κάνει το actual encrypt/decrypt, ΜΟΝΟ μέσα σε 2 SECURITY DEFINER functions (ίδιο pattern με `delete_own_account`/`get_own_fan_id_number` ήδη στο project) — self-scoped `auth.uid()`, καμία `fan_id` παράμετρος από τον client.

**Νέο table:** `fan_private_details` (`fan_id` PK/FK, `date_of_birth_enc bytea`, `city_enc bytea`) — ΞΕΧΩΡΙΣΤΟ από το `fans`, με RLS (`auth.uid() = fan_id`) ΕΠΙΠΛΕΟΝ της encryption (defense-in-depth: ακόμα κι αν κάποιος διαβάσει τη γραμμή, βλέπει ciphertext, όχι κείμενο).

**Ρητά ΕΚΤΟΣ αυτού του encrypted table** (σκόπιμα): Επίθετο, Display name — παραμένουν σκόπιμα plain/test data προς το παρόν, ίδιο επίπεδο με το ήδη υπάρχον `fans.full_name`. Τα ακριβή τους πεδία/στήλες παραμένουν ανοιχτό θέμα (ο χρήστης δεν έχει πει ακόμα την τελική λίστα πεδίων της πλήρους φόρμας — ξεκίνησε αυτή τη συζήτηση GDPR πριν προλάβει να απαντήσει).

### Νέα/αλλαγμένα αρχεία
```
supabase/migrations/20260909100000_add_encrypted_fan_private_details.sql
src/queries/useFanPrivateDetails.js   → useFanPrivateDetails(fanId) + useUpdateFanPrivateDetails(fanId)
```
`FanIdCard.jsx`: `dateOfBirth`/`city` έγιναν πραγματικά props (πριν TEST constants) — Επίθετο/Display name/Verified παραμένουν test.
`FanProfileRoute.jsx`: το "Επεξεργασία" stub έγινε ΞΕΧΩΡΙΣΤΟ, πραγματικό `<form>` (όχι nested μέσα στο form του Ονόματος) — ημ. γέννησης (`type="date"`) + πόλη είναι πλέον λειτουργικά, αποθηκεύουν κρυπτογραφημένα· Επίθετο/Display name παραμένουν `disabled`/test.

### Verification
`npx eslint` + `npm run build` καθαρά. **Δεν έχει γίνει live browser verification ακόμα** (εκκρεμεί το migration).

### ⚠️ Σημείωση αν σκάσει το migration
Αν βγει σφάλμα `schema "vault" does not exist`: το Vault extension χρειάζεται να ενεργοποιηθεί πρώτα από το Supabase dashboard (Database → Extensions → "vault"), μετά ξανατρέξιμο το migration.

---

## ⚠️ Αναίρεση: sticky ID card + live preview (9/9, μετά από πραγματικό build test)

Ο χρήστης δοκίμασε σε πραγματικό build και βρήκε πρόβλημα με το sticky ID card + το live preview (watch()-based) που είχαν προστεθεί στο προηγούμενο πέρασμα — ζήτησε ρητά να αναιρεθούν και να γυρίσει "όπως πριν": το ID card ΔΕΝ είναι πια sticky (κανονική ροή στη σελίδα), και δείχνει ΜΟΝΟ τα αποθηκευμένα δεδομένα (`fullProfile` από τη βάση) — ενημερώνεται ΜΟΝΟ μετά από επιτυχές save, ΟΧΙ live καθώς πληκτρολογεί ο fan. Το `useWatch`/live-preview παρέμεινε σε χρήση ΜΟΝΟ για το live display-name-availability check και το "θα αποθηκευτεί ως..." τηλεφώνου ΜΕΣΑ στη φόρμα (αυτά δεν αναιρέθηκαν, ο χρήστης αναφέρθηκε ρητά μόνο στο ID card). `FanProfileRoute.jsx` ενημερώθηκε· `npx eslint`/`npm run build` καθαρά.

---

## Επέκταση encryption σε ΟΛΑ τα προσωπικά πεδία (email/full_name/avatar_url) — 9/9

### Ζητήθηκε
Μετά το encryption του date_of_birth/city (πάνω), ο χρήστης ρώτησε ρητά αν μπορούμε να κρυπτογραφήσουμε ΟΛΑ τα στοιχεία — ρητά διπλός στόχος: (1) προστασία από hack/leak, ΚΑΙ (2) να μην μπορεί ΟΥΤΕ ο ίδιος, ως Concerto admin, να δει τα προσωπικά στοιχεία των fans από τη βάση.

### Σημαντική διευκρίνιση δόθηκε ΠΡΙΝ την υλοποίηση
Ο στόχος #2 (admin δεν βλέπει τίποτα) ΔΕΝ επιτυγχάνεται με server-held key (Vault/pgcrypto, το μοντέλο που ήδη χρησιμοποιούμε) — ο admin ελέγχει το Vault key και το SQL editor, άρα μπορεί πάντα να αποκρυπτογραφήσει. Μόνο πραγματικό end-to-end/zero-knowledge encryption (κλειδί ΜΟΝΟ στη συσκευή του fan, ποτέ στον server) θα πετύχαινε αυτό — παρουσιάστηκαν τα πραγματικά μειονεκτήματα (μόνιμη απώλεια δεδομένων αν χαθεί/αλλάξει η συσκευή/browser, καμία server-side χρήση των δεδομένων, μεγάλη πολυπλοκότητα, δεν υπάρχει φυσικό secret αφού το login είναι μόνο Google OAuth). Ο χρήστης επέλεξε να ΜΗΝ προχωρήσει σε αυτό, και να επεκτείνει απλά το ΥΠΑΡΧΟΝ server-side μοντέλο (προστασία από external leak/hack) σε email/full_name/avatar_url. Επιβεβαιώθηκε ρητά με AskUserQuestion: "Ναι, όλα τα προσωπικά πεδία".

### ⚠️ Δομικός περιορισμός — να το θυμόμαστε πάντα
Το `auth.users` table του ίδιου του Supabase Auth (email/name/avatar από Google OAuth login) παραμένει ΠΑΝΤΑ plaintext, ό,τι κι αν κάνουμε στα δικά μας tables — το διαχειρίζεται το Supabase Auth, όχι εμείς, και το χρειάζεται plaintext για να δουλέψει το ίδιο το login/session. Ορατό από Authentication → Users στο Supabase dashboard, σε όποιον έχει πρόσβαση admin στο project (ίδιο επίπεδο πρόσβασης που θα είχε έτσι κι αλλιώς μέσω του SQL editor). Το encryption που κάνουμε προστατεύει τα ΔΙΚΑ ΜΑΣ tables (`fans`/`fan_private_details`) από leak/hack — δεν είναι, και δεν μπορεί δομικά να γίνει, "αόρατο από τον admin".

### Υλοποίηση
Επεκτάθηκε το ΥΠΑΡΧΟΝ `fan_private_details` table (ίδιο Vault key, ίδιο μηχανισμό με date_of_birth/city) με 3 νέες στήλες: `email_enc`, `full_name_enc`, `avatar_url_enc`. Backfill των υπαρχόντων plaintext τιμών από το `fans`, μετά DROP των παλιών plaintext στηλών (`email`, `full_name`, `avatar_url`) — δεν υπάρχουν πια ΚΑΘΟΛΟΥ plaintext σε δικό μας table.

Τρεις νέες SECURITY DEFINER functions (ίδιο pattern, `auth.uid()` μόνο):
- `sync_own_fan_from_auth(p_email, p_full_name, p_avatar_url)` — αντικαθιστά το παλιό client-side upsert· ίδια λογική "μην ξαναγράφεις full_name/avatar_url αν profile_customized=true", μετακόμισε server-side.
- `get_own_fan_identity()` — επιστρέφει `(full_name, avatar_url, email, profile_customized)`, ΙΔΙΟ σχήμα με το παλιό client-side select, ώστε `ConcertoBar.jsx`/`FanProfileRoute.jsx`/`FanIdCard.jsx` να ΜΗΝ χρειαστούν καμία αλλαγή.
- `set_own_fan_full_name(p_full_name)` — αντικαθιστά το παλιό client-side update.

### Αλλαγμένα αρχεία
```
supabase/migrations/20260909110000_encrypt_all_fan_personal_fields.sql
src/queries/syncFanFromAuth.js   → πλέον καλεί μόνο supabase.rpc("sync_own_fan_from_auth", ...)
src/queries/useFanAccount.js     → useFanAccount καλεί get_own_fan_identity RPC, useUpdateFanProfile καλεί set_own_fan_full_name RPC
```
Καμία αλλαγή σε κανένα component (`ConcertoBar.jsx`, `Header.jsx`, `FanProfileRoute.jsx`, `FanIdCard.jsx`) — το external σχήμα των hooks διατηρήθηκε ρητά ίδιο.

### Verification
`npx eslint` + `npm run build` καθαρά. **Δεν έχει γίνει live browser verification ακόμα** (εκκρεμεί το migration — πρέπει να τρέξει ΜΕΤΑ το `20260909100000`, χρειάζεται το ίδιο Vault key).

---

## Πλήρης φόρμα προφίλ fan — Όνομα/Επίθετο/Display name/Τηλέφωνο/Ημ. γέννησης/Πόλη/Αγαπημένα (9/9)

### Ζητήθηκε
Ο χρήστης έδωσε ρητή λίστα πεδίων για την πλήρη φόρμα προφίλ (αντικαθιστά το παλιό stub): Όνομα, Επίθετο, Display name, Ημερομηνία γέννησης, Πόλη που ζει τώρα, Αγαπημένα είδη μουσικής, Αγαπημένο tenant, Τηλέφωνο. Ζήτησε ρητά: (α) να ακολουθηθούν επίσημα/mainstream React patterns για το validation (ανέφερε αμυδρά "συνεργάζεται με κάποιον" — evolved σε react-hook-form + zod, βλ. παρακάτω), με αναφορά τι χρησιμοποιήθηκε στο τέλος· (β) το ίδιο το pattern (forms + encryption) να καταγραφεί σε ΞΕΧΩΡΙΣΤΟ, επαναχρησιμοποιήσιμο doc — γιατί θα χρειαστεί ξανά σε άλλα dashboards. Βλ. νέο `concerto-forms-and-encryption-brief.md` για το ίδιο το pattern· εδώ μόνο το τι έγινε σήμερα.

### Προαπαιτούμενη απόφαση (AskUserQuestion πριν την υλοποίηση)
Δύο από τα 8 πεδία (Αγαπημένα είδη μουσικής, Αγαπημένο tenant) δεν είναι προσωπικά αναγνωριστικά σαν τα υπόλοιπα — ρωτήθηκε αν κρυπτογραφούνται κι αυτά ή μένουν απλά/αναζητήσιμα. Επιλέχθηκε: **απλά, αναζητήσιμα** (χρήσιμα για μελλοντικά στατιστικά/recommendations ανά tenant στο Tenant Admin Dashboard).

### Υλοποίηση
**Migration `20260909120000_add_full_fan_profile_fields.sql`:** 4 νέες encrypted στήλες στο `fan_private_details` (`first_name_enc`, `last_name_enc`, `display_name_enc`, `phone_enc`) + 2 νέες plain στήλες στο `fans` (`favorite_genres text[]`, `favorite_tenant_id uuid → tenants`). Νέο ζεύγος SECURITY DEFINER RPCs: `get_own_fan_full_profile()` / `set_own_fan_full_profile(...)` — ΜΙΑ ενιαία save/load για ΟΛΗ τη φόρμα (αντί για σκόρπιες, ξεχωριστές functions ανά 1-2 πεδία όπως πριν). Οι παλιές `set_own_fan_full_name`/`set_own_fan_private_details`/`get_own_fan_private_details` ΔΕΝ διαγράφηκαν (ασφαλές να μείνουν), απλά ο client δεν τις καλεί πια.

**Validation: react-hook-form + zod + @hookform/resolvers** (νέα dependencies, `npm install`). Νέο `src/lib/fanProfileSchema.js` (schema + στατική λίστα `FAN_MUSIC_GENRES`, 15 είδη v1). Επιλέχθηκε γιατί είναι ο mainstream συνδυασμός στο React ecosystem ΚΑΙ επειδή τα ήδη εγκατεστημένα shadcn `Field`/`FieldError` primitives (`src/components/ui/field.jsx`) ήταν ήδη φτιαγμένα ακριβώς για αυτό το σχήμα errors. Uncontrolled-first από φύση (React 19 περνάει `ref` σαν κανονικό prop, δουλεύει κατευθείαν με τα υπάρχοντα `Input`/`Textarea` χωρίς `forwardRef`) — ταιριάζει με το ήδη υπάρχον project preference να αποφεύγονται `useState`+`useEffect` sync σε forms.

**Νέο UI primitive:** `src/components/ui/select.jsx` — δεν υπήρχε `Select` στο project. Το `npx shadcn add select` ΑΠΕΤΥΧΕ (μπλοκαρισμένο `ui.shadcn.com` σε αυτό το sandboxed shell) — γράφτηκε χειροκίνητα, ίδιο στυλ/pattern με τα υπάρχοντα `ui/*.jsx` (`radix-ui` package, `cn()`, `data-slot`).

### Αλλαγμένα/νέα αρχεία
```
supabase/migrations/20260909120000_add_full_fan_profile_fields.sql
src/lib/fanProfileSchema.js               → zod schema + FAN_MUSIC_GENRES
src/components/ui/select.jsx              → νέο, χειροκίνητο (Radix)
src/queries/useFanFullProfile.js          → useFanFullProfile(fanId) + useUpdateFanFullProfile(fanId)
src/queries/useAllTenants.js              → useAllTenants(), για το dropdown "Αγαπημένο tenant"
```
`FanProfileRoute.jsx`: ΠΛΗΡΗΣ επανασχεδίαση — ΜΙΑ ενιαία φόρμα (πριν ήταν δύο ξεχωριστά forms + 2 disabled test πεδία) με 8 πεδία: text (Όνομα/Επίθετο/Display name/Πόλη), tel (Τηλέφωνο), date (Ημ. γέννησης), multi-select chips (Αγαπημένα είδη μουσικής, `Controller`-managed array), `Select` dropdown (Αγαπημένο tenant, από `useAllTenants()`).
`FanIdCard.jsx`: νέα props `firstName`/`lastName`/`displayName` (πραγματικά, από τη νέα φόρμα) — fallback στο παλιό `splitName(fan.full_name)` ΜΟΝΟ όσο ο fan δεν έχει ακόμα συμπληρώσει τη νέα φόρμα, ώστε η κάρτα να μην είναι ποτέ κενή.
`useFanAccount.js`: αφαιρέθηκε το `useUpdateFanProfile` (πλέον orphaned, αντικαταστάθηκε από `useUpdateFanFullProfile`) — το `useFanAccount` (read) παραμένει ίδιο, εξακολουθεί να τροφοδοτεί ConcertoBar/badge.
`src/queries/useFanPrivateDetails.js` — **διαγράφηκε** (orphaned, superseded από `useFanFullProfile.js`).

### Ρητή, σκόπιμη απόφαση σχεδίασης
Το `full_name_enc`/`get_own_fan_identity`/`sync_own_fan_from_auth` (auto-sync από Google σε κάθε login) παραμένουν ΕΝΤΕΛΩΣ ανεπηρέαστα και ξεχωριστά από τα νέα, πραγματικά `first_name`/`last_name` που ορίζει ο ίδιος ο fan. Η ΣΥΜΠΕΡΙΦΟΡΑ (ποιο δείχνει πού, πότε προτεραιοποιείται το ένα έναντι του άλλου κλπ) είναι **ρητά ανοιχτό θέμα** — ο χρήστης θα την ορίσει σε επόμενο μήνυμα ("θα σου πω πώς θέλω να λειτουργούν αυτά τα δεδομένα").

### Verification
`npx eslint .` + `npm run build` καθαρά (μόνο τα ίδια 13, pre-existing, άσχετα errors σε `ui/*.jsx`). **Δεν έχει γίνει live browser verification ακόμα** (εκκρεμεί το migration).

---

## Πλήρης φόρμα προφίλ — UX/behavior βελτιώσεις, β' πέρασμα (9/9)

### Ζητήθηκε (ένα μεγάλο μήνυμα, ρητές αρχές)
Μετά το πρώτο πέρασμα (μόνο τα πεδία), ο χρήστης όρισε πώς πρέπει να "λειτουργούν": (1) save κλείνει τη φόρμα, μένει μόνο το κουμπί "Επεξεργασία"· (2) Όνομα/Επίθετο/Πόλη κεφαλαιοποιούνται αυτόματα (πρώτο γράμμα), Display name ΟΧΙ (μένει όπως το γράφει ο fan)· (3) Display name ελέγχεται για μοναδικότητα live, κοκκινίζει + μπλοκάρει save αν υπάρχει ήδη· (4) Τηλέφωνο: επιλογή χώρας → σωστό πρόθεμα (+30 default Ελλάδα) → μορφή κλικάρεται για κλήση· (5) Ημ. γέννησης → εμφανίζεται ΜΟΝΟ η ηλικία, υπολογισμένη ζωντανά (αυξάνεται μόνη της κάθε χρόνο)· (6) Πόλη παραμένει ορατή στο ID· (7) "Αγαπημένο tenant" γίνεται "Αγαπημένα tenants" (πολλαπλή επιλογή, checkboxes), πηγή = όσα πραγματικά ακολουθεί (όχι όλα τα tenants), με search bar στη θέση του "— Κανένα —" για μεγάλες λίστες· (8) UI/UX: το ID card μένει sticky στο πάνω μέρος καθώς κάνεις scroll στη φόρμα, ενημερώνεται LIVE καθώς πληκτρολογεί ο fan (όχι μόνο μετά το save)· verified badge γίνεται πράσινο.

### ⚠️ ΑΝΑΘΕΩΡΗΘΗΚΕ πριν καν τρέξει το migration: display_name έγινε ΑΠΛΟ
Αφού εξηγήθηκε το tradeoff (decrypt-and-compare function, αργό σε μεγάλη κλίμακα) ο χρήστης αποφάσισε ρητά: το display_name να ΜΗΝ είναι κρυπτογραφημένο — θέλει στιγμιαίο έλεγχο διαθεσιμότητας ακόμα κι αν γίνει μεγάλη ταυτόχρονη προσέλευση fans ("όταν θα γίνεται χαμός"). Πριν το migration `20260909130000` προλάβει να τρέξει, ξαναγράφτηκε: το `display_name` μετακόμισε ΑΠΛΟ στο `fans` (όχι πια `display_name_enc` στο `fan_private_details`), με **πραγματικό unique index** (`lower(display_name)`, partial όπου `is not null`) — η ίδια η Postgres εγγυάται τη μοναδικότητα, instant lookup, ΚΑΝΕΝΑ race condition δυνατό. Η `check_own_display_name_available()` έγινε τετριμμένη (`language sql`, ΚΑΜΙΑ Vault/pgcrypto εμπλοκή). Η χειροκίνητη "if exists... raise exception" λογική μέσα στο `set_own_fan_full_profile` **αφαιρέθηκε εντελώς** (ρητό αίτημα: "αφαίρεσε περιττές συναρτήσεις") — σε σπάνιο race, η ίδια η update αποτυγχάνει φυσικά με `unique_violation` (code `23505`), που πιάνει ο client (`onError` στο mutate, `FanProfileRoute.jsx`) και δείχνει το ίδιο κόκκινο μήνυμα. Debounce του live check μειώθηκε 500ms→300ms (πιο άμεσο feedback, τώρα που ο έλεγχος είναι φθηνός). Ενημερώθηκε ΚΑΙ το `concerto-forms-and-encryption-brief.md` (η ενότητα "μοναδικότητα σε encrypted πεδίο" ΔΕΝ ισχύει πια για το display_name — παραμένει ως γενικό πρότυπο για ΑΛΛΑ πεδία που ΘΑ χρειαστεί να μείνουν κρυπτογραφημένα).

### (Ιστορικό, πριν την παραπάνω αναθεώρηση) Δύσκολο τεχνικό σημείο: μοναδικότητα σε ΚΡΥΠΤΟΓΡΑΦΗΜΕΝΟ πεδίο
Το `display_name` είναι encrypted (`pgp_sym_encrypt`) — η pgcrypto προσθέτει τυχαιότητα σε κάθε encryption, άρα ΔΕΝ γίνεται SQL `unique` constraint ή απλή `where encrypted_col = ...` σύγκριση πάνω στη encrypted στήλη (ποτέ δύο encryptions του ίδιου plaintext δεν είναι bit-for-bit ίδιες). Εξετάστηκε και απορρίφθηκε η λύση "plain/hashed lookup column" (θα "πρόδιδε" μερικώς το display name σε κάποιον που διαβάζει τη βάση — έρχεται σε αντίθεση με το "όλα κρυπτογραφημένα" που είχε ήδη αποφασιστεί). Επιλέχθηκε: νέα function `check_own_display_name_available()` που αποκρυπτογραφεί ΟΛΕΣ τις γραμμές server-side και συγκρίνει σε plaintext ΜΕΣΑ στη function — αποδεκτό στο μέγεθος του project τώρα, σημειώθηκε ως μελλοντικό scaling TODO (βλ. `concerto-forms-and-encryption-brief.md`) αν το fanbase μεγαλώσει πολύ.

### Υλοποίηση
**Migration `20260909130000_fan_profile_multi_tenant_and_display_name_check.sql`:** `favorite_tenant_id` (uuid) → `favorite_tenant_ids` (uuid[]) στο `fans` (backfill+drop το παλιό)· νέα `check_own_display_name_available(p_display_name)` (live check από το UI)· `get/set_own_fan_full_profile` ενημερώθηκαν (νέο return type/param, χρειάστηκε `drop function` πρώτα — η `create or replace` δεν επιτρέπει αλλαγή signature)· το `set_own_fan_full_profile` ΞΑΝΑελέγχει τη μοναδικότητα server-side πριν το save (defense in depth against races — το client-side live check είναι best-effort/UX μόνο).

**Client:**
```
src/lib/phoneCountries.js                              → λίστα χωρών+κωδικών, Ελλάδα default
src/components/Concerto/FanDashboard/FavoriteTenantsPicker.jsx → custom searchable multi-select (checkboxes), πηγή useFanTenants (ΟΧΙ πια useAllTenants.js — διαγράφηκε, orphaned)
```
`fanProfileSchema.js`: `favoriteTenantId` → `favoriteTenantIds` (array)· νέα `phoneCountry`/`phoneNumber` (συνδυάζονται σε ένα string στο submit)· νέο exported `capitalizeFirst()` helper· `.transform()` στο τέλος του schema εφαρμόζει capitalize και σε submit-time (defense in depth πάνω από το live onChange transform στο UI).
`FanProfileRoute.jsx`: **πλήρης επανασχεδίαση της ροής.** `useWatch({ control })` (ΟΧΙ `watch()` απευθείας — React Compiler warning "cannot be memoized safely", `useWatch` είναι το official recommended equivalent) τροφοδοτεί το FanIdCard LIVE, ασχέτως αν είναι ανοιχτό το edit panel (το form state μένει πάντα synced με τη βάση μέσω του υπάρχοντος `reset()` effect — έξυπνη παρατήρηση: δεν χρειάστηκε ξεχωριστό "live vs saved" state, το `watch`/`useWatch` ΕΙΝΑΙ ήδη η πηγή αλήθειας). Save → `setEditOpen(false)` στο `onSuccess` του mutate. Κεφαλαιοποίηση: `register(..., { onChange: (e) => { e.target.value = capitalizeFirst(e.target.value) } })` — τυπικό react-hook-form transform pattern (μεταλλάσσει το `e.target.value` πριν το διαβάσει το ίδιο το RHF, δουλεύει επειδή τα δικά μας `Input` δεν είναι forwardRef-wrapped—React 19 περνάει `ref` σαν κανονικό prop).

### 🐛 Lint fix: `react-hooks/set-state-in-effect` (ξανά, ίδια οικογένεια προβλήματος με το παλιό FanProfileRoute fix)
Το live debounced display-name check έκανε αρχικά `setState` ΣΥΓΧΡΟΝΙΣΜΕΝΑ μέσα στο σώμα του effect (πριν καν το `setTimeout`) — flagged. **Λύση:** το "checking"/"idle" status έγινε **derived τιμή** (υπολογίζεται στο render, όχι state) από `editOpen`+τρέχον/αρχικό display name· το ΜΟΝΟ πραγματικό `setState` έμεινε ΜΕΣΑ στο `setTimeout` callback (ασύγχρονο, "κλειδωμένο" στη συγκεκριμένη τιμή που ελέγχθηκε, ώστε να μη δείχνει ποτέ stale αποτέλεσμα από προηγούμενο πληκτρολόγημα).

### Verification
`npx eslint .` + `npm run build` καθαρά (μόνο τα ίδια 13 pre-existing errors σε `ui/*.jsx`). **Δεν έχει γίνει live browser verification ακόμα** (εκκρεμεί το migration).


## Sidebar component (shadcn) — πραγματικό πηγαίο κώδικας, όχι improvisation

Ο χρήστης ζήτησε να χρησιμοποιηθεί το πραγματικό sidebar component του shadcn (https://ui.shadcn.com/docs/components/radix/sidebar) ως βάση, να προσαρμοστεί στις ανάγκες του project — ΟΧΙ να ξαναγραφτεί from scratch (όπως έγινε νωρίτερα για το `select.jsx`, λόγω αδυναμίας του `npx shadcn add` να συνδεθεί με το ui.shadcn.com από το δίκτυο της συσκευής).

**Νέα ανακάλυψη:** το `WebFetch` tool (δίκτυο του cloud container, διαφορετικό path από το device_bash) ΜΠΟΡΕΙ να φτάσει το ui.shadcn.com, ΣΥΜΠΕΡΙΛΑΜΒΑΝΟΜΕΝΩΝ των raw registry JSON endpoints (`https://ui.shadcn.com/r/styles/radix-nova/<component>.json`) — επιστρέφουν τον πλήρη, πραγματικό πηγαίο κώδικα TSX. Άρα από εδώ και πέρα, για οποιοδήποτε shadcn component χρειαστεί το project: WebFetch το raw JSON registry endpoint → πάρε το ΠΡΑΓΜΑΤΙΚΟ source → προσάρμοσέ το χειροκίνητα στις συμβάσεις του project — όχι hand-improvised εκδοχή.

**Fetched (μέσω WebFetch, style "radix-nova" — ίδιο με το `components.json` του project):**
- `sidebar.json` → sidebar.tsx (~20 sub-components + `useSidebar` hook)
- `tooltip.json` → tooltip.tsx (dependency, ΔΕΝ υπήρχε ακόμα στο project)
- `skeleton.json` → skeleton.tsx (dependency, ΔΕΝ υπήρχε ακόμα)
- `use-mobile.json` → use-mobile.ts hook (dependency, ΔΕΝ υπήρχε ακόμα)

**Προσαρμογές κατά τη μεταφορά (χειροκίνητα, από το πραγματικό source):**
- Αφαιρέθηκαν όλα τα TypeScript types (ίδιο ύφος με τα υπόλοιπα `ui/*.jsx`)
- `import { cn } from "cn"` → `import { cn } from "@/lib/utils"`
- Εσωτερικά imports (`@/registry/radix-nova/ui/...`) → `@/components/ui/...`
- `@/registry/radix-nova/hooks/use-mobile` → `@/hooks/useIsMobile` (project convention: hooks σε `src/hooks/`, camelCase filename όπως `useAuth.js`/`useMerchCategories.js`)
- Το `SidebarTrigger` χρησιμοποιούσε `IconPlaceholder` (site-specific abstraction του shadcn docs site) — αντικαταστάθηκε με απλό `PanelLeftIcon` από `lucide-react` (ίδιο pattern με τα υπόλοιπα `ui/*.jsx`, π.χ. `dropdown-menu.jsx`)
- `useIsMobile`: γράφτηκε με `useSyncExternalStore` αντί για το αρχικό `useState`+`useEffect`+συγχρονισμένο `setState` — official React pattern ακριβώς για sync με browser API (matchMedia), αποφεύγει καθαρά το `react-hooks/set-state-in-effect` lint error (ίδια οικογένεια προβλήματος με το παλιό FanProfileRoute fix, εδώ λύθηκε με καλύτερο pattern αντί για workaround)
- Επιβεβαιώθηκαν όλα τα registryDependencies: `button`, `separator`, `sheet`, `input` (ήδη στο project)· `tooltip`, `skeleton`, `use-mobile` (νέα)
- Επιβεβαιώθηκε ότι τα CSS custom properties `--sidebar*` υπάρχουν ΗΔΗ στο `src/index.css` (light+dark) — καμία αλλαγή CSS δεν χρειάστηκε

**Νέα αρχεία:**
```
src/hooks/useIsMobile.js
src/components/ui/tooltip.jsx
src/components/ui/skeleton.jsx
src/components/ui/sidebar.jsx
```

### Verification
`npx eslint` στα 4 νέα αρχεία: καθαρό εκτός από 2 errors που ταιριάζουν ΑΚΡΙΒΩΣ με το ήδη αποδεκτό pattern των υπόλοιπων `ui/*.jsx` (unused `React` import στο tooltip.jsx, `react-refresh/only-export-components` στο sidebar.jsx — ίδιο με το προϋπάρχον `button.jsx`). `npm run build` απέτυχε, αλλά για ΑΣΧΕΤΟ, προϋπάρχον λόγο: το `src/components/Header/Header.jsx` λείπει από το δίσκο (`git status` το δείχνει `D` — deleted, tracked αλλά όχι στο working tree) ενώ ακόμα το κάνει import το `TenantLayout.jsx`· ΔΕΝ το άγγιξα, άσχετο με τη δουλειά του sidebar — ο χρήστης πρέπει να το δει (πιθανό ημιτελές refactor ή κατά λάθος διαγραφή· επίσης αρκετά migration `.sql` αρχεία εμφανίζονται deleted από το δίσκο).

### Εκκρεμεί
Πού θα εφαρμοστεί το Sidebar: αντικατάσταση του υπάρχοντος Fan Dashboard sidebar (hand-rolled, icon-rail + Sheet drawer) ή θεμέλιο για το (μη ξεκινημένο ακόμα) Tenant Admin Dashboard; Ρωτήθηκε στον χρήστη, εκκρεμεί απάντηση.



### Εφαρμογή στο Fan Dashboard (FanDashboardLayout.jsx v2)

Το `FanDashboardLayout.jsx` ξαναγράφτηκε πάνω στο νέο Sidebar (αντί για το χειροποίητο icon-rail + Sheet drawer combo της v1). Το TenantChip μπήκε μέσα στο `SidebarHeader` (μία υλοποίηση για mobile+desktop αντί για δύο ξεχωριστές όπως πριν), τα 5 nav items έγιναν `SidebarMenuItem`/`SidebarMenuButton` (asChild πάνω σε `NavLink`, `isActive` υπολογισμένο από `useLocation()`, `tooltip` prop δείχνει το όνομα όταν το sidebar είναι icon-only), `collapsible="icon"` ώστε ο χρήστης να μπορεί να το μαζέψει/ανοίξει (πριν ήταν πάντα σταθερό 80px rail στο desktop) — το θυμάται μέσω cookie. Προστέθηκε `SidebarTrigger` στο top header (αντικαθιστά το παλιό Bars3Icon+Sheet hamburger) και `SidebarRail` (λεπτή λωρίδα στην άκρη, εναλλακτικός τρόπος toggle).

**Συνειδητή αλλαγή που αξίζει να τη δει ο χρήστης σε πραγματικό build:** το χρώμα. Το v1 είχε πάντα σκούρο (`bg-gray-900`) rail· το νέο Sidebar χρησιμοποιεί το default (ανοιχτόχρωμο) shadcn sidebar theme (τα `--sidebar*` CSS vars υπάρχουν ήδη στο `index.css` και για dark mode, αλλά δεν ενεργοποιήθηκε καμία dark-mode εξαναγκασμένη κλάση εδώ — θα χρειαζόταν ξεχωριστή απόφαση/δοκιμή αν θέλουμε να ξαναγίνει σκούρο). Ο χρήστης πρέπει να το τρέξει (`npm run dev`) και να πει αν του αρέσει έτσι ή θέλει το παλιό σκούρο look.

**Μάθημα διαδικασίας:** μεγάλα αρχεία (π.χ. το 639-γραμμών `sidebar.jsx`) που μεταφέρονται στη συσκευή του χρήστη μέσω `device_bash` πρέπει να επαληθεύονται με `sha256sum` και στις δύο πλευρές πριν θεωρηθούν σωστά γραμμένα — μια πρώτη μεταφορά (μέσω base64 pasted σε μεγάλο block) είχε σιωπηλή αλλοίωση περιεχομένου σε 2 σημεία (`FanDashboardLayout.jsx` πρώτο draft, και το ίδιο το `sidebar.jsx`) που το `eslint`/`build` ΔΕΝ έπιασαν γιατί δεν έσπαγαν το syntax. Λύση: heredoc με quoted delimiter (`cat > file << 'EOF'`) αντί για base64 — μηδενικός κίνδυνος shell-expansion ΚΑΙ πιο αξιόπιστη αναπαραγωγή μεγάλου κειμένου· επαλήθευση με `sha256sum` πάντα μετά από μεταφορά μεγάλου αρχείου.

### Εκκρεμεί
Tenant Admin Dashboard: θα ξαναχρησιμοποιηθεί το ίδιο Sidebar σύστημα όταν ξεκινήσει η υλοποίησή του (ο χρήστης το επιβεβαίωσε). Ο χρήστης πρέπει να δοκιμάσει live το νέο Fan Dashboard sidebar και να πει αν του αρέσει το ανοιχτόχρωμο theme ή θέλει να ξαναγίνει σκούρο.


### 🐛 Bug (βρέθηκε από τον χρήστη σε πραγματικό build): `Tooltip must be used within TooltipProvider`

Ο χρήστης δοκίμασε το νέο Fan Dashboard sidebar και ανέφερε ότι πατώντας το SidebarTrigger εικονίδιο (δίπλα στο "Ο λογαριασμός μου") η σελίδα έσκαγε σε error page. Screenshot + console log επιβεβαίωσαν ακριβώς την αιτία: `Tooltip must be used within TooltipProvider`, πεταμένο μέσα από `SidebarMenuButton` (κάθε nav item περνάει `tooltip={item.name}`, που ρεντεράρει ένα `<Tooltip>` — Radix Tooltip.Root — ΠΑΝΤΑ, ανεξάρτητα αν είναι ορατό). Ξέχασα να προσθέσω `<TooltipProvider>` κάπου στο δέντρο — το ίδιο το shadcn το αναφέρει ρητά στην τεκμηρίωσή του (docs field του tooltip.json registry entry): "Remember to wrap your app with the TooltipProvider component."

**Fix:** `<TooltipProvider>` προστέθηκε ΜΙΑ φορά στη ρίζα, στο `App.jsx` (τυλίγει το `<ConcertoBar>` + το root `<Outlet>`) — καλύπτει αυτόματα ΚΑΘΕ μελλοντικό `<Tooltip>` οπουδήποτε στο δέντρο, όχι μόνο το Fan Dashboard sidebar, άρα και το μελλοντικό Tenant Admin Dashboard δεν θα χρειαστεί να το ξαναπροσθέσει.

`npx eslint src/App.jsx` καθαρό (0 errors, ούτε καν από τα ήδη γνωστά 2 patterns). `npm run build` καθαρό.

### 🔍 Έλεγχος (audit) για άλλα missing Provider/setup gaps, μετά το bug του Tooltip

Μετά το bug του `TooltipProvider`, ο χρήστης ζήτησε έλεγχο όλου του project για ανάλογα κενά — άλλο Radix component που να χρειάζεται root Provider/wrapper και να μην το έχουμε προσθέσει. Έλεγχος:

- Καταγράφηκαν όλα τα Radix primitives που χρησιμοποιεί σήμερα το project (μέσα από το ενιαίο πακέτο `radix-ui`): `Dialog`, `DropdownMenu`, `Label`, `Select`, `Separator`, `Sheet` (= Dialog), `Slot`, `Tabs`, `Tooltip`.
- Για καθένα εκτός του Tooltip, ελέγχθηκε το επίσημο shadcn registry entry (docs field) — κανένα δεν αναφέρει ανάγκη για root Provider/wrapper. Είναι όλα self-contained ανά instance (κάθε `<Dialog>`, `<Select>` κ.λπ. κουβαλάει το δικό του context, δεν χρειάζεται κοινό ancestor).
- Ελέγχθηκε αν χρησιμοποιείται `Toast`/`Sonner` πουθενά στο project (θα χρειαζόταν δικό του `<Toaster />` στη ρίζα) — δεν βρέθηκε καμία χρήση, άρα δεν εκκρεμεί τίποτα εκεί.
- Επιβεβαιώθηκε ότι ΟΛΑ τα routes (main.jsx) είναι children του root route `'/'` με `element: <App />` — άρα το `<TooltipProvider>` που μπήκε στη ρίζα του `App.jsx` καλύπτει πραγματικά ΟΛΟ το δέντρο, χωρίς κανένα route να το προσπερνάει.
- Παράλληλα ξεκαθαρίστηκε και το ανοιχτό ερώτημα για το light/dark theme του νέου sidebar: το `src/index.css` έχει ήδη ΣΩΣΤΑ ορισμένα και τα δύο sets of `--sidebar-*` CSS variables (light στο `:root`, dark στο `.dark`) — δεν λείπει τίποτα εκεί. Απλά το project δεν έχει ακόμα κανέναν μηχανισμό dark mode (δεν βρέθηκε `ThemeProvider`/`next-themes`/οποιοδήποτε σημείο που να προσθέτει την κλάση `.dark` πουθενά) — άρα το sidebar εμφανίζεται σήμερα μόνο στο light theme, όχι επειδή λείπει κάποιο setup, αλλά επειδή δεν έχει χτιστεί ακόμα dark mode toggle. Το αν θα προστεθεί dark mode αργότερα παραμένει ανοιχτή απόφαση του χρήστη.

**Συμπέρασμα:** δεν βρέθηκε άλλο missing-Provider/setup gap. Το μόνο πραγματικό ήταν το Tooltip, ήδη διορθωμένο.

### Sidebar v3 — collapsible submenu (Αγαπημένα / Καλάθι)

Ο χρήστης περιέγραψε νέο concept για το Fan Dashboard sidebar: αντί για επίπεδη λίστα με 5 εικονίδια (v2), δύο από αυτά ("Αγαπημένα", "Καλάθι") να ανοίγουν υποκατηγορίες μέσα στο ίδιο το sidebar όταν πατιούνται — ακριβώς το demo που δείχνουν οι δύο screenshots που έστειλε (Platform → Playground → History/Starred/Settings). Επιβεβαιώθηκε ότι αυτό είναι ΚΥΡΙΟΛΕΚΤΙΚΑ το επίσημο `nav-main.tsx` pattern από το shadcn `sidebar-07` block (Collapsible + SidebarMenuSub) — άρα ακολουθείται πιστά το πραγματικό πρότυπο, όχι improvisation.

**Νέο real component:** `src/components/ui/collapsible.jsx` (Radix `Collapsible` primitive — `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`), fetched από το πραγματικό registry (`ui.shadcn.com/r/styles/radix-nova/collapsible.json`) και προσαρμοσμένο σε JS/JSX (αφαίρεση TS types, ίδια δομή).

**Τελική δομή NAV_ITEMS (FanDashboardLayout.jsx v3):**
- Προφίλ (leaf, όπως στο v2) → `/account/profile`
- Αγαπημένα (group, HeartIcon) → Αγαπημένα tenants (`/account/tenants`), Αγαπημένα merch (`/account/merch`), Αγαπημένα events (`/account/events`) — ΜΙΑ υποκατηγορία για events, όχι upcoming/past ξεχωριστά (ρητή διόρθωση του χρήστη).
- Καλάθι (group, ShoppingCartIcon) → Ολοκληρωμένες παραγγελίες (`/account/orders` — ΙΔΙΟ route με πριν, απλά μετακινήθηκε μέσα στο νέο submenu, καμία διπλή λογική/route), Τρέχον καλάθι (ΝΕΟ route `/account/cart` → νέο placeholder component `FanCurrentCartRoute.jsx`, ίδιο ύφος με το ήδη υπάρχον `FanOrdersRoute.jsx` — δεν υπάρχει ακόμα σύστημα καλαθιού).

**Εικονίδιο "Ολοκληρωμένες παραγγελίες":** `CheckCircleIcon` (Heroicons outline), βαμμένο πράσινο (`text-green-600`) — αντιστοιχεί στο "πράσινο κυκλικό με λευκό βελάκι" που περιέγραψε ο χρήστης. Μπαίνει ως προαιρετικό icon μέσα στο `SidebarMenuSubButton` — data/props-level προσθήκη, καμία δομική αλλαγή στο ίδιο το component (το `isActive` prop του `SidebarMenuSubButton` επιβεβαιώθηκε ήδη υπαρκτό στο `sidebar.jsx`, χρησιμοποιείται κανονικά).

**⚠️ Business rule προς υλοποίηση αργότερα (ΜΗΝ ξεχαστεί):** ο χρήστης ζήτησε ρητά τα αγαπημένα events να δείχνουν ΜΟΝΟ επερχόμενα — όταν περνάει η ημερομηνία ενός event, να φεύγει μόνο του από τη λίστα αγαπημένων. Αυτό ΔΕΝ υλοποιήθηκε τώρα (το `FanFavoriteEventsRoute.jsx` είναι ακόμα σε πρώιμο/placeholder στάδιο δεδομένων) — πρέπει να μπει στο query/φίλτρο όταν χτιστεί το πραγματικό data layer για τα αγαπημένα events (πιθανότατα φίλτρο στο query βάσει ημερομηνίας, ή/και decision αν διαγράφεται πραγματικά η εγγραφή favorite ή απλά κρύβεται — προς συζήτηση τότε).

`npx eslint` σε όλα τα αλλαγμένα/νέα αρχεία (`collapsible.jsx`, `FanDashboardLayout.jsx`, `FanCurrentCartRoute.jsx`, `main.jsx`) → 0 errors. `npm run build` → καθαρό (το already-known bundle-size warning είναι preexisting, άσχετο με αυτή την αλλαγή).

### Sidebar v4 — icon bar κάτω από τον τίτλο (αντί για αριστερό sidebar)

Ο χρήστης δοκίμασε το v3 (αριστερό shadcn Sidebar, collapsed σε λεπτή icon-only rail) και έστειλε screenshot: τα εικονίδια στη rail έδειχναν πολύ λεπτά/χωρίς ορατό κουμπί-περίγραμμα. Ζήτησε ρητά διόρθωση: (1) κάθε εικονίδιο μέσα σε κυκλικό border κολλητό στο μέγεθός του, (2) η μπάρα εικονιδίων να φύγει από το αριστερό sidebar και να μπει εμφανέστερα ΚΑΤΩ από τον τίτλο "Ο λογαριασμός μου", (3) ξεκάθαρο active-state indicator. Ρωτήθηκε ρητά (AskUserQuestion) αν ήθελε να μετακινηθεί η μπάρα κάτω από τον τίτλο ή να μείνει στο sidebar απλά πιο ορατή — επέλεξε μετακίνηση.

**Νέα δομή (FanDashboardLayout.jsx v4):** το `SidebarProvider`/`Sidebar`/`SidebarRail`/`SidebarInset` (v2/v3) αφαιρέθηκε εντελώς από αυτό το layout. Αντ' αυτού: header με τίτλο "Ο λογαριασμός μου" (+ TenantChip δεξιά, μετακινήθηκε εδώ από το πρώην SidebarHeader), και από κάτω μια οριζόντια `<nav>` με κυκλικά εικονίδια-κουμπιά (`size-11` κύκλος γύρω από `size-5` icon, `bg-primary` όταν active, μαύρο-φόντο ↔ διαφανές border ανάλογα state — ξεκάθαρη οπτική διαφορά, όχι απλή απόχρωση φόντου όπως πριν).

**"Αγαπημένα"/"Καλάθι"** (τα δύο group items) ανοίγουν πλέον `DropdownMenu` (πραγματικό Radix primitive, ήδη υπαρκτό `dropdown-menu.jsx` στο project) κάτω από το εικονίδιο, με τις υποκατηγορίες μέσα — ίδιο pattern με το `nav-projects.tsx` του επίσημου shadcn `sidebar-07` block. Το "Ολοκληρωμένες παραγγελίες" κρατάει το πράσινο `CheckCircleIcon` του.

**Δεν διαγράφηκε τίποτα από το v2/v3** — `sidebar.jsx`, `collapsible.jsx`, `tooltip.jsx`, `skeleton.jsx`, `useIsMobile.js` παραμένουν στο project αχρησιμοποίητα εδώ αλλά έτοιμα για το μελλοντικό Tenant Admin Dashboard (ο χρήστης είχε πει "και τα δύο" νωρίτερα — θα κριθεί ξανά τότε αν ταιριάζει καλύτερα το πραγματικό Sidebar εκεί, ή αν προτιμηθεί κι εκεί το ίδιο icon-bar pattern).

`npx eslint` καθαρό. `npm run build` καθαρό (ίδιο preexisting bundle-size warning, άσχετο).

### Sidebar v5 — pill icon bar (στυλ Instagram bottom nav) + 2 νέα εικονίδια

Ο χρήστης έστειλε screenshot από Instagram (η ημιδιάφανη pill μπάρα κάτω από ένα Reel: Home/Reels/Direct/Search/Avatar, το Home με γκρι στρογγυλό highlight πίσω του) και ζήτησε το ίδιο στυλ για τη μπάρα εικονιδίων του v4. Υιοθετήθηκε το ΣΤΥΛ (στρογγυλό pill container με border, ήσυχο `bg-muted` highlight πίσω από το επιλεγμένο αντί για γεμάτο χρώμα, solid εκδοχή του εικονιδίου όταν active αντί για outline — ίδια σύμβαση με το IG bar) — ΟΧΙ η "ημιδιάφανη μπάρα πάνω σε video" συμπεριφορά, αφού δεν υπάρχει video background σε αυτή τη σελίδα· παρέμεινε στατική κάτω από τον τίτλο. Ρητά σημειωμένο στο ίδιο το αρχείο ως σχόλιο, ώστε αν ο χρήστης θέλει πραγματικό floating/sticky bar να το ζητήσει ρητά.

**Δύο νέα εικονίδια με πραγματική λειτουργικότητα, μπήκαν μέσα στο ίδιο pill:**
- **"C"** (αριστερά) — προσωρινό, μέχρι να δοθεί το πραγματικό λογότυπο Concerto. Ήδη λειτουργικό: εξωτερικό link στο μελλοντικό `concertofamily.gr` (plain `<a href>`, ίδιο convention με το `crossTenantHref` cross-domain pattern που υπάρχει ήδη στο project). **Εκκρεμεί:** αντικατάσταση του γράμματος με το πραγματικό λογότυπο όταν δοθεί.
- **Avatar tenant** (δεξιά) — ίδια λειτουργικότητα με το παλιό `TenantChip` (v2-v4: `logo_url` του tenant, click → `/about`), αλλά τώρα ζει ΜΕΣΑ στο pill αντί για ξεχωριστά δίπλα στον τίτλο. Το `TenantChip` ως ξεχωριστό component αφαιρέθηκε — απορροφήθηκε στο ίδιο pill.

Icon-ordering: C (brand/home) → Προφίλ → Αγαπημένα → Καλάθι → tenant avatar — ίδια λογική θέση με το IG (brand/home αριστερά, avatar δεξιά).

`npx eslint` καθαρό, `npm run build` καθαρό (ίδιο preexisting bundle-size warning, άσχετο με αυτή την αλλαγή — απλά μεγαλύτερο icon set από τα δύο Heroicons sets, outline+solid).

### 🐛 Console warning: `Blocked aria-hidden on an element because its descendant retained focus`

Ο χρήστης ανέφερε ότι πατώντας την καρδούλα ("Αγαπημένα") και ξαναπατώντας την (άνοιγμα/κλείσιμο του dropdown) εμφανιζόταν αυτό το warning στο console. ΔΕΝ ήταν crash/ErrorPage — μόνο console warning.

**Αιτία:** γνωστό, καταγεγραμμένο συμπεριφορά/ζήτημα του Radix `DropdownMenu` (`modal` prop = `true` by default) — όσο το menu είναι ανοιχτό, ο Radix κρύβει (`aria-hidden`) τα γύρω στοιχεία από assistive technology και κλειδώνει το focus μέσα στο menu (modal/focus-trap συμπεριφορά). Όταν κλείνει, το focus επιστρέφει στο trigger button την ίδια στιγμή που αφαιρείται το `aria-hidden` από τους predecessors — η σειρά αυτών των δύο ενεργειών προκαλεί στιγμιαία ασυνέπεια που το Chrome επισημαίνει ως console warning.

**Fix:** προστέθηκε `modal={false}` στο `<DropdownMenu>` (FanDashboardLayout.jsx) — επίσημο, τεκμηριωμένο prop του ίδιου του Radix `DropdownMenu.Root` (όχι custom workaround). Αφαιρεί το focus-trap/aria-hidden-background συμπεριφορά για αυτά τα δύο navigation dropdowns (Αγαπημένα/Καλάθι) — λογικό εδώ αφού δεν είναι κρίσιμα modal forms, απλά navigation menus. `npx eslint`/`npm run build` καθαρά μετά το fix.

### Sidebar v6 — το pill πήρε τη θέση του ConcertoBar, πραγματικό λογότυπο, πραγματικό "τρέχον καλάθι"

Μεγάλη αλλαγή, πολλά κομμάτια μαζί — ο χρήστης τα ζήτησε όλα στο ίδιο μήνυμα:

**1. Το global ConcertoBar (dark bar "Concerto" + avatar, πάνω από ΚΑΘΕ σελίδα) κρύβεται πλέον μέσα στο `/account`.** `App.jsx` παίρνει `useLocation()`, υπολογίζει `isAccountSection = pathname.startsWith("/account")`, ρεντεράρει `<ConcertoBar>` μόνο όταν `!isAccountSection`. Στις tenant-branded σελίδες (about/merch/events) το ConcertoBar παραμένει ΑΚΡΙΒΩΣ όπως ήταν — καμία αλλαγή εκεί.

**2. Το pill nav (v5) ανέβηκε στη θέση του, ΜΕΣΑ στο FanDashboardLayout.jsx**: `sticky top-4`, οριζόντια κεντραρισμένο (`flex justify-center`), με κενό από πάνω (`pt-4` wrapper πριν το sticky, ώστε να υπάρχει κενό ΚΑΙ πριν κάνει scroll ο χρήστης), `bg-background/80` + `backdrop-blur-md` ώστε να μη σκεπάζει εντελώς το περιεχόμενο πίσω του καθώς "κατεβαίνει" μαζί με το scroll. Ο τίτλος "Ο λογαριασμός μου" δεν είναι πια μέσα στο sticky pill — μετακινήθηκε σαν απλό κείμενο μέσα στο scrollable περιεχόμενο, πάνω από το Outlet (δική μου επιλογή, δεν ζητήθηκε ρητά — να ειδοποιηθεί ο χρήστης να το ελέγξει).

**3. Το προσωρινό "C" αντικαταστάθηκε με το πραγματικό λογότυπο Concerto** — ο χρήστης έδωσε το αρχείο, αποθηκεύτηκε ως `src/assets/images/concerto-logo.jpg` (ίδιο convention με `bandLogoFallback`/`bandCoverFallback` στο Header.jsx — τοπικό asset, ES import, όχι public/ folder). ⚠️ Σημείωση διαδικασίας: η μεταφορά αρχείου εικόνας μέσω `device_commit_files` άλλαξε το checksum (7330 bytes → 13101 bytes, re-encode, ΟΧΙ corruption — επιβεβαιώθηκε οπτικά ότι είναι πανομοιότυπη εικόνα, ίδιες διαστάσεις 514×502) — για εικόνες/binary αρχεία το sha256 check ΔΕΝ είναι αξιόπιστο σαν μόνο κριτήριο όπως στα .jsx/.md text αρχεία, χρειάζεται οπτική επιβεβαίωση (στάλθηκε πίσω, ανοίχτηκε, επιβεβαιώθηκε ίδιο). Link του λογότυπου: `https://concertofamily.gr` (το μελλοντικό κεντρικό domain).

**4. Το avatar-με-τις-επιλογές (Προφίλ/Διαγραφή λογαριασμού/Αποσύνδεση) μπήκε στο pill, δίπλα στο λογότυπο** — νέο component `src/components/Concerto/FanDashboard/AccountAvatarMenu.jsx`, ΙΔΙΕΣ επιλογές με το dropdown που είχε το ConcertoBar, αλλά ξεχωριστό αρχείο (ΟΧΙ shared component) — εδώ δεν χρειάζεται το "μη συνδεδεμένος" branch/login button/ConcertoAuthDialog, αφού μέσα στο Fan Dashboard ο fan είναι ΠΑΝΤΑ ήδη συνδεδεμένος. Ηθελημένη μικρή επανάληψη κώδικα αντί για πρόωρο shared abstraction μεταξύ δύο components με διαφορετικές ανάγκες (risk/complexity tradeoff, βλ. session log).

**5. Το reactive guard "μη συνδεδεμένος fan στο /account → πίσω στο /about" μετακόμισε από το ConcertoBar.jsx στο ίδιο το FanDashboardLayout.jsx.** Κρίσιμο να μη χαθεί όταν το ConcertoBar σταμάτησε να ρεντεράρεται εκεί — τώρα ζει πιο φυσικά, δίπλα στο route που προστατεύει, και είναι ΚΑΙ απλούστερο (δεν χρειάζεται πια το `location.pathname.startsWith("/account")` check — αφού αυτό το layout ΕΙΝΑΙ το `/account`).

**6. "Τρέχον καλάθι" έγινε πραγματικό** (ανακαλύφθηκε ότι υπάρχει ΗΔΗ πλήρες σύστημα καλαθιού per-tenant: `useCart.js`, `cart_items` table, tenant-scoped — η προηγούμενη σημείωση "δεν υπάρχει σύστημα καλαθιού" αφορούσε global/συγκεντρωτικό view, όχι το ίδιο το καλάθι). Νέο `src/queries/useFanCart.js` — ίδιο στυλ διαδοχικών queries με `useFanFavoriteMerch.js`/`useFanTenants.js`, ομαδοποιεί ΑΝΑ tenant. `FanCurrentCartRoute.jsx` δείχνει tenant name+logo και τα προϊόντα του, READ-ONLY (link "πίσω στο tenant" για μεταβολή ποσότητας/αφαίρεση — δεν αναδημιουργείται το CRUD που ήδη υπάρχει στο CartDialog.jsx ανά tenant). Αν ο χρήστης θέλει inline quantity-edit και εδώ, είναι follow-up, όχι έγινε τώρα.

`npx eslint` καθαρό σε όλα τα αλλαγμένα/νέα αρχεία (`App.jsx`, `ConcertoBar.jsx`, `AccountAvatarMenu.jsx`, `FanDashboardLayout.jsx`, `FanCurrentCartRoute.jsx`, `useFanCart.js`). `npm run build` καθαρό, το λογότυπο μπήκε σωστά στο bundle (13.10 kB asset).

### Μικροδιόρθωση: το λογότυπο Concerto στο pill έγινε ανενεργό (προσωρινά)

Ο χρήστης ζήτησε ρητά: μέχρι να υπάρξει πραγματική σελίδα στο `concertofamily.gr`, το λογότυπο στο pill (FanDashboardLayout.jsx) να ΜΗΝ κάνει τίποτα όταν το πατάει κάποιος — να μην υπάρχει "νεκρό" link. Το `<a href="https://concertofamily.gr">` έγινε απλό `<div>` (ίδια εμφάνιση, καμία πλοήγηση). Σχόλιο μέσα στο JSX εξηγεί γιατί και τι να αλλάξει (ξαναβάλε `href`) όταν υπάρξει πραγματικός προορισμός — ΜΗΝ το ξεχάσουμε.

`npx eslint`/`npm run build` καθαρά.

### 🐛 Μικροδιόρθωση: το pill δεν έμενε ορατό κατά το scroll

Ο χρήστης δοκίμασε και ανέφερε ότι το pill (v6) ΔΕΝ συνέχιζε να φαίνεται καθώς έκανε scroll — το `position: sticky` που είχε μπει δεν δούλευε όπως αναμενόταν (πιθανό ζήτημα με κάποιον ancestor/stacking context, δεν επιβεβαιώθηκε ακριβώς ποιο — δεν υπάρχει δυνατότητα να δει ο AI assistant live browser σε αυτό το session, βλ. brief).

**Fix:** `position: sticky` → `position: fixed` (`fixed inset-x-0 top-4 z-40`) — το fixed είναι ΠΑΝΤΑ σχετικό με το viewport, ανεξάρτητο από τυχόν overflow/stacking στους γονείς του, άρα εγγυημένα "κατεβαίνει μαζί" με τον χρήστη. Επειδή το fixed βγαίνει από το normal document flow, το περιεχόμενο από κάτω χρειάστηκε `pt-20` (ήταν `pt-8`) ώστε να μην κρύβεται η αρχή του πίσω από το bar. Παράλληλα εντονοποιήθηκε λίγο το "θολό γυαλί" εφέ όπως ζητήθηκε: `bg-background/80` → `/70`, `backdrop-blur-md` → `backdrop-blur-lg`.

`npx eslint`/`npm run build` καθαρά.

---

## Οδηγία προς AI assistant (Claude ή άλλο)

> Αυτό είναι το επίσημο, ζωντανό log του React Router task. Ενημέρωσέ το σε κάθε βήμα (τι έγινε, τι αποφασίστηκε, τι εκκρεμεί) — μην αφήνεις να "χαθεί" η σειρά μέσα στο κύριο brief. Ακολούθα αυστηρά τους κανόνες εργασίας στην κορυφή αυτού του εγγράφου.
