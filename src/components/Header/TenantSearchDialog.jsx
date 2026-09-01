import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useEvents } from "../../queries/useEvents"
import { useProducts } from "../../queries/useProducts"

export default function TenantSearchDialog({ open, onOpenChange, tenantId }) {
  const [query, setQuery] = useState("")
  const { data: events } = useEvents(tenantId)
  const { data: products } = useProducts(tenantId)

  const matchedEvents = useMemo(() => {
    if (!query.trim() || !events) return []
    return events.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
  }, [events, query])

  const matchedProducts = useMemo(() => {
    if (!query.trim() || !products) return []
    return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  }, [products, query])

  const resultsCount = query.trim()
    ? matchedEvents.length + matchedProducts.length
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-10 max-h-[80vh] translate-y-0 overflow-y-auto sm:max-w-lg">
        <div className="mt-6">
          <InputGroup>
            <InputGroupInput
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση σε events, merch..."
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

          {!query.trim() && (
            <p className="mt-4 text-sm text-gray-500">Γράψε κάτι για να αναζητήσεις.</p>
          )}

          {query.trim() && resultsCount === 0 && (
            <p className="mt-4 text-sm text-gray-500">Δεν βρέθηκαν αποτελέσματα.</p>
          )}

          {matchedEvents.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase">Εκδηλώσεις</h3>
              <div className="space-y-2">
                {matchedEvents.map((event) => (
                  <div key={event.id} className="rounded-md border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500">{event.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedProducts.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase">Merch</h3>
              <div className="space-y-2">
                {matchedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                  >
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {Number(product.price).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}