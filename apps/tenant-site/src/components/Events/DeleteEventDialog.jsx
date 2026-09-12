import { useState } from "react"
import { TrashIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteEvent } from "../../queries/useDeleteEvent"
import { toast } from "sonner"

// Διαγραφή event από τον tenant admin (13/9, ρητό αίτημα χρήστη —
// "εμφανές κάδο με κόκκινο χρώμα", πραγματική διαγραφή από τη βάση, με
// επιβεβαίωση πριν γίνει κάτι μη αναστρέψιμο). Ορατό ΜΟΝΟ σε πραγματικούς
// admins αυτού του tenant — βλ. EventsList.jsx.
export default function DeleteEventDialog({ event, tenantId }) {
  const [open, setOpen] = useState(false)
  const deleteEvent = useDeleteEvent()

  function handleDelete() {
    deleteEvent.mutate(
      { eventId: event.id, tenantId },
      {
        onSuccess: () => {
          setOpen(false)
          toast.success("Το event διαγράφηκε.")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Διαγραφή event"
        aria-label="Διαγραφή event"
        className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-colors hover:bg-red-700"
      >
        <TrashIcon aria-hidden="true" className="size-4" />
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Διαγραφή event</DialogTitle>
          <DialogDescription>
            Θα διαγραφεί οριστικά το «{event.title}» μαζί με όλες τις κατηγορίες
            εισιτηρίων του. Δεν μπορεί να αναιρεθεί.
          </DialogDescription>
        </DialogHeader>

        {deleteEvent.isError && (
          <p className="text-sm text-destructive">{deleteEvent.error.message}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleteEvent.isPending}>
            Άκυρο
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
          >
            {deleteEvent.isPending ? "Διαγραφή..." : "Ναι, διαγραφή"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
