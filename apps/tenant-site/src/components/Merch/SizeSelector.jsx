import { cn } from "@/lib/utils"
import { getStockTier } from "../../lib/stockTiers"

// 15/9, ρητό αίτημα χρήστη: ξανασχεδιασμένο από "διάλεξε ΕΝΑ μέγεθος" σε
// "διάλεξε ποσότητα ανά μέγεθος, πολλά μεγέθη ταυτόχρονα" — πιο κατανοητό
// (ο χρήστης το είπε ρητά) και λύνει και ένα πραγματικό use-case: 2 Small
// + 3 Medium σε ΜΙΑ κίνηση "Προσθήκη", αντί να ξαναανοίγεις το dropdown.
// Κάθε γραμμή = ένα πραγματικό product_variants row: [μέγεθος pill]
// (διαθέσιμος αριθμός) [− ποσότητα +]. Το pill παραμένει χρωματισμένο με
// το ΙΔΙΟ tier/χρώμα με το StockBadge (getStockTier — ένα σημείο αλήθειας),
// αλλά δεν είναι πια clickable το ίδιο — η επιλογή γίνεται μέσω του δικού
// του stepper (πρώτο "+" = επιλογή αυτού του μεγέθους).
const SIZE_ORDER = ["S", "M", "L", "XL"]

// 19/9, ρητό αίτημα χρήστη: προαιρετικό heldVariantIds (Set, βλ.
// useActiveStockHolds.js) — variant.id μέσα σε αυτό το Set σημαίνει "το
// μηδέν του εξηγείται από ενεργό hold", άρα "Μη διαθέσιμο" αντί για
// "Εξαντλημένο" (βλ. lib/stockTiers.js). Default άδειο Set — καμία αλλαγή
// συμπεριφοράς σε caller που δεν το περνάει.
export default function SizeSelector({
  variants,
  quantities,
  maxByVariant,
  onChangeQuantity,
  heldVariantIds = new Set(),
}) {
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
    <div className="mt-2 flex flex-col gap-1.5">
      {sorted.map((variant) => {
        const tier = getStockTier(variant.stock_quantity, heldVariantIds.has(variant.id))
        const isOutOfStock = variant.stock_quantity <= 0
        const qty = quantities[variant.id] ?? 0
        const max = maxByVariant[variant.id] ?? 0
        return (
          <div key={variant.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                title={tier.label(variant.stock_quantity)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  tier.className,
                  qty > 0 && "outline outline-2 outline-offset-1 outline-gray-900",
                  isOutOfStock && "line-through opacity-50"
                )}
              >
                {variant.size}
              </span>
              {/* Ρητό αίτημα χρήστη: ο διαθέσιμος αριθμός δίπλα στο μέγεθος,
                  σε παρένθεση, ώστε να φαίνεται αμέσως χωρίς να χρειάζεται
                  hover/tooltip. */}
              <span className="text-xs text-gray-500">({variant.stock_quantity})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeQuantity(variant.id, Math.max(0, qty - 1))}
                disabled={qty <= 0}
                className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => onChangeQuantity(variant.id, Math.min(qty + 1, max))}
                disabled={qty >= max}
                className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
