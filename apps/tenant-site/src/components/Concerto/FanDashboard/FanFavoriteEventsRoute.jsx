import { useOutletContext } from "react-router-dom"
import { useFanFavoriteEvents } from "../../../queries/useFanFavoriteEvents"
import { crossTenantHref } from "../../../lib/tenantLink"
import FanListSkeleton from "./FanListSkeleton"

function formatEventDate(dateString) {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function FanFavoriteEventsRoute() {
  const { fanId } = useOutletContext()
  const { data: items = [], isLoading } = useFanFavoriteEvents(fanId)

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Αγαπημένα events</h1>

      {isLoading ? (
        <FanListSkeleton />
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Δεν έχεις αγαπημένα events ακόμα.</p>
      ) : (
        <ul role="list" className="mt-6 divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.eventId} className="flex items-center gap-4 py-4">
              {item.imageUrl && (
                <img
                  alt=""
                  src={item.imageUrl}
                  className="size-14 shrink-0 rounded-md object-cover ring-1 ring-gray-200"
                />
              )}
              <div className="min-w-0 flex-1">
                {item.domain ? (
                  // Πλήρες, cross-origin href — ίδιο σκεπτικό με
                  // FanFavoriteMerchRoute.jsx.
                  <a
                    href={crossTenantHref(item.domain, `/events/event/${item.eventId}`)}
                    className="truncate text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {item.title}
                  </span>
                )}
                <p className="text-xs text-gray-500">
                  {item.tenantName} · {formatEventDate(item.date)}
                </p>
                {item.changed && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 inset-ring inset-ring-red-600/20">
                    Άλλαξε κάτι — έλεγξέ το
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
