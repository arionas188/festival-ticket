import { Link, Outlet, useOutletContext } from "react-router-dom"
import { PlusIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import EventsList from "./EventsList"
import CardGridSkeleton from "@/components/ui/card-grid-skeleton"
import { useEvents } from "../../queries/useEvents"

// /events → λίστα events. Το μεμονωμένο event είναι child route, ώστε το
// TicketDialog modal να κάθεται πάνω σε αυτή τη λίστα (ίδιο pattern με το Merch).
//
// Το "Προσθήκη event" εμφανίζεται ΠΑΝΤΑ όταν ο συνδεδεμένος χρήστης είναι
// πραγματικός admin αυτού του tenant (context.isAdmin) — ΚΑΙ στην κενή
// λίστα (νέος tenant χωρίς κανένα event ακόμα), γι' αυτό ζει έξω από τα
// early-return loading/error/empty states, όχι μέσα στο EventsList.
// Πηγαίνει πλέον σε πραγματική σελίδα (events/event/new, βλ. main.jsx +
// EventFormPage.jsx) αντί να ανοίγει modal — 13/9, ρητό αίτημα χρήστη.
export default function EventsRoute() {
  const context = useOutletContext()
  const { data: events, isLoading, error } = useEvents(context.tenantId)

  return (
    // Απαλό γκρι, στρογγυλεμένο "πλαίσιο" γύρω από όλη τη λίστα events (14/9,
    // ρητό αίτημα χρήστη, ίδιο ύφος με το bg-gray-50 του Merch) — έτσι το
    // shadow-md στις κάρτες event παρακάτω φαίνεται πραγματικά ως βάθος
    // αντί να χάνεται πάνω σε λευκό φόντο.
    <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
      {context.isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button asChild className="rounded-full">
            <Link to="event/new">
              <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
              Προσθήκη event
            </Link>
          </Button>
        </div>
      )}

      {isLoading && <CardGridSkeleton count={6} />}
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
