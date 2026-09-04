import { TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCart } from "../../queries/useCart"

export default function CartDialog({ open, onOpenChange, fanId }) {
  const { items, removeItem, updateQuantity, subtotal } = useCart(fanId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Το καλάθι σου</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-500">Το καλάθι σου είναι άδειο.</p>
          )}

          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3"
            >
              <img
                src={product.image_urls?.[0]}
                alt={product.name}
                className="size-14 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {Number(product.price).toFixed(2)}€
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, -1)}
                    className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, 1)}
                    className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
              >
                <TrashIcon className="size-5" />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <div className="flex w-full items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-900">Σύνολο</span>
              <span className="text-base font-semibold text-gray-900">
                {subtotal.toFixed(2)}€
              </span>
            </div>
            <Button type="button" className="w-full" disabled title="Έρχεται σύντομα">
              Ολοκλήρωση παραγγελίας
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}