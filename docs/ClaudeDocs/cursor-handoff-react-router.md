# CONCERTO — Handoff προς Cursor Agent (Claude Opus 5)

## Πλαίσιο

Συνεχίζουμε δουλειά πάνω στο project "Concerto" (React + Vite + Tailwind + Supabase + shadcn/Radix UI). Αυτή τη στιγμή δουλεύουμε στο **React Router task** — βρίσκεσαι σε ξεχωριστή συνεδρία (Cursor) επειδή τελείωσε ο χρόνος στην προηγούμενη (Claude.ai chat). Ακολούθα ΑΚΡΙΒΩΣ τους κανόνες παρακάτω — έχουν προκύψει από πραγματικά bugs/λάθη σε προηγούμενες συνεδρίες.

---

## ΑΥΣΤΗΡΟΙ ΚΑΝΟΝΕΣ ΕΡΓΑΣΙΑΣ (μη τους παραβείς)

1. **Πριν διορθώσεις/ενημερώσεις ΟΠΟΙΟΔΗΠΟΤΕ υπάρχον αρχείο, διάβασέ το πρώτα το ίδιο από το filesystem.** Μην υποθέτεις τι περιέχει βάσει περιγραφής — άνοιξέ το και δες το πραγματικό, τρέχον περιεχόμενο. (Στο Cursor έχεις άμεση πρόσβαση στο filesystem — χρησιμοποίησέ το, μην ζητάς copy-paste όπως γινόταν στο chat.)

2. **Radix UI / shadcn / Tailwind — ακολούθα πιστά, ΜΗΝ αυτοσχεδιάζεις.** Όταν δίνεται reference component (από Tailwind Plus, ui.shadcn.com, κ.λπ.), αναπαρήγαγε ΑΚΡΙΒΩΣ τη δομή/primitives του. Προσαρμογή ΜΟΝΟ σε data/props/business logic, ποτέ στην αρχιτεκτονική του component.

3. **Αν δοθεί reference χτισμένο με διαφορετική βιβλιοθήκη** (π.χ. `@headlessui/react` αντί για `radix-ui` που ήδη χρησιμοποιεί το project), ΜΗΝ εγκαταστήσεις τη νέα βιβλιοθήκη — αναπαρήγαγε το ίδιο οπτικό αποτέλεσμα με τα ήδη υπάρχοντα Radix primitives του project.

4. **React Router: ακολούθα ΑΥΣΤΗΡΑ το επίσημο "Data Router" pattern** από την τεκμηρίωση reactrouter.com (`createBrowserRouter`, `<RouterProvider>`). Καμία αυτοσχέδια παραλλαγή.

5. **Routing δεν είναι "όλα ή τίποτα".** Σε κάθε νέο κομμάτι, σκέψου μαζί με τον χρήστη αν πραγματικά χρειάζεται δικό του URL (μοιράσιμο link) ή αν μπορεί να μείνει απλό React state — μην προτείνεις αυτόματα routing παντού. Παρουσίασε trade-offs, μην αποφασίζεις μόνος σου.

6. **Ασφάλεια URLs (τεκμηριωμένο σήμερα):**
   - Products/categories → ασφαλή, δημόσια, OK να έχουν URL.
   - Cart → OK να έχει URL, αλλά ΠΟΤΕ να μην κωδικοποιούνται δεδομένα καλαθιού μέσα στο ίδιο το URL (μόνο view, δεδομένα έρχονται από authenticated session/DB).
   - Checkout/Payment (μελλοντικό, ΔΕΝ χτίζεται τώρα) → όταν φτάσει η ώρα του: ΠΟΤΕ ευαίσθητα δεδομένα σε URL, χρήση UUID (όχι sequential IDs) + RLS authorization ώστε να μην υπάρχει IDOR risk, πραγματικά στοιχεία κάρτας μόνο μέσω payment processor (π.χ. Stripe.js tokenization), ποτέ μέσω δικού μας server/URL.

7. **Ενημέρωσε το `concerto-react-router-brief.md`** (βρίσκεται στον φάκελο του project, ή ζήτα το από τον χρήστη αν δεν το βλέπεις) σε κάθε βήμα — τι έγινε, τι αποφασίστηκε, τι εκκρεμεί. Μην αφήνεις να χαθεί η σειρά.

---

## Πού βρισκόμαστε ΤΩΡΑ στο React Router task

