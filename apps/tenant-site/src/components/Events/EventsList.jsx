import { InformationCircleIcon, MapPinIcon, PencilIcon, TicketIcon } from '@heroicons/react/20/solid'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { getMapsUrl } from '../../lib/maps'
import { useEventFavorites, useToggleEventFavorite } from '../../queries/useEventFavorites'
import DeleteEventDialog from './DeleteEventDialog'

// FREE / SOLD OUT (13/9, ρητό αίτημα χρήστη) — υπολογίζονται από τις
// ΠΡΑΓΜΑΤΙΚΕΣ γραμμές tickets του event (event.tickets, βλ. useEvents.js
// embed), όχι από το χοντρικό events.capacity/tickets_sold:
//   - SOLD OUT: υπάρχει τουλάχιστον μία ενεργή κατηγορία εισιτηρίου ΚΑΙ
//     όλες είναι εξαντλημένες (quantity - quantity_sold <= 0).
//   - FREE: υπάρχει τουλάχιστον μία ενεργή κατηγορία ΚΑΙ όλες έχουν
//     τιμή 0 (δηλαδή το event είναι αμιγώς δωρεάν).
// SOLD OUT υπερισχύει του FREE (ένα εξαντλημένο δωρεάν event δείχνει
// SOLD OUT, όχι FREE). Παλιά events χωρίς γραμμές tickets πέφτουν στο
// παλιό, χοντρικό getStatus() παρακάτω.
function getTicketAvailability(event) {
  const activeTickets = (event.tickets || []).filter((t) => t.is_active !== false)
  if (activeTickets.length === 0) return null

  const soldOut = activeTickets.every(
    (t) => Number(t.quantity) - Number(t.quantity_sold || 0) <= 0,
  )
  if (soldOut) return 'sold_out'

  const freeOnly = activeTickets.every((t) => Number(t.price) === 0)
  if (freeOnly) return 'free'

  return null
}

function getStatus(event) {
  const availability = getTicketAvailability(event)
  if (availability === 'sold_out') {
    return { label: 'SOLD OUT', color: 'bg-red-50 text-red-700 inset-ring-red-600/20' }
  }
  if (availability === 'free') {
    return { label: 'FREE', color: 'bg-green-50 text-green-700 inset-ring-green-600/20' }
  }

  // Fallback: παλιό, χοντρικό μοντέλο (events.capacity/tickets_sold) —
  // events χωρίς γραμμές tickets (πολύ παλιά, πριν το wizard).
  if (!event.capacity || event.capacity === 0) {
    return { label: 'Διαθέσιμα', color: 'bg-green-50 text-green-700 inset-ring-green-600/20' }
  }
  const percent = (event.tickets_sold || 0) / event.capacity

  if (percent >= 1) {
    return { label: 'Sold Out', color: 'bg-red-50 text-red-700 inset-ring-red-600/20' }
  }
  if (percent >= 0.8) {
    return { label: 'Τελευταία εισιτήρια', color: 'bg-orange-50 text-orange-700 inset-ring-orange-600/20' }
  }
  if (percent >= 0.5) {
    return { label: 'Λιγοστά', color: 'bg-yellow-50 text-yellow-700 inset-ring-yellow-600/20' }
  }
  return { label: 'Διαθέσιμα', color: 'bg-green-50 text-green-700 inset-ring-green-600/20' }
}

function formatDateBadge(dateString) {
  const d = new Date(dateString)
  return d.toLocaleDateString('el-GR', { day: 'numeric', month: 'numeric' })
}

