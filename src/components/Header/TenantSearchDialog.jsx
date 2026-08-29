import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function TenantSearchDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-10 max-h-[80vh] translate-y-0 overflow-y-auto sm:max-w-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            autoFocus
            placeholder="Αναζήτηση σε events, tickets, merch..."
            className="pl-9"
          />
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {/* TODO: πραγματικά αποτελέσματα αναζήτησης (events + products) όταν συνδέσουμε τα hooks */}
          Γράψε κάτι για να αναζητήσεις.
        </div>
      </DialogContent>
    </Dialog>
  )
}