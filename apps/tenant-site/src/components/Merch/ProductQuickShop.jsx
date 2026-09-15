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
  // 15/9: ίδιο multi-size + ανά-μέγεθος-ποσότητα μοντέλο με
  // ProductOverviewRoute.jsx (SizeSelector.jsx άλλαξε API εκεί — αναγκαία
  // ενημέρωση εδώ ώστε να μη σπάσει, ο χρήστης δεν ζήτησε ρητά αλλαγή σε
  // αυτό το modal, αλλά μοιράζονται το ίδιο component).
  const [quantities, setQuantities] = useState({})
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

  const maxByVariant = {}
  if (hasVariants) {
    for (const variant of product.product_variants) {
      const existingCartQty =
        cartItems.find((i) => i.product.id === product.id && i.variant?.id === variant.id)
          ?.quantity ?? 0
      maxByVariant[variant.id] = Math.max(0, variant.stock_quantity - existingCartQty)
    }
  }

  const selectedEntries = Object.entries(quantities).filter(([, qty]) => qty > 0)
  const hasSizeSelection = selectedEntries.length > 0

  const simpleExistingCartQty = !hasVariants
    ? (cartItems.find((i) => i.product.id === product.id && !i.variant)?.quantity ?? 0)
    : 0
  const simpleMaxAddable = !hasVariants
    ? product.stock_quantity != null
      ? Math.max(0, product.stock_quantity - simpleExistingCartQty)
      : Infinity
    : 0
  const simpleCanAdd = !hasVariants && simpleMaxAddable > 0
  const effectiveQuantity = Math.min(quantity, Math.max(1, simpleMaxAddable))

  const canAddToCart = hasVariants ? hasSizeSelection : simpleCanAdd

  function handleChangeQuantity(variantId, newQty) {
    setQuantities((prev) => ({ ...prev, [variantId]: newQty }))
  }

  async function handleAdd() {
    // Το URL του προϊόντος είναι δημόσιο, άρα εδώ φτάνει και αποσυνδεδεμένος
    // επισκέπτης από κοινοποιημένο link. Το modal μένει ανοιχτό: το
    // redirectTo του OAuth τον επιστρέφει σε αυτό ακριβώς το URL μετά τη
    // σύνδεση.
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    if (!canAddToCart) return
    if (hasVariants) {
      for (const [variantId, qty] of selectedEntries) {
        await onAddToCart(product, qty, variantId)
      }
    } else {
      await onAddToCart(product, effectiveQuantity, null)
    }
    onClose()
  }

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
                    quantities={quantities}
                    maxByVariant={maxByVariant}
                    onChangeQuantity={handleChangeQuantity}
                  />
                  {hasVariants && !hasSizeSelection && (
                    <p className="mt-2 text-xs text-gray-500">
                      Επίλεξε μέγεθος και ποσότητα για να προσθέσεις στο καλάθι.
                    </p>
                  )}
                </fieldset>
              )}

              {!hasVariants && (
                <div className="mt-6">
                  <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={!simpleCanAdd}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {effectiveQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(q + 1, simpleMaxAddable))}
                      disabled={effectiveQuantity >= simpleMaxAddable}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  {!simpleCanAdd && (
                    <p className="mt-1 text-xs text-gray-500">
                      {simpleExistingCartQty > 0
                        ? "Έχεις ήδη όλη τη διαθέσιμη ποσότητα στο καλάθι σου."
                        : "Εξαντλημένο."}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <Button type="button" onClick={handleAdd} disabled={!canAddToCart}>
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
