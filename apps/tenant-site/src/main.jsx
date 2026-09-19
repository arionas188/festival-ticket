import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import { recoverFromBrokenSession } from './lib/authRecovery.js'
import App from './App.jsx'
import TenantLayout from './components/Header/TenantLayout.jsx'
import MerchCategoriesRoute from './components/Merch/MerchCategoriesRoute.jsx'
import MerchCategoryRoute from './components/Merch/MerchCategoryRoute.jsx'
import ProductModalRoute from './components/Merch/ProductModalRoute.jsx'
import OrderSummaryRoute from './components/Merch/OrderSummaryRoute.jsx'
import CartRoute from './components/Merch/CartRoute.jsx'
import ProductOverviewRoute from './components/Merch/ProductOverviewRoute.jsx'
import EventsRoute from './components/Events/EventsRoute.jsx'
import EventFormRoute from './components/Events/EventFormRoute.jsx'
import EventModalRoute from './components/Events/EventModalRoute.jsx'
import EventInfoRoute from './components/Events/EventInfoRoute.jsx'
import InfoRoute from './components/About/InfoRoute.jsx'
import FanDashboardLayout from './components/Concerto/FanDashboard/FanDashboardLayout.jsx'
import FanProfileRoute from './components/Concerto/FanDashboard/FanProfileRoute.jsx'
import FanTenantsRoute from './components/Concerto/FanDashboard/FanTenantsRoute.jsx'
import FanFavoriteMerchRoute from './components/Concerto/FanDashboard/FanFavoriteMerchRoute.jsx'
import FanFavoriteEventsRoute from './components/Concerto/FanDashboard/FanFavoriteEventsRoute.jsx'
import FanOrdersRoute from './components/Concerto/FanDashboard/FanOrdersRoute.jsx'
import FanCurrentCartRoute from './components/Concerto/FanDashboard/FanCurrentCartRoute.jsx'
import ErrorPage from './components/ErrorPage/ErrorPage.jsx'