**Προαπαιτούμενο (ήδη ολοκληρωμένο):** Bfcache fix στο `src/hooks/useAuth.js` (pageshow event listener, επιβεβαιωμένο ότι δουλεύει).

**Απόφαση σειράς:** Ξεκινάμε με το **Merch Store πρώτο**, μετά Events, μετά tenant home page.

**Σχέδιο routes (Merch), υπό συζήτηση:**
```
/merch                          → CategoryGrid (αρχική οθόνη κατηγοριών)
/merch/category/:categoryKey    → λίστα προϊόντων μιας κατηγορίας
/merch/product/:productId       → μεμονωμένο προϊόν
```

**⚠️ ΕΚΚΡΕΜΗ ΑΠΟΦΑΣΗ #1 (ρώτα τον χρήστη πριν προχωρήσεις):** Το μεμονωμένο προϊόν (`/merch/product/:productId`), όταν έχει δικό του URL, θα ανοίγει:
- (α) σαν **modal** πάνω από τη λίστα (ό,τι κάνει ήδη το `ProductQuickShop.jsx`), ή
- (β) σαν **πλήρης σελίδα** (νέο component, "ProductOverview" — έχει αναφερθεί στο κύριο brief ως μελλοντικό task, ΔΕΝ έχει χτιστεί ποτέ, δεν χρησιμοποιείται πουθενά ακόμα).

**⚠️ ΕΚΚΡΕΜΗ ΑΠΟΦΑΣΗ #2:** Τα εσωτερικά tabs του Header (Πληροφορίες/Εκδηλώσεις/Merch Store) — να γίνουν επίσης routes (π.χ. `/events`, `/merch`) ή να μείνουν React state όπως είναι σήμερα; Δεν έχει αποφασιστεί.

**Ο χρήστης ήταν έτοιμος να στείλει screenshot της δομής φακέλων `src/components/Merch/`** — αν δεν το έχεις, ζήτα του να σου δείξει τον φάκελο ή εξερεύνησέ τον μόνος σου στο filesystem.

---

## Τεχνικό context του project (σύντομη σύνοψη)

- **Stack:** React (Vite) + Tailwind + shadcn/ui (Radix primitives) + Supabase (PostgreSQL, Auth, Storage) + React Query (TanStack)
- **Multi-tenant model:** κάθε artist/venue = 1 tenant, δικό του subdomain (`villagers.concerto.gr`), δικό του branding
- **Auth:** Google OAuth μέσω Supabase, πλήρως λειτουργικό (`useAuth.js`, `useFanSession.js`)
- **Merch:** πλήρως λειτουργικό — CategoryGrid, ProductList, ProductGallery, ProductQuickShop, ProductFilters, FavoritesDialog, CartDialog. Cart persistent στη βάση (`cart_items`, fan_id-based, atomic quantity updates)
- **RLS:** πλήρες audit έγινε πρόσφατα, όλα τα tables ασφαλή
- **Deployment:** Netlify, auto-deploy σε κάθε git push στο `main`
- **Domain strategy:** subdomains (`*.concerto.gr`) για τώρα — custom domains + SSO bridge ρητά αναβεβλημένα (business decision, βλ. `concerto-business-venue-partnerships-brief.md`)
- **Στόχος:** Demo σε πραγματική μπάντα μέχρι τέλος μήνα

## Άλλα σχετικά briefs στο project (ζήτα τα αν χρειαστεί περισσότερο context)
- `concerto-brief.md` — το κύριο, μεγάλο technical brief
- `concerto-admin-dashboard-brief.md` — Tenant Admin Dashboard (δεν έχει ξεκινήσει ακόμα)
- `concerto-business-venue-partnerships-brief.md` — business αποφάσεις (venue/manager, custom domains)
- `concerto-react-router-brief.md` — αυτό το task, ζωντανό log

---

## Πρώτη ενέργεια που σου ζητάμε

1. Επιβεβαίωσε ότι βλέπεις/έχεις πρόσβαση στα παραπάνω brief αρχεία στο project.
2. Ρώτα τον χρήστη τις δύο εκκρεμείς αποφάσεις (modal vs. πλήρης σελίδα για το προϊόν· tabs ως routes ή όχι) πριν γράψεις κώδικα.
3. Μετά, ξεκίνα: `npm install react-router-dom` (αν δεν είναι ήδη εγκατεστημένο), και προχώρα με official `createBrowserRouter` setup για το Merch Store πρώτα.
