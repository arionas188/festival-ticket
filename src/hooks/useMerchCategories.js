import { useMemo } from "react"
import { useProducts } from "../queries/useProducts"

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

// Υπολογίζεται μία φορά στο load: το Date.now() είναι impure και δεν επιτρέπεται
// μέσα σε render, ενώ ένα παράθυρο 6 μηνών δεν κερδίζει τίποτα από επαναϋπολογισμό.
const NEW_ARRIVAL_CUTOFF = Date.now() - SIX_MONTHS_MS

// Τα keys είναι και τα URL segments του /merch/category/:categoryKey
export function useMerchCategories(tenantId) {
  const { data: products, isLoading, error } = useProducts(tenantId)

  const categories = useMemo(() => {
    const all = products || []

    return [
      {
        key: "new",
        title: "New Arrivals",
        items: all.filter((p) => new Date(p.created_at).getTime() >= NEW_ARRIVAL_CUTOFF),
      },
      {
        key: "clothing",
        title: "Ρουχισμός",
        items: all.filter((p) => p.category === "clothing"),
      },
      {
        key: "music",
        title: "CD & Βινύλια",
        items: all.filter((p) => p.category === "music"),
      },
      {
        key: "various",
        title: "Διάφορα",
        items: all.filter((p) => p.category === "various"),
      },
    ]
  }, [products])

  return { products, categories, isLoading, error }
}
