import { useEvents } from "../../queries/useEvents"
import EventsList from "./EventsList"

export default function EventsSection({ tenantId }) {
  const { data: events, isLoading, error } = useEvents(tenantId)

  if (isLoading) return <p>Φόρτωση events...</p>
  if (error) return <p>Σφάλμα φόρτωσης events.</p>

  if (!events || events.length === 0) {
    return <p>Δεν υπάρχουν events αυτή τη στιγμή.</p>
  }

  return <EventsList events={events} />
}
