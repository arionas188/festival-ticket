# CONCERTO — HANDOFF: Events Routing Task

**Ημερομηνία:** 5 Σεπτεμβρίου 2026  
**Από:** Cursor Agent (Claude Sonnet 4.5)  
**Προς:** Claude API Agent  
**Task:** Υλοποίηση routing για μεμονωμένα events

---

## Τι έχει ολοκληρωθεί

### ✅ Merch Store Routing (Ολοκληρώθηκε & Επαληθεύτηκε)

Το Merch Store έχει πλήρες routing με το επίσημο React Router v7 Data Router pattern:

**Routes που υπάρχουν:**
```
/                                                → tenant home (tabs σε React state)
/merch                                           → CategoryGrid
/merch/category/:categoryKey                     → ProductList για συγκεκριμένη κατηγορία
/merch/category/:categoryKey/product/:productId  → modal πάνω στη λίστα
/merch/product/:productId                        → modal πάνω στο CategoryGrid
```

**Τεχνική υλοποίηση:**
- Modal ως **child route** με `<Outlet />`, όχι `backgroundLocation` κόλπο
- Δεδομένα περνούν με `<Outlet context={{...}} />` και `useOutletContext()`
- Το modal κλείνει με `navigate(-1)` ή `navigate("..", {replace: true})` ανάλογα με το `location.key === "default"`
- Auth guard μόνο στο **καλάθι**, όχι στο άνοιγμα προϊόντος (δημόσια URLs)

**Αρχεία που δημιουργήθηκαν:**
- `src/hooks/useMerchCategories.js` — κοινή λογική κατηγοριών
- `src/components/Merch/MerchCategoriesRoute.jsx` — `/merch` route
- `src/components/Merch/MerchCategoryRoute.jsx` — `/merch/category/:categoryKey` route
- `src/components/Merch/ProductModalRoute.jsx` — `/merch/**/product/:productId` modal route
- `public/_redirects` — Netlify SPA fallback (`/* /index.html 200`)

**Αρχεία που άλλαξαν:**
- `src/main.jsx` — προσθήκη `createBrowserRouter` + `<RouterProvider>`
- `src/components/Header/Header.jsx` — `<Outlet />` για Merch, tab sync με URL
- `src/components/Merch/ProductQuickShop.jsx` — auth guard στο add-to-cart

**Αρχεία που διαγράφηκαν:**
- `src/components/Merch/MerchStore.jsx` — η λογική του πήγε στο hook + route components

---

## Επόμενο Task: Events Routing

### Στόχος
Μεμονωμένα events πρέπει να έχουν δικό τους μοιράσιμο URL (π.χ. `/events/:eventId` ή `/event/:eventId`), ώστε ένας χρήστης να μπορεί να στείλει link σε φίλο και να ανοίξει το event με ticket dialog.

### Υπάρχοντα Event Components

**`src/components/Events/EventsSection.jsx`**
- Wrapper που κάνει `useEvents(tenantId)` και render το `EventsList`

**`src/components/Events/EventsList.jsx`**
- Παίρνει `events` array ως prop
- Render grid με event cards
- Κάθε card έχει 3 buttons: **Ticket**, **Location**, **Info**
- Το **Ticket** button ανοίγει το `<TicketDialog>`

**`src/components/Events/TicketDialog.jsx`**
- Modal με ticket types για ένα event
- Κάνει `useTickets(event?.id)` για φόρτωση tickets
- Trigger: `<DialogTrigger asChild><button>...</button></DialogTrigger>`
- Παίρνει `event` prop

**`src/components/Events/EventInfoDialog.jsx`**
- Modal με tabs (Γενικά/Τοποθεσία/Σημειώσεις)
- Παίρνει `event` prop

**`src/queries/useEvents.js`**
```js
export function useEvents(tenantId) {
  return useQuery({
    queryKey: ['events', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('date', new Date().toISOString()) // μόνο μελλοντικά
        .order('date', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
```

---

## Αποφάσεις που χρειάζονται

### 1. Το Εκδηλώσεις tab να γίνει route;

**Επιλογή Α: Το tab γίνεται route `/events`**
- Πλεονέκτημα: Το `/events/:eventId` έχει φυσικό background (τη λίστα)
- Μειονέκτημα: Πρέπει να συγχρονιστούν και τα 3 tabs (Πληροφορίες/Εκδηλώσεις/Merch)

**Επιλογή Β: Το tab μένει React state**
- Πλεονέκτημα: Λιγότερες αλλαγές στο `Header.jsx`
- Μειονέκτημα: Το `/events/:eventId` δεν θα ξέρει ποιο background να δείξει

**Σημείωση:** Στο Merch το tab **έγινε** de facto route, γιατί χωρίς αυτό το `/merch/product/:id` δεν είχε background. Το ίδιο ισχύει και εδώ.

**ΣΥΣΤΑΣΗ:** Κάνε το `/events` route και άσε τα Πληροφορίες ως React state (μερική μετάβαση).

---

### 2. Το event modal να χρησιμοποιεί το TicketDialog;

**Επιλογή Α: Χρήση του υπάρχοντος `TicketDialog`**
- Πλεονέκτημα: Λιγότερος κώδικας, ήδη δουλεύει
- Μειονέκτημα: Το `TicketDialog` έχει το δικό του trigger button, πρέπει refactor

**Επιλογή Β: Νέο component `EventModalRoute`**
- Πλεονέκτημα: Ξεκάθαρος διαχωρισμός
- Μειονέκτημα: Διπλασιασμός κώδικα

**ΣΥΣΤΑΣΗ:** Refactor το `TicketDialog` να δέχεται `open` + `onOpenChange` props (όπως το `ProductQuickShop`), ώστε να το ελέγχεις από έξω.

