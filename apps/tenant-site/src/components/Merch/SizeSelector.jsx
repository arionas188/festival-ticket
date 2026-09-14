import { cn } from "@/lib/utils"
import { getStockTier } from "../../lib/stockTiers"

// 15/9, ρητό αίτημα χρήστη: αντικαθιστά τα παλιά, αμιγώς διακοσμητικά
// PLACEHOLDER_SIZES κουμπιά (ProductQuickShop.jsx/ProductOverviewRoute.jsx
// τα είχαν ΔΙΠΛΑ αντιγραμμένα, καμία σύνδεση με πραγματικό stock). Ένα
// component, χρησιμοποιείται και στα δύο σημεία — "να μην κάνουμε extra
// γραμμές κώδικα" (ρητό αίτημα χρήστη, 14/9). Κάθε κουμπί = ένα πραγματικό
// product_variants row, χρωματισμένο με το ΙΔΙΟ tier/χρώμα με το StockBadge
// (getStockTier — ένα σημείο αλήθειας), disabled στο κόκκινο (0 τεμάχια).
const SIZE_ORDER = ["S", "M", "L", "XL"]

export default function SizeSelector({ variants, selectedVariantId, onSelect }) {
  // Δεν επινοούμε μεγέθη — αν το προϊόν δεν έχει ακόμα καμία γραμμή
  // product_variants στη βάση (π.χ. παλιό προϊόν πριν το backfill), το
  // λέμε ρητά αντί να δείξουμε 4 fake κουμπιά.
  if (!variants?.length) {
    return (
      <p className="mt-2 text-xs text-gray-500">
        Δεν υπάρχουν ακόμα μεγέθη καταχωρημένα για αυτό το προϊόν.
      </p>
    )
  }

  const sorted = [...variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  )

  return (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {sorted.map((variant) => {
        const tier = getStockTier(variant.stock_quantity)
        const isSelected = variant.id === selectedVariantId
        const isDisabled = variant.stock_quantity <= 0
        return (
          <button
            key={variant.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(variant.id)}
            title={tier.label(variant.stock_quantity)}
            className={cn(
              "flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors",
              tier.className,
              isSelected && "outline outline-2 outline-offset-1 outline-gray-900",
              isDisabled && "cursor-not-allowed opacity-50 line-through"
            )}
          >
            {variant.size}
          </button>
        )
      })}
    </div>
  )
}