// 19/9, ρητή αναφορά χρήστη (401 στο console σε cart_items) — το "σπασμένο
// session" recovery (18/9 diagnosis, βλ. lib/authRecovery.js) εφαρμόζεται
// εδώ ΚΕΝΤΡΙΚΑ, σε ΚΑΘΕ query/mutation της εφαρμογής, αντί να χρειάζεται
// να το θυμάται/ξαναγράφει ο καθένας ξεχωριστά (πριν ζούσε μόνο μέσα στο
// useFanSession.js, γι' αυτό δεν "έπιασε" το ίδιο πρόβλημα στο cart_items).
// recoverFromBrokenSession κάνει local sign-out ΜΟΝΟ αν όντως αναγνωρίσει
// έναν από τους γνωστούς κωδικούς "άκυρο/ληγμένο session" — οτιδήποτε
// άλλο (π.χ. κανονικό δικτυακό σφάλμα) περνάει ανέγγιχτο, ο καθένας
// caller συνεχίζει να βλέπει το δικό του error state κανονικά.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => recoverFromBrokenSession(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => recoverFromBrokenSession(error),
  }),
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // Πιάνει άγνωστα paths (404) και οποιοδήποτε uncaught error στα child
    // routes· επίσημο React Router pattern, ένα errorElement στη ρίζα αρκεί.
    errorElement: <ErrorPage />,
    children: [
      // '/' → redirect στο '/about': πραγματικό, ονομασμένο path (όπως
      // /merch, /events) αντί για ανώνυμο index route, ώστε να έχει δικό του
      // ορατό/μοιράσιμο URL. Το γυμνό domain συνεχίζει να δουλεύει όπως πριν
      // (redirect, όχι 404) — δεν αλλάζει τίποτα για τον επισκέπτη.
      { index: true, element: <Navigate to="/about" replace /> },
      // Tenant-branded σελίδες (cover/logo/tabs) — όλες μέσα από
      // TenantLayout.jsx (πρώην απευθείας μέσα στο App.jsx, βλ. εκεί).
      {
        element: <TenantLayout />,
        children: [
          { path: 'about', element: <InfoRoute /> },
          // /merch → πλέγμα κατηγοριών. Το προϊόν είναι child route, οπότε το modal
          // κάθεται πάνω στο πλέγμα χωρίς κόλπα με location state.
          {
            path: 'merch',
            element: <MerchCategoriesRoute />,
            children: [{ path: 'product/:productId', element: <ProductModalRoute /> }],
          },
          // /merch/category/:categoryKey → λίστα προϊόντων. Ίδια λογική: το modal
          // του προϊόντος ανοίγει πάνω στη συγκεκριμένη λίστα και τη διατηρεί σε refresh.
          {
            path: 'merch/category/:categoryKey',
            element: <MerchCategoryRoute />,
            children: [{ path: 'product/:productId', element: <ProductModalRoute /> }],
          },
          // merch/order/:orderId (14/9, ρητό αίτημα χρήστη — checkout flow):
          // ΕΠΙΠΕΔΟ (flat) sibling, ΟΧΙ nested μέσα στο merch/merch-category —
          // ίδιο μοτίβο με το events/event/new παρακάτω, αντικαθιστά εντελώς
          // τη λίστα αντί να κάθεται πάνω της (πραγματική "σελίδα
          // παραγγελίας", όχι modal).
          { path: 'merch/order/:orderId', element: <OrderSummaryRoute /> },
          // merch/cart (15/9, ρητό αίτημα χρήστη, reference component δικό
          // του — "άλλο component που θα έχει τη συνολική παραγγελία"):
          // ΕΠΙΠΕΔΟ (flat) sibling, ίδιο μοτίβο. Το "Ολοκλήρωση παραγγελίας"
          // κουμπί στο ProductOverviewRoute.jsx προσθέτει την επιλογή στο
          // καλάθι και φέρνει εδώ (ΟΧΙ κατευθείαν σε νέα order) — βλ.
          // CartRoute.jsx.
          { path: 'merch/cart', element: <CartRoute /> },
          // merch/overview/:productId (14/9, ρητό αίτημα χρήστη — "product
          // overview για να μπορεί να το κάνει share το link"): ΕΠΙΠΕΔΟ (flat)
          // sibling, ίδιο μοτίβο με merch/order/:orderId — πραγματική σελίδα
          // προϊόντος, ξεχωριστή από το merch/product/:productId modal
          // ("Γρήγορη αγορά", ΠΑΡΑΜΕΝΕΙ όπως είναι, δεν αγγίχτηκε).
          { path: 'merch/overview/:productId', element: <ProductOverviewRoute /> },
          // /events → λίστα events. Το event είναι child route, οπότε το TicketDialog
          // modal κάθεται πάνω στη λίστα χωρίς κόλπα με location state.
          {
            path: 'events',
            element: <EventsRoute />,
            children: [
              { path: 'event/:eventId', element: <EventModalRoute /> },
              // Sibling route, όχι nested μέσα στο ticket route: το Info modal
              // ανοίγει απευθείας πάνω στη λίστα, χωρίς να περνάει από το Ticket.
              { path: 'event/:eventId/info', element: <EventInfoRoute /> },
            ],
          },
          // events/event/new + events/event/:eventId/edit (13/9, ρητό αίτημα
          // χρήστη — πραγματική σελίδα αντί για modal, βλ. EventFormPage.jsx):
          // ΕΠΙΠΕΔΑ (flat) siblings του 'events' παραπάνω, ΟΧΙ nested μέσα του —
          // έτσι αντικαθιστούν εντελώς τη λίστα events αντί να κάθονται πάνω
          // της, ακριβώς όπως θα έκανε μια πραγματική σελίδα. Παίρνουν το ίδιο
          // Outlet context (tenantId/isAdmin κ.λπ.) από το Header.jsx, αφού
          // είναι επίσης παιδιά του TenantLayout.
          { path: 'events/event/new', element: <EventFormRoute /> },
          { path: 'events/event/:eventId/edit', element: <EventFormRoute /> },
        ],
      },
      // Fan Dashboard — global, όχι tenant-branded (βλ. FanDashboardLayout.jsx
      // για το γιατί είναι sibling εδώ, όχι μέσα στο TenantLayout).
      {
        path: 'account',
        element: <FanDashboardLayout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: <FanProfileRoute /> },
          { path: 'tenants', element: <FanTenantsRoute /> },
          { path: 'merch', element: <FanFavoriteMerchRoute /> },
          { path: 'events', element: <FanFavoriteEventsRoute /> },
          { path: 'orders', element: <FanOrdersRoute /> },
          { path: 'cart', element: <FanCurrentCartRoute /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