// Το Ticket button είναι πραγματικό <Link> σε child route (event/:eventId) αντί
// να ανοίγει τοπικό dialog state, ώστε το event modal να έχει δικό του μοιράσιμο
// URL (ίδιο pattern με το ProductQuickShop στο Merch) — και right-click/"open in
// new tab" να δουλεύει, όπως και στο CategoryGrid/ProductList.
// Ίδιο μοτίβο favorite-toggle με το ProductList.jsx (Merch) — καρδούλα πάνω
// στην εικόνα, solid/outline ανάλογα με την κατάσταση, onRequireAuth αν δεν
// είσαι συνδεδεμένος. Βλ. useEventFavorites.js/event_favorites migration.
//
// SOLD OUT / FREE (13/9): σε αυτές τις δύο περιπτώσεις το κουμπί "Ticket"
// ΔΕΝ είναι πια πλοηγήσιμο link — γίνεται ανενεργό <span> με το ίδιο
// εικονίδιο εισιτηρίου + μια έγχρωμη ετικέτα (κόκκινη/πράσινη, ίδιο στυλ
// με το status pill πάνω) αντί για το κείμενο "Ticket". Ρητό αίτημα
// χρήστη — δεν έχει νόημα να ανοίγει τον διάλογο αγοράς όταν δεν υπάρχει
// τίποτα προς αγορά.
//
// Admin controls: ΜΟΝΟ για πραγματικούς tenant admins — μολύβι επεξεργασίας
// (13/9, πήγαινε σε πραγματική σελίδα edit αντί για modal, βλ. σχόλιο στο
// EventFormPage.jsx) + κόκκινος κάδος διαγραφής (DeleteEventDialog, ΔΕΝ
// άλλαξε — μικρό confirm modal, ποτέ δεν είχε πρόβλημα). Κάθονται
// πάνω-αριστερά στην εικόνα (η καρδούλα favorite είναι πάνω-δεξιά), ή σε
// ξεχωριστή γραμμή πάνω από τον τίτλο όταν το event δεν έχει εικόνα.
export default function EventsList({ events, fanId, isLoggedIn, onRequireAuth, isAdmin, tenantId }) {
  const { data: favoriteEventIds = [] } = useEventFavorites(fanId)
  const toggleEventFavorite = useToggleEventFavorite(fanId)

  function handleToggleFavorite(e, event) {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    const isFavorited = favoriteEventIds.includes(event.id)
    toggleEventFavorite.mutate({ eventId: event.id, isFavorited, event })
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const status = getStatus(event)
        const isFavorited = favoriteEventIds.includes(event.id)
        const availability = getTicketAvailability(event)

        return (
          <li
            key={event.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-md overflow-hidden"
          >
            {event.image_url && (
              <div className="relative">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-40 w-full object-cover"
                />
                {isAdmin && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <Link
                      to={`event/${event.slug}/edit`}
                      title="Επεξεργασία event"
                      aria-label="Επεξεργασία event"
                      className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                    </Link>
                    <DeleteEventDialog event={event} tenantId={tenantId} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, event)}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
                >
                  {isFavorited ? (
                    <HeartIconSolid className="size-5 text-red-500" />
                  ) : (
                    <HeartIcon className="size-5 text-gray-700" />
                  )}
                </button>
              </div>
            )}

            <div className="flex w-full items-start justify-between space-x-4 p-6">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-900 text-white">
                <span className="text-lg leading-none font-bold">
                  {formatDateBadge(event.date)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-x-2">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium inset-ring ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {event.description}
                  </p>
                )}
                {isAdmin && !event.image_url && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Link
                      to={`event/${event.slug}/edit`}
                      title="Επεξεργασία event"
                      aria-label="Επεξεργασία event"
                      className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                    </Link>
                    <DeleteEventDialog event={event} tenantId={tenantId} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex min-w-0 flex-1">
                  {availability === 'sold_out' || availability === 'free' ? (
                    <span
                      className="relative -mr-px inline-flex w-full cursor-not-allowed items-center justify-center gap-x-2 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-400"
                      aria-disabled="true"
                    >
                      <TicketIcon aria-hidden="true" className="size-5 text-gray-300" />
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium inset-ring ${
                          availability === 'sold_out'
                            ? 'bg-red-50 text-red-700 inset-ring-red-600/20'
                            : 'bg-green-50 text-green-700 inset-ring-green-600/20'
                        }`}
                      >
                        {availability === 'sold_out' ? 'SOLD OUT' : 'FREE'}
                      </span>
                    </span>
                  ) : (
                    <Link
                      to={`event/${event.slug}`}
                      className="relative -mr-px inline-flex w-full items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <TicketIcon aria-hidden="true" className="size-5 text-gray-400" />
                      Ticket
                    </Link>
                  )}
                </div>
                <div className="-ml-px flex min-w-0 flex-1">
                  <a
                    href={getMapsUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex w-full items-center justify-center gap-x-3 border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <MapPinIcon aria-hidden="true" className="size-5 text-gray-400" />
                    Location
                  </a>
                </div>
                <div className="-ml-px flex min-w-0 flex-1">
                  <Link
                    to={`event/${event.slug}/info`}
                    className="relative inline-flex w-full items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <InformationCircleIcon aria-hidden="true" className="size-5 text-gray-400" />
                    Info
                  </Link>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
