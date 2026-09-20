import { useMemo } from "react"
import { useProducts } from "../queries/useProducts"
import { CATEGORY_LABELS } from "../lib/merchCategories"

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

// Υπολογίζεται μία φορά στο load: το Date.now() είναι impure και δεν επιτρέπεται
// μέσα σε render, ενώ ένα παράθυρο 6 μηνών δεν κερδίζει τίποτα από επαναϋπολογισμό.
const NEW_ARRIVAL_CUTOFF = Date.now() - SIX_MONTHS_MS

// Τα keys είναι και τα URL segments του /merch/category/:categoryKey
export function useMerchCategories(tenantId) {
  const { data: products, isLoading, error } = useProducts(tenantId)

  const categories = useMemo(() => {
    const all = products || []

    // Μόνο κατηγορίες με τουλάχιστον 1 προϊόν — αλλιώς ένα tenant χωρίς
    // π.χ. "Διάφορα" προϊόντα θα έδειχνε ένα άδειο, χωρίς εικόνα πλακίδιο
    // στο CategoryGrid που οδηγεί σε κενή σελίδα κατηγορίας.
    return [
      {
        key: "new",
        title: "New Arrivals",
        // 20/9, ρητό αίτημα χρήστη: εκτός από το αυτόματο "μέσα στους
        // τελευταίους 6 μήνες", ο admin μπορεί τώρα να το τσεκάρει
        // χειροκίνητα (products.is_new_arrival, βλ. ProductFormPage.jsx) —
        // π.χ. για κάτι που καταχωρήθηκε στο σύστημα νωρίτερα αλλά θέλει
        // να δείχνει ως "καινούριο" όταν ανοίξει η πώλησή του.
        items: all.filter(
          (p) => p.is_new_arrival || new Date(p.created_at).getTime() >= NEW_ARRIVAL_CUTOFF
        ),
      },
      {
        key: "clothing",
        title: CATEGORY_LABELS.clothing,
        items: all.filter((p) => p.category === "clothing"),
      },
      {
        key: "music",
        title: CATEGORY_LABELS.music,
        items: all.filter((p) => p.category === "music"),
      },
      {
        key: "various",
        title: CATEGORY_LABELS.various,
        items: all.filter((p) => p.category === "various"),
      },
    ].filter((cat) => cat.items.length > 0)
  }, [products])

  return { products, categories, isLoading, error }
}
