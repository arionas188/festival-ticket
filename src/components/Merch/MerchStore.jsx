import { useState, useMemo } from "react"
import { useProducts } from "../../queries/useProducts"
import CategoryGrid from "./CategoryGrid"
import ProductList from "./ProductList"
import ProductFilters from "./ProductFilters"

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

export default function MerchStore({ tenantId, fanId, onSelectProduct, isLoggedIn, onRequireAuth }) {
  const { data: products, isLoading, error } = useProducts(tenantId)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState("newest")

  const newArrivals = useMemo(() => {
    if (!products) return []
    const cutoff = Date.now() - SIX_MONTHS_MS
    return products.filter((p) => new Date(p.created_at).getTime() >= cutoff)
  }, [products])

  const clothing = useMemo(() => products?.filter((p) => p.category === "clothing") || [], [products])
  const music = useMemo(() => products?.filter((p) => p.category === "music") || [], [products])
  const various = useMemo(() => products?.filter((p) => p.category === "various") || [], [products])

  const categories = useMemo(
    () => [
      { key: "new", title: "New Arrivals", items: newArrivals },
      { key: "clothing", title: "Ρουχισμός", items: clothing },
      { key: "music", title: "CD & Βινύλια", items: music },
      { key: "various", title: "Διάφορα", items: various },
    ],
    [newArrivals, clothing, music, various]
  )

  const activeItems = useMemo(
    () => categories.find((c) => c.key === selectedCategory)?.items || [],
    [categories, selectedCategory]
  )

  const sortedItems = useMemo(() => {
    const items = [...activeItems]
    if (sortBy === "price_asc") return items.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") return items.sort((a, b) => b.price - a.price)
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [activeItems, sortBy])

  if (isLoading) return <p className="p-8 text-sm text-gray-500">Φόρτωση προϊόντων...</p>
  if (error) return <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης προϊόντων.</p>

  return (
    <div className="bg-gray-50">
      {selectedCategory === null && (
        <CategoryGrid categories={categories} onSelect={setSelectedCategory} />
      )}

      {selectedCategory !== null && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="mb-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Πίσω στις κατηγορίες
          </button>

          <ProductFilters sortBy={sortBy} onSortChange={setSortBy} />

          <ProductList
            products={sortedItems}
            onQuickBuy={onSelectProduct}
            fanId={fanId}
            isLoggedIn={isLoggedIn}
            onRequireAuth={onRequireAuth}
          />
        </div>
      )}
    </div>
  )
}