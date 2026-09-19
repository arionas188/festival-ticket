import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useCart } from "../../queries/useCart"
import { useActiveStockHolds } from "../../queries/useActiveStockHolds"
import SizeSelector from "./SizeSelector"
import StockBadge from "./StockBadge"
import { getTotalStock } from "../../lib/stockTiers"

// 18/9: onAddToCart/isLoggedIn/onRequireAuth αφαιρέθηκαν από εδώ (ήταν
// unused μετά την αφαίρεση του "Προσθήκη στο καλάθι", βλ. σχόλιο στο
// κουμπί "Πληρωμή" παρακάτω) — ο caller (ProductModalRoute.jsx) μπορεί να
// συνεχίσει να τα περνάει χωρίς πρόβλημα, θα ξαναχρειαστούν όταν φτιαχτεί
// το πραγματικό checkout flow εδώ.
export default function ProductQuickShop({
  product,
  onClose,
  fanId,
  tenantId,
}) {
  // 19/9, ρητό αίτημα χρήστη: default 0 (όχι 1) — το "Πληρωμή" ξεκινάει
  // ανενεργό μέχρι να βάλει ο fan έστω 1, ίδιο μοτίβο με το μέγεθος στα
  // ρούχα (hasSizeSelection, βλ. canAddToCart παρακάτω).
  const [quantity, setQuantity] = useState(0)
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
  // 19/9, ρητό αίτημα χρήστη: "Μη διαθέσιμο" (ενεργό hold, προσωρινό) αντί
  // για "Εξαντλημένο" (πραγματικό/μόνιμο μηδέν) — βλ. lib/stockTiers.js.
  const { heldVariantIds, heldProductIds } = useActiveStockHolds(tenantId)

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
  const effectiveQuantity = Math.min(quantity, Math.max(0, simpleMaxAddable))
  const isSoldOut = !hasVariants && simpleMaxAddable <= 0
  // 19/9: πρέπει ΚΑΙ να υπάρχει stock ΚΑΙ ο fan να έχει βάλει ποσότητα > 0
  // — πριν εξαρτιόταν μόνο από το stock, οπότε με default ποσότητα 1 το
  // "Πληρωμή" ήταν ενεργό αμέσως μόλις άνοιγε το modal.
  const simpleCanAdd = !hasVariants && effectiveQuantity > 0

  // 18/9, ρητό αίτημα χρήστη: το "Πληρωμή" να ξεκινάει ανενεργό και να
  // ενεργοποιείται μόλις ο fan επιλέξει έγκυρο μέγεθος+ποσότητα (ή απλή
  // ποσότητα για προϊόντα χωρίς μεγέθη) — ίδια ακριβώς συνθήκη με το παλιό
  // canAddToCart. ΔΕΝ έχει ακόμα πραγματικό onClick/checkout πίσω του —
  // μόνο η οπτική/disabled κατάσταση αλλάζει, βλ. σχόλιο στο κουμπί.
  const canAddToCart = hasVariants ? hasSizeSelection : simpleCanAdd

  function handleChangeQuantity(variantId, newQty) {
    setQuantities((prev) => ({ ...prev, [variantId]: newQty }))
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      {/* 18/9, ρητό αίτημα χρήστη: ίδιο "γκρι πλαίσιο" ύφος με τις σελίδες
          Merch (MerchCategoryRoute.jsx κ.λπ.) — bg-gray-50/ring-gray-200
          αντί για το προεπιλεγμένο λευκό popover, ΜΟΝΟ σε αυτό το instance
          (override μέσω className· το κοινό ui/dialog.jsx δεν άλλαξε, τα
          υπόλοιπα dialogs του project μένουν όπως ήταν). */}
      <DialogContent className="max-h-[85vh] overflow-y-auto bg-gray-50 ring-gray-200 sm:max-w-lg">
        <div className="flex flex-col gap-4 pt-2">
          {/* 18/9: το ίδιο "λευκή κάρτα + έντονη σκιά" ύφος με τις κάρτες
              κατηγορίας/προϊόντος (Card/CardContent, shadow-2xl) — δίνει
              την ίδια "τρισδιάστατη" αίσθηση βάθους πάνω στο γκρι πλαίσιο. */}
          <Card className="shadow-2xl">
            <CardContent>
              <img
                alt={product.name}
                src={product.image_urls?.[0]}
                className="mx-auto aspect-square w-40 rounded-md bg-gray-100 object-cover sm:w-48"
              />

              <div className="mt-4">
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
                        heldVariantIds={heldVariantIds}
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
                      {/* 19/9, ρητό αίτημα χρήστη: ορατή διαθεσιμότητα και
                          εδώ μέσα (όχι μόνο στην κάρτα του grid) — ίδιο
                          StockBadge, ίδιο σημείο αλήθειας (getTotalStock). */}
                      <StockBadge
                        quantity={getTotalStock(product)}
                        className="mb-3"
                        hasActiveHold={heldProductIds.has(product.id)}
                      />
                      <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                          disabled={isSoldOut || effectiveQuantity <= 0}
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
                      {isSoldOut ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {simpleExistingCartQty > 0
                            ? "Έχεις ήδη όλη τη διαθέσιμη ποσότητα στο καλάθι σου."
                            : "Εξαντλημένο."}
                        </p>
                      ) : (
                        effectiveQuantity === 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Επίλεξε ποσότητα για να συνεχίσεις.
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 18/9, ρητό αίτημα χρήστη: το "Πληρωμή" βγήκε ΕΞΩ από τη λευκή
              κάρτα του προϊόντος — κάθεται μόνο του μέσα στο γκρι πλαίσιο,
              πλήρες πλάτος (ίδιο πλάτος με την κάρτα, όχι edge-to-edge με
              το ίδιο το dialog — το κενό αριστερά/δεξιά έρχεται από το
              padding του DialogContent), κεντραρισμένο κείμενο, liquid-glass
              στυλ. Δεύτερος γύρος (18/9): πιο έντονη σκιά (shadow-2xl, ίδια
              "3D" λογική με τις κάρτες) + border ίδιο με το product Card
              (ring-1 ring-foreground/10, αντί για το αχνό ring-white/40) +
              disabled δυναμικά (canAddToCart) αντί για πάντα-ανενεργό — βλ.
              σχόλιο στο canAddToCart παραπάνω. Δεν υπάρχει ακόμα onClick/
              πραγματικό checkout, το title παραμένει ενημερωτικό. */}
          <button
            type="button"
            disabled={!canAddToCart}
            title="Έρχεται σύντομα"
            className="flex w-full items-center justify-center rounded-full bg-white/25 py-3 text-center text-base font-semibold text-gray-900 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-2xl transition-colors hover:bg-white/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            Πληρωμή
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
