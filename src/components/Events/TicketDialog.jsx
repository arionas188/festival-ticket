import { useState } from "react"
import { TicketIcon } from "@heroicons/react/20/solid"
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

export default function TicketDialog({ event, isLoggedIn, onRequireAuth }) {
  const [open, setOpen] = useState(false)
  const { data: tickets, isLoading } = useTickets(event?.id)

  function handleTriggerClick() {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex w-full min-w-0 flex-1">
        <button
          type="button"
          onClick={handleTriggerClick}
          className="relative -mr-px inline-flex w-full items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
        >
          <TicketIcon aria-hidden="true" className="size-5 text-gray-400" />
          Ticket
        </button>
      </div>

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
                  <Button type="button" size="sm" disabled={soldOut}>
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