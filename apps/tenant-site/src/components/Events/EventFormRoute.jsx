import { Navigate, useOutletContext, useParams } from "react-router-dom"
import EventFormPage from "./EventFormPage"
import { useEvents } from "../../queries/useEvents"
import { isUuid } from "../../lib/isUuid"
import { Skeleton } from "@/components/ui/skeleton"

// Routing wrapper γύρω από το EventFormPage.jsx (13/9 — αντικατέστησε το
// παλιό AddEventWizard modal με πραγματική σελίδα, βλ. σχόλιο εκεί).
// Δύο routes καταλήγουν εδώ (main.jsx): 'events/event/new' (χωρίς
// :eventId — δημιουργία) και 'events/event/:eventId/edit' (επεξεργασία).
//
// Ίδιο μοτίβο με το EventModalRoute.jsx: βρίσκει το event μέσα στα ήδη
// cached δεδομένα του useEvents() αντί για ξεχωριστό fetch-by-id — δέχεται
// slug (νέα links) ή UUID (παλιά), fallback σε Navigate αν δεν βρεθεί.
//
// Admin guard εδώ (όχι μόνο κρυμμένο κουμπί στο UI): κάποιος που πληκτρολογεί
// απευθείας το URL χωρίς να είναι πραγματικός admin αυτού του tenant
// στέλνεται πίσω στη λίστα — η πραγματική ασφάλεια είναι πάντα το RLS στη
// βάση (βλ. migration για events/tickets write policies), αυτό είναι απλά
// σωστό UX, όχι ο μηχανισμός ασφαλείας.
export default function EventFormRoute() {
  const context = useOutletContext()
  const { eventId } = useParams()
  const { data: events, isLoading } = useEvents(context.tenantId)

  if (!context.isAdmin) return <Navigate to="/events" replace />

  // 'events/event/new' — δεν έχει :eventId, δημιουργία, δεν χρειάζεται να
  // περιμένει το useEvents() να φορτώσει.
  if (!eventId) {
    return <EventFormPage tenantId={context.tenantId} event={null} coverImageUrl={context.coverImageUrl} />
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl bg-gray-50 p-4 pb-24 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const event = events?.find((e) => (isUuid(eventId) ? e.id === eventId : e.slug === eventId))
  if (!event) return <Navigate to="/events" replace />

  return <EventFormPage tenantId={context.tenantId} event={event} coverImageUrl={context.coverImageUrl} />
}