---

## Τεχνικό Pattern (Ακολούθα το ίδιο με το Merch)

### Δομή Routes
```js
// src/main.jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Merch routes (ήδη υπάρχουν)
      { path: 'merch', element: <MerchCategoriesRoute />, children: [...] },
      { path: 'merch/category/:categoryKey', element: <MerchCategoryRoute />, children: [...] },
      
      // Events routes (να προστεθούν)
      {
        path: 'events',
        element: <EventsRoute />,  // νέο
        children: [
          { path: 'event/:eventId', element: <EventModalRoute /> }  // νέο
        ]
      }
    ]
  }
])
```

### EventsRoute Component (παράδειγμα)
```jsx
import { Outlet, useOutletContext } from "react-router-dom"
import EventsList from "./EventsList"
import { useEvents } from "../../queries/useEvents"

export default function EventsRoute() {
  const context = useOutletContext()
  const { data: events, isLoading, error } = useEvents(context.tenantId)

  if (isLoading) return <p>Φόρτωση events...</p>
  if (error) return <p>Σφάλμα φόρτωσης events.</p>

  return (
    <div>
      <EventsList 
        events={events}
        isLoggedIn={context.isLoggedIn}
        onRequireAuth={context.onRequireAuth}
      />
      <Outlet context={context} />
    </div>
  )
}
```

### EventModalRoute Component (παράδειγμα)
```jsx
import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import TicketDialog from "./TicketDialog"
import { useEvents } from "../../queries/useEvents"

export default function EventModalRoute() {
  const context = useOutletContext()
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: events } = useEvents(context.tenantId)

  const cameFromSharedLink = location.key === "default"

  function handleClose() {
    if (cameFromSharedLink) {
      navigate("..", { replace: true })
      return
    }
    navigate(-1)
  }

  const event = events?.find((e) => e.id === eventId)
  if (!event) return <Navigate to=".." replace />

  return (
    <TicketDialog
      key={event.id}
      event={event}
      open={true}
      onOpenChange={(open) => !open && handleClose()}
      isLoggedIn={context.isLoggedIn}
      onRequireAuth={context.onRequireAuth}
    />
  )
}
```

### Header.jsx Αλλαγές
```jsx
// Στο Header.jsx
const location = useLocation()
const isEventsRoute = location.pathname.startsWith('/events')
const isMerchRoute = location.pathname.startsWith('/merch')

const activeTab = isMerchRoute 
  ? 'Merch Store' 
  : isEventsRoute 
    ? 'Εκδηλώσεις'
    : stateTab

function handleTabClick(tab) {
  if (tab === 'Merch Store') {
    navigate('/merch')
    return
  }
  if (tab === 'Εκδηλώσεις') {
    navigate('/events')
    return
  }
  setStateTab(tab)
  if (isMerchRoute || isEventsRoute) navigate('/')
}

// Στο JSX
{activeTab === 'Εκδηλώσεις' && (
  <Outlet context={{ tenantId: tenant?.id, isLoggedIn, onRequireAuth: requireAuth }} />
)}
```

---

## Κανόνες που πρέπει να ακολουθήσεις

1. **Επίσημο Data Router pattern μόνο** — `createBrowserRouter`, `<RouterProvider>`, καμία παραλλαγή
2. **Διάβασε πρώτα κάθε αρχείο** πριν το αλλάξεις (μην υποθέσεις τι περιέχει)
3. **Modal ως child route** με `<Outlet />`, όχι `backgroundLocation`
4. **Auth guard μόνο σε actions** (ticket booking), όχι σε view (το event URL είναι δημόσιο)
5. **Ενημέρωσε το brief** `docs/ClaudeDocs/concerto-react-router-brief.md` στο τέλος

---

## Bugs που βρέθηκαν στο Merch (πρόσεχε μην τα επαναλάβεις)

1. **Λείπει auth guard σε modal action** → Το προϊόν ήταν δημόσιο αλλά το add-to-cart δεν έλεγχε login
2. **`Date.now()` μέσα σε render** → Lint error `react-hooks/purity`, βγάλε σε module scope
3. **Περιττό `useEffect` για state reset** → Αντικατάστησε με `key={item.id}` στο modal

---

## Τι να παραδώσεις

1. **Αρχεία:**
   - `src/components/Events/EventsRoute.jsx` (νέο)
   - `src/components/Events/EventModalRoute.jsx` (νέο)
   - Αλλαγές σε `src/main.jsx` (προσθήκη routes)
   - Αλλαγές σε `src/components/Header/Header.jsx` (tab sync)
   - Αλλαγές σε `src/components/Events/TicketDialog.jsx` (αν χρειαστεί refactor)

2. **Επαλήθευση:**
   - Lint: `npx eslint src/`
   - Build: `npm run build`
   - Browser test: ανοιγμα `/events`, κλικ σε event, κοινοποίηση link, refresh

3. **Brief update:**
   - Ενημέρωση `docs/ClaudeDocs/concerto-react-router-brief.md` με:
     - Status: Events routing ολοκληρώθηκε
     - Routes που προστέθηκαν
     - Bugs που βρέθηκαν (αν υπάρχουν)
     - Επόμενο: Tenant home page (`/`)

---

## Σημαντικές Σημειώσεις

- Το `react-router-dom@7.18.3` είναι **ήδη** εγκατεστημένο
- Το `public/_redirects` υπάρχει ήδη (Netlify SPA fallback)
- Τοπικό dev: `http://villagers.concerto.gr:5173` (όχι `localhost`)
- Το `tenant_domains` table έχει: `villagers.concerto.gr`, `athensrock.concerto.gr`

**Καλή επιτυχία!**
