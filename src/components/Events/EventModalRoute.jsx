import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import TicketDialog from "./TicketDialog"
import { useEvents } from "../../queries/useEvents"

export default function EventModalRoute() {
  const context = useOutletContext()
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: events, isLoading } = useEvents(context.tenantId)

  // "default" σημαίνει ότι το event είναι η πρώτη σελίδα του ιστορικού, δηλαδή
  // ο χρήστης ήρθε από κοινοποιημένο link. Τότε δεν υπάρχει πίσω μέσα στο site,
  // οπότε αντικαθιστούμε την εγγραφή αντί να γυρίσουμε πίσω.
  const cameFromSharedLink = location.key === "default"

  function handleClose() {
    if (cameFromSharedLink) {
      navigate("..", { replace: true })
      return
    }
    navigate(-1)
  }

  if (isLoading) return null

  const event = events?.find((e) => e.id === eventId)

  // Σπασμένο/παλιό link (π.χ. event που αφαιρέθηκε): γύρνα στη λίστα από πάνω
  if (!event) return <Navigate to=".." replace />

  return (
    <TicketDialog
      key={event.id}
      event={event}
      open={true}
      onOpenChange={(open) => !open && handleClose()}
      isLoggedIn={context.isLoggedIn}
      onRequireAuth={context.onRequireAuth}
    />
  )
}
