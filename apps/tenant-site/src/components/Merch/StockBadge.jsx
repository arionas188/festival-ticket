import { cn } from "@/lib/utils"
import { getStockTier } from "../../lib/stockTiers"

// Ένα reusable badge διαθεσιμότητας, βασισμένο ΜΟΝΟ στο product.stock_quantity
// (δεν υπάρχει στήλη max/αρχικού stock στο schema, οπότε τα κατώφλια είναι σε
// απόλυτα τεμάχια, όχι ποσοστό — ρητή απόφαση χρήστη 14/9, μετά από σύγκριση
// με το πώς το κάνουν μεγάλα e-shop: εκεί δείχνουν τον ακριβή αριθμό μόνο όταν
// το απόθεμα είναι χαμηλό· εδώ ο χρήστης προτίμησε να δείχνεται ο ακριβής
// αριθμός ΠΑΝΤΑ, σε όλα τα tiers). Τα ίδια tiers/χρώματα ζουν στο
// lib/stockTiers.js (ΟΧΙ εδώ μέσα — eslint react-refresh/only-export-components
// απαγορεύει non-component exports σε αρχείο με default component export),
// ώστε ΟΠΟΥΔΗΠΟΤΕ χρειαστεί badge/χρώμα διαθεσιμότητας (grid card, product
// overview, SizeSelector.jsx) να χρησιμοποιείται το ΙΔΙΟ, όχι ξαναγραμμένη λογική.
// 15/9, ρητό αίτημα χρήστη: στην κάρτα προϊόντος του grid, ο ακριβής
// αριθμός δεν χρειάζεται πια -- φαίνεται μόνο μέσα στη σελίδα προϊόντος
// (και στο SizeSelector, ανά μέγεθος). showCount=false δείχνει μόνο το
// tier text (π.χ. "Διαθέσιμα"), χωρίς το "(N)". Default true -- καμία
// αλλαγή συμπεριφοράς όπου δεν περάσαμε ρητά false.
export default function StockBadge({ quantity, className, showCount = true }) {
  // Προϊόν χωρίς tracked stock (null/undefined) — δεν εμφανίζουμε τίποτα,
  // δεν έχουμε πραγματικό δεδομένο για να δείξουμε.
  if (quantity == null) return null

  const tier = getStockTier(quantity)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tier.className,
        className
      )}
    >
      {showCount ? tier.label(quantity) : tier.shortLabel}
    </span>
  )
}
