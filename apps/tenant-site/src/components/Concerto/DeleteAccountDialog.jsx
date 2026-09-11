import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useDeleteAccount } from "../../queries/useDeleteAccount"

// Μη αναστρέψιμη ενέργεια — δεν διαγράφει με ένα click από το dropdown, μόνο
// αφού ο fan επιβεβαιώσει εδώ. "Για αρχή" εδώ μέσα στο account dropdown
// (7/9) — σημειωμένο ρητά να μετακινηθεί αλλού σε άλλο session.
export default function DeleteAccountDialog({ open, onOpenChange }) {
  const [error, setError] = useState(null)
  const deleteAccount = useDeleteAccount()

  async function handleConfirm() {
    setError(null)
    try {
      await deleteAccount.mutateAsync()
      onOpenChange(false)
    } catch {
      setError("Κάτι πήγε στραβά, δοκίμασε ξανά.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Διαγραφή λογαριασμού</DialogTitle>
          <DialogDescription>
            Θα διαγραφούν οριστικά ο λογαριασμός σου, τα αγαπημένα, το καλάθι
            και οι σελίδες που ακολουθείς. Αυτή η ενέργεια δεν αναιρείται.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Άκυρο
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteAccount.isPending}
          >
            {deleteAccount.isPending ? "Διαγραφή..." : "Ναι, διάγραψε τον λογαριασμό μου"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
