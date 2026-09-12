import { Outlet, useOutletContext } from "react-router-dom"
import EventsList from "./EventsList"
import AddEventWizard from "./AddEventWizard"
import { useEvents } from "../../queries/useEvents"

// /events → λίστα events. Το μεμονωμένο event είναι child route, ώστε το
// TicketDialog modal να κάθεται πάνω σε αυτή τη λίστα (ίδιο pattern με το Merch).
//
// Το "Προσθήκη event" (13/9, βλ. AddEventWizard.jsx) εμφανίζεται ΠΑΝΤΑ όταν
// ο συνδεδεμένος χρήστης είναι πραγματικός admin αυτού του tenant
// (context.isAdmin) — ΚΑΙ στην κενή λίστα (νέος tenant χωρίς κανένα event
// ακόμα), γι' αυτό ζει έξω από τα early-return loading/error/empty states,
// όχι μέσα στο EventsList.
export default function EventsRoute() {
  const context = useOutletContext()
  const { data: events, isLoading, error } = useEvents(context.tenantId)

  return (
    <div>
      {context.isAdmin && (
        <div className="mb-4 flex justify-end">
          <AddEventWizard tenantId={context.tenantId} />
        </div>
      )}

      {isLoading && <p className="p-8 text-sm text-gray-500">Φόρτωση events...</p>}
      {error && <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης events.</p>}
      {!isLoading && !error && (!events || events.length === 0) && (
        <p className="p-8 text-sm text-gray-500">Δεν υπάρχουν events αυτή τη στιγμή.</p>
      )}
      {!isLoading && !error && events && events.length > 0 && (
        <EventsList
          events={events}
          fanId={context.fanId}
          isLoggedIn={context.isLoggedIn}
          onRequireAuth={context.onRequireAuth}
          isAdmin={context.isAdmin}
          tenantId={context.tenantId}
        />
      )}

      <Outlet context={context} />
    </div>
  )
}
