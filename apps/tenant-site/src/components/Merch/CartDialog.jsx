import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { useCreateOrder } from "../../queries/useCreateOrder"

// Μεταφράζει τα exception messages του create_order_from_cart RPC (βλ.
// migration 20260914150000_add_orders_checkout.sql) σε κάτι κατανοητό για
// τον fan — το πιο συχνό, αναμενόμενο σενάριο είναι insufficient_stock
// (κάποιος άλλος αγόρασε το τελευταίο ίδιο τη στιγμή του checkout).
function checkoutErrorMessage(error) {
  const raw = error?.message || ""
  if (raw.includes("insufficient_stock")) {
    const productName = raw.split(":").slice(1).join(":").trim()
    return productName
      ? `Δυστυχώς το "${productName}" μόλις εξαντλήθηκε — αφαίρεσέ το ή μείωσε την ποσότητα.`
      : "Κάποιο προϊόν στο καλάθι σου μόλις εξαντλήθηκε."
  }
  if (raw.includes("empty_cart")) {
    return "Το καλάθι σου είναι άδειο."
  }
  return "Κάτι πήγε στραβά με την ολοκλήρωση της παραγγελίας. Δοκίμασε ξανά."
}

export default function CartDialog({ open, onOpenChange, fanId, tenantId }) {
  const { items, removeItem, updateQuantity, subtotal } = useCart(fanId, tenantId)
  const createOrder = useCreateOrder(fanId, tenantId)
  const [checkoutError, setCheckoutError] = useState(null)
  const navigate = useNavigate()

  function handleCheckout() {
    setCheckoutError(null)
    createOrder.mutate(undefined, {
      onSuccess: (orderId) => {
        onOpenChange(false)
        navigate(`/merch/order/${orderId}`)
      },
      onError: (error) => {
        setCheckoutError(checkoutErrorMessage(error))
      },
    })
  }

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

          {items.map(({ id: cartItemId, product, quantity, variant }) => {
            // 15/9: το ΣΩΣΤΟ όριο είναι του συγκεκριμένου μεγέθους (variant)
            // όταν υπάρχει — ΟΧΙ το αθροιστικό product.stock_quantity, αλλιώς
            // θα επέτρεπε π.χ. 8 Small ενώ υπάρχουν μόνο 2 Small σε ένα
            // προϊόν με σύνολο 15 σε όλα τα μεγέθη μαζί.
            const stockLimit = variant ? variant.stock_quantity : product.stock_quantity
            const atLimit = stockLimit != null && quantity >= stockLimit
            return (
              <div
                key={cartItemId}
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
                    {variant && (
                      <span className="font-normal text-gray-500"> — Μέγεθος {variant.size}</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {Number(product.price).toFixed(2)}€
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItemId, -1)}
                      className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    {/* 15/9, bug fix: πριν δεν υπήρχε ΚΑΝΕΝΑ όριο — μπορούσες να
                        ανεβάσεις την ποσότητα απεριόριστα, πέρα από το πραγματικό
                        stock. null stockLimit = untracked, χωρίς όριο. */}
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItemId, 1)}
                      disabled={atLimit}
                      className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  {atLimit && (
                    <p className="mt-1 text-xs text-gray-500">
                      Έχεις ήδη όλη τη διαθέσιμη ποσότητα ({stockLimit}).
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(cartItemId)}
                  className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                >
                  <TrashIcon className="size-5" />
                </button>
              </div>
            )
          })}
        </div>

        {items.length > 0 && (
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <div className="flex w-full items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-900">Σύνολο</span>
              <span className="text-base font-semibold text-gray-900">
                {subtotal.toFixed(2)}€
              </span>
            </div>
            {checkoutError && (
              <p className="text-sm text-destructive">{checkoutError}</p>
            )}
            <Button
              type="button"
              className="w-full"
              onClick={handleCheckout}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Επεξεργασία..." : "Ολοκλήρωση παραγγελίας"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}