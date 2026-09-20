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
import { useDeleteProduct } from "../../queries/useDeleteProduct"
import { toast } from "sonner"

// Διαγραφή προϊόντος από τον tenant admin (20/9, ρητό αίτημα χρήστη —
// ίδιο μοτίβο με DeleteEventDialog.jsx: εμφανές κόκκινος κάδος,
// πραγματική διαγραφή από τη βάση, με επιβεβαίωση πριν γίνει κάτι μη
// αναστρέψιμο). Ορατό ΜΟΝΟ σε πραγματικούς admins αυτού του tenant — βλ.
// ProductList.jsx/ProductOverviewRoute.jsx.
//
// Foreign key violation (23503, βλ. useDeleteProduct.js — το προϊόν έχει
// ήδη order_items, ιστορικό παραγγελιών που ΔΕΝ διαγράφουμε ποτέ σιωπηλά):
// φιλικό μήνυμα αντί για το ωμό Postgres error.
function friendlyErrorMessage(error) {
  if (error?.code === "23503") {
    return "Δεν μπορεί να διαγραφεί — υπάρχουν ήδη παραγγελίες με αυτό το προϊόν."
  }
  return error?.message || "Κάτι πήγε στραβά."
}

export default function DeleteProductDialog({ product, tenantId }) {
  const [open, setOpen] = useState(false)
  const deleteProduct = useDeleteProduct()

  function handleDelete() {
    deleteProduct.mutate(
      { productId: product.id, tenantId },
      {
        onSuccess: () => {
          setOpen(false)
          toast.success("Το προϊόν διαγράφηκε.")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        title="Διαγραφή προϊόντος"
        aria-label="Διαγραφή προϊόντος"
        className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-colors hover:bg-red-700"
      >
        <TrashIcon aria-hidden="true" className="size-4" />
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Διαγραφή προϊόντος</DialogTitle>
          <DialogDescription>
            Θα διαγραφεί οριστικά το «{product.name}» μαζί με όλα τα μεγέθη/απόθεμά
            του. Δεν μπορεί να αναιρεθεί.
          </DialogDescription>
        </DialogHeader>

        {deleteProduct.isError && (
          <p className="text-sm text-destructive">{friendlyErrorMessage(deleteProduct.error)}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleteProduct.isPending}>
            Άκυρο
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
          >
            {deleteProduct.isPending ? "Διαγραφή..." : "Ναι, διαγραφή"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
