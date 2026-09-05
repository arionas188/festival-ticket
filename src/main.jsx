import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MerchCategoriesRoute from './components/Merch/MerchCategoriesRoute.jsx'
import MerchCategoryRoute from './components/Merch/MerchCategoryRoute.jsx'
import ProductModalRoute from './components/Merch/ProductModalRoute.jsx'
import EventsRoute from './components/Events/EventsRoute.jsx'
import EventModalRoute from './components/Events/EventModalRoute.jsx'
import InfoRoute from './components/BandInfo/InfoRoute.jsx'
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
      // '/' index → Πληροφορίες tab (bio + BandInfo). Route πλέον, όχι state,
      // ίδια αρχιτεκτονική λογική με Merch/Events.
      { index: true, element: <InfoRoute /> },
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
        children: [{ path: 'event/:eventId', element: <EventModalRoute /> }],
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
