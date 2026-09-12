import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import EventInfoDialog from "./EventInfoDialog"
import LoadingDialog from "@/components/ui/loading-dialog"
import { useEvents } from "../../queries/useEvents"
import { isUuid } from "../../lib/isUuid"

// Ίδιο pattern με το EventModalRoute (Ticket). Το ".." εδώ πάει σωστά στο
// /events παρόλο που το path string ("event/:eventId/info") έχει ένα
// επιπλέον "/" — το React Router μετράει βάθος route-tree (και τα δύο,
// EventModalRoute + EventInfoRoute, είναι sibling children του "events"
// route), όχι slashes στο URL string. (Bug που είχε μπει με "../..": πήγαινε
// στη ρίζα "/" αντί για "/events" — διορθώθηκε.)
export default function EventInfoRoute() {
  const context = useOutletContext()
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: events, isLoading } = useEvents(context.tenantId)

  const cameFromSharedLink = location.key === "default"

  function handleClose() {
    if (cameFromSharedLink) {
      navigate("..", { replace: true })
      return
    }
    navigate(-1)
  }

  if (isLoading) return <LoadingDialog onOpenChange={(open) => !open && handleClose()} />

  // Δέχεται είτε UUID (παλιά, ήδη κοινοποιημένα links) είτε slug (νέα links).
  const event = events?.find((e) =>
    isUuid(eventId) ? e.id === eventId : e.slug === eventId
  )

  // Σπασμένο/παλιό link: γύρνα στη λίστα events.
  if (!event) return <Navigate to=".." replace />

  return (
    <EventInfoDialog
      key={event.id}
      event={event}
      open={true}
      onOpenChange={(open) => !open && handleClose()}
    />
  )
}
