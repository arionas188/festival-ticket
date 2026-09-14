import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useCart } from "../../queries/useCart"
import SizeSelector from "./SizeSelector"

export default function ProductQuickShop({
  product,
  onClose,
  onAddToCart,
  isLoggedIn,
  onRequireAuth,
  fanId,
  tenantId,
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  // 15/9, ίδιο bug fix με ProductOverviewRoute.jsx: το + δεν είχε όριο, ο fan
  // μπορούσε να ζητήσει περισσότερα από όσα υπάρχουν. Δες εκεί για πλήρες
  // σχόλιο — ίδια λογική εδώ, ίδιο σημείο αλήθειας (stock_quantity μείον ό,τι
  // ήδη έχει στο καλάθι για αυτό το προϊόν).
  const { items: cartItems } = useCart(fanId, tenantId)

  // Η επαναφορά ποσότητας/μεγέθους γίνεται πλέον με remount: ο caller δίνει
  // key={product.id}, οπότε το state ξεκινά καθαρό σε κάθε προϊόν.
  if (!product) return null

  // 15/9: stock ανά μέγεθος (product_variants) — δες ProductOverviewRoute.jsx
  // για πλήρες σχόλιο, ίδια ακριβώς λογική εδώ.
  const hasVariants = Boolean(product.product_variants?.length)
  const requiresSizeSelection = product.category === "clothing" && hasVariants
  const selectedVariant =
    product.product_variants?.find((v) => v.id === selectedVariantId) ?? null
  const cartVariantId = requiresSizeSelection ? selectedVariantId : null
  const needsSizePick = requiresSizeSelection && !selectedVariantId

  const stockForCap = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
  const existingCartQty =
    cartItems.find(
      (i) => i.product.id === product.id && (i.variant?.id ?? null) === cartVariantId
    )?.quantity ?? 0
  const maxAddable = needsSizePick
    ? 0
    : stockForCap != null
      ? Math.max(0, stockForCap - existingCartQty)
      : Infinity
  const canAddToCart = !needsSizePick && maxAddable > 0
  const effectiveQuantity = Math.min(quantity, Math.max(1, maxAddable))

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <div className="flex flex-col gap-4 pt-2">
          <img
            alt={product.name}
            src={product.image_urls?.[0]}
            className="mx-auto aspect-square w-40 rounded-lg bg-gray-100 object-cover sm:w-48"
          />

          <div>
            <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>

            <p className="mt-1 font-medium text-gray-900">
              {Number(product.price).toFixed(2)}€
            </p>
            {product.description && (
              <p className="mt-2 text-sm text-gray-600">{product.description}</p>
            )}

            <div className="mt-6">
              {product.category === "clothing" && (
                <fieldset aria-label="Επιλογή μεγέθους">
                  <div className="text-sm font-medium text-gray-900">Μέγεθος</div>
                  <SizeSelector
                    variants={product.product_variants}
                    selectedVariantId={selectedVariantId}
                    onSelect={setSelectedVariantId}
                  />
                </fieldset>
              )}

              <div className="mt-6">
                <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={!canAddToCart}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{effectiveQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(q + 1, maxAddable))}
                    disabled={effectiveQuantity >= maxAddable}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                {needsSizePick && (
                  <p className="mt-1 text-xs text-gray-500">
                    Επίλεξε μέγεθος για να δεις τη διαθεσιμότητα.
                  </p>
                )}
                {!needsSizePick && !canAddToCart && (
                  <p className="mt-1 text-xs text-gray-500">
                    {stockForCap > 0
                      ? "Έχεις ήδη όλη τη διαθέσιμη ποσότητα στο καλάθι σου."
                      : "Εξαντλημένο."}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    // Το URL του προϊόντος είναι δημόσιο, άρα εδώ φτάνει και
                    // αποσυνδεδεμένος επισκέπτης από κοινοποιημένο link. Το modal
                    // μένει ανοιχτό: το redirectTo του OAuth τον επιστρέφει σε αυτό
                    // ακριβώς το URL μετά τη σύνδεση.
                    if (!isLoggedIn) {
                      onRequireAuth()
                      return
                    }
                    if (!canAddToCart) return
                    onAddToCart(product, effectiveQuantity, cartVariantId)
                    onClose()
                  }}
                  disabled={!canAddToCart}
                >
                  Προσθήκη στο καλάθι
                </Button>
                <Button type="button" variant="ghost" disabled title="Έρχεται σύντομα">
                  Πληρωμή
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}