import { Search } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export default function TenantSearchDialog({ open, onOpenChange, resultsCount }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-10 max-h-[80vh] translate-y-0 overflow-y-auto sm:max-w-lg">
        <div className="mt-6">
          <InputGroup>
            <InputGroupInput
              type="text"
              autoFocus
              placeholder="Αναζήτηση σε events, tickets, merch..."
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            {resultsCount !== undefined && (
              <InputGroupAddon align="inline-end">
                {resultsCount} αποτελέσματα
              </InputGroupAddon>
            )}
          </InputGroup>

          <div className="mt-4 text-sm text-gray-500">
            Γράψε κάτι για να αναζητήσεις.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}