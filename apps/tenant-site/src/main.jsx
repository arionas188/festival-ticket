import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TenantLayout from './components/Header/TenantLayout.jsx'
import MerchCategoriesRoute from './components/Merch/MerchCategoriesRoute.jsx'
import MerchCategoryRoute from './components/Merch/MerchCategoryRoute.jsx'
import ProductModalRoute from './components/Merch/ProductModalRoute.jsx'
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

const queryClient = new QueryClient()

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
