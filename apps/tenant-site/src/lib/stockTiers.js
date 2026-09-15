// 15/9: εξάγεται σε δικό του αρχείο (όχι μέσα στο StockBadge.jsx) γιατί το
// eslint react-refresh/only-export-components σκάει όταν ένα component file
// εξάγει και non-component συναρτήσεις μαζί με το default component — ίδιο
// pattern με τα ήδη υπάρχοντα σφάλματα σε ui/toggle.jsx/ui/tooltip.jsx (δεν
// τα αγγίζουμε, είναι shadcn-generated, εκτός scope). Ένα σημείο αλήθειας
// για τα tiers διαθεσιμότητας — StockBadge.jsx (pill) ΚΑΙ SizeSelector.jsx
// (χρωματισμένα κουμπιά μεγέθους) εισάγουν από εδώ, όχι ξαναγραμμένη λογική.
const TIERS = [
  {
    test: (q) => q <= 0,
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
    label: () => "Εξαντλημένο",
    // 15/9: shortLabel -- ίδιο κείμενο ΧΩΡΙΣ τον αριθμό, ρητό αίτημα χρήστη
    // ο ακριβής αριθμός να φαίνεται ΜΟΝΟ μέσα στη σελίδα προϊόντος (StockBadge
    // showCount=false στην κάρτα του grid, βλ. ProductList.jsx).
    shortLabel: "Εξαντλημένο",
  },
  {
    test: (q) => q <= 2,
    className: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20",
    label: (q) => `Ελάχιστα διαθέσιμα (${q})`,
    shortLabel: "Ελάχιστα διαθέσιμα",
  },
  {
    test: (q) => q <= 5,
    className: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20",
    label: (q) => `Λιγοστά διαθέσιμα (${q})`,
    shortLabel: "Λιγοστά διαθέσιμα",
  },
  {
    // 6+ — καμία επιπλέον συνθήκη, είναι το τελευταίο tier (catch-all).
    test: () => true,
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
    label: (q) => `Διαθέσιμα (${q})`,
    shortLabel: "Διαθέσιμα",
  },
]

export function getStockTier(quantity) {
  return TIERS.find((t) => t.test(quantity))
}

// Το αθροιστικό stock ενός προϊόντος — αν έχει πραγματικά product_variants
// (ρούχα με μεγέθη, βλ. migration 20260915120000), το άθροισμά τους είναι η
// μόνη πηγή αλήθειας (όχι το products.stock_quantity, που για ρούχα με
// variants δεν ενημερώνεται πια). Χωρίς variants (music/other, ή clothing
// πριν το backfill), παραμένει απλά το products.stock_quantity, όπως πάντα.
export function getTotalStock(product) {
  if (product.product_variants?.length) {
    return product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0)
  }
  return product.stock_quantity
}
