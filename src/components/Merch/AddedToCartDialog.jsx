import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  
  export default function AddedToCartDialog({ product, onClose }) {
    return (
      <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Προστέθηκε στο καλάθι</DialogTitle>
            <DialogDescription>
              {product?.name} προστέθηκε στο καλάθι σου.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Συνέχισε τις αγορές
            </Button>
            <Button
              type="button"
              onClick={() => {
                onClose()
                // TODO: navigation στο cart, όταν φτιάξουμε το ShoppingCart component
              }}
            >
              Μετάβαση στο καλάθι
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }