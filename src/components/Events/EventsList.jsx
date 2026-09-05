import { MapPinIcon, TicketIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import EventInfoDialog from './EventInfoDialog'
import { getMapsUrl } from '../../lib/maps'

function getStatus(event) {
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
export default function EventsList({ events }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const status = getStatus(event)

        return (
          <li
            key={event.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
          >
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="h-40 w-full object-cover"
              />
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
              </div>
            </div>

            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex min-w-0 flex-1">
                  <Link
                    to={`event/${event.id}`}
                    className="relative -mr-px inline-flex w-full items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <TicketIcon aria-hidden="true" className="size-5 text-gray-400" />
                    Ticket
                  </Link>
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
                  <EventInfoDialog event={event} />
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
