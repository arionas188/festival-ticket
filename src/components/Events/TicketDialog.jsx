import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTickets } from "../../queries/useTickets"

function getAvailabilityStatus(ticket) {
  const remaining = ticket.quantity - (ticket.quantity_sold || 0)
  const percent = (ticket.quantity_sold || 0) / ticket.quantity

  if (remaining <= 0) {
    return { label: "Sold Out", color: "text-red-600", remaining: 0 }
  }
  if (percent >= 0.8) {
    return { label: `${remaining} διαθέσιμα`, color: "text-orange-600", remaining }
  }
  if (percent >= 0.5) {
    return { label: `${remaining} διαθέσιμα`, color: "text-yellow-600", remaining }
  }
  return { label: `${remaining} διαθέσιμα`, color: "text-green-600", remaining }
}

// Controlled dialog (open/onOpenChange), όπως το ProductQuickShop στο Merch: το
// άνοιγμα είναι δημόσιο URL route (/events/event/:eventId), το auth guard
// μπαίνει μόνο στην ενέργεια κράτησης, όχι στο view.
export default function TicketDialog({ event, open, onOpenChange, isLoggedIn, onRequireAuth }) {
  const { data: tickets, isLoading } = useTickets(event?.id)

  if (!event) return null

  function handleSelectTicket() {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    // TODO: κράτηση εισιτηρίου — μελλοντικό task (Checkout/reservation flow)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{event?.title}</DialogTitle>
          <DialogDescription>Επίλεξε τύπο εισιτηρίου</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Φόρτωση...</p>
          )}

          {!isLoading && (!tickets || tickets.length === 0) && (
            <p className="text-sm text-muted-foreground">
              Δεν υπάρχουν διαθέσιμα εισιτήρια αυτή τη στιγμή.
            </p>
          )}

          {!isLoading &&
            tickets?.map((ticket) => {
              const status = getAvailabilityStatus(ticket)
              const soldOut = status.remaining === 0

              return (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Number(ticket.price).toFixed(2)}€
                    </p>
                    <p className={`text-xs font-medium ${status.color}`}>
                      {status.label}
                    </p>
                  </div>
                  <Button type="button" size="sm" disabled={soldOut} onClick={handleSelectTicket}>
                    {soldOut ? "Sold Out" : "Επιλογή"}
                  </Button>
                </div>
              )
            })}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Κλείσιμο</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
