import { Outlet, useOutletContext } from "react-router-dom"
import EventsList from "./EventsList"
import { useEvents } from "../../queries/useEvents"

// /events → λίστα events. Το μεμονωμένο event είναι child route, ώστε το
// TicketDialog modal να κάθεται πάνω σε αυτή τη λίστα (ίδιο pattern με το Merch).
export default function EventsRoute() {
  const context = useOutletContext()
  const { data: events, isLoading, error } = useEvents(context.tenantId)

  if (isLoading) return <p className="p-8 text-sm text-gray-500">Φόρτωση events...</p>
  if (error) return <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης events.</p>
  if (!events || events.length === 0) {
    return <p className="p-8 text-sm text-gray-500">Δεν υπάρχουν events αυτή τη στιγμή.</p>
  }

  return (
    <div>
      <EventsList events={events} />
      <Outlet context={context} />
    </div>
  )
}
