import { useMemo, useState } from "react"
import { Link, Outlet, useOutletContext, useParams } from "react-router-dom"
import ProductFilters from "./ProductFilters"
import { DEFAULT_FILTERS } from "./filterDefaults"
import ProductList from "./ProductList"
import MerchBreadcrumb from "./MerchBreadcrumb"
import CardGridSkeleton from "@/components/ui/card-grid-skeleton"
import { useMerchCategories } from "../../hooks/useMerchCategories"
import { getTotalStock } from "../../lib/stockTiers"

export default function MerchCategoryRoute() {
  const context = useOutletContext()
  const { categoryKey } = useParams()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const { categories, isLoading, error } = useMerchCategories(context.tenantId)

  const category = categories.find((c) => c.key === categoryKey)

  // 16/9, ρητό αίτημα χρήστη — μόνο όταν η κατηγορία περιέχει πραγματικά
  // ρούχα εμφανίζεται το φίλτρο μεγέθους (δεν επινοούμε μεγέθη π.χ. στο
  // "music"). Ίδιο convention με το SizeSelector.jsx.
  const hasClothingItems = useMemo(
    () => (category?.items || []).some((p) => p.category === "clothing"),
    [category]
  )

  const filteredItems = useMemo(() => {
    let items = [...(category?.items || [])]

    if (filters.priceMin !== "") {
      const min = parseFloat(filters.priceMin)
      if (!Number.isNaN(min)) items = items.filter((p) => p.price >= min)
    }
    if (filters.priceMax !== "") {
      const max = parseFloat(filters.priceMax)
      if (!Number.isNaN(max)) items = items.filter((p) => p.price <= max)
    }
    if (filters.onlyAvailable) {
      items = items.filter((p) => getTotalStock(p) > 0)
    }
    if (filters.sizes.length > 0) {
      items = items.filter((p) =>
        (p.product_variants || []).some(
          (v) => filters.sizes.includes(v.size) && v.stock_quantity > 0
        )
      )
    }

    if (filters.sortBy === "price_asc") return items.sort((a, b) => a.price - b.price)
    if (filters.sortBy === "price_desc") return items.sort((a, b) => b.price - a.price)
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [category, filters])

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8">
            <CardGridSkeleton
              count={4}
              gridClassName="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2"
            />
          </div>
        </div>
      </div>
    )
  }
  if (error) return <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης προϊόντων.</p>

  if (!category) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Η κατηγορία δεν βρέθηκε.</p>
        <Link to="/merch" className="mt-2 inline-block text-sm font-medium text-gray-900 underline">
          ← Πίσω στις κατηγορίες
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* 15/9, ρητό αίτημα χρήστη — το breadcrumb πάει ΕΔΩ πλέον, έξω από
          το bg-gray-50 div: στον λευκό χώρο ανάμεσα στη γραμμή των tabs
          (Header.jsx) και το γκρι φόντο, ΟΧΙ μέσα στο γκρι. Αντικαθιστά και
          το παλιό "← Πίσω στις κατηγορίες" link (η πρώτη γραμμή του
          breadcrumb κάνει ήδη ΤΟ ΙΔΙΟ), ίδιο μοτίβο με τις άλλες σελίδες
          merch. Κεντραρισμένο (βλ. MerchBreadcrumb.jsx).
          16/9, ρητό αίτημα χρήστη (τελική θέση, μετά από 2 δοκιμές) — το
          κυκλικό κουμπί φίλτρων περνάει ΞΑΝΑ εδώ ως `action` prop, "στην
          ίδια ευθεία με το Merch Store" — ίδια γραμμή με το breadcrumb
          pill (βλ. σχόλιο στο MerchBreadcrumb.jsx). */}
      <MerchBreadcrumb
        crumbs={[
          { label: "Merch Store", to: "/merch" },
          { label: category.title, to: `/merch/category/${categoryKey}` },
        ]}
        action={
          <ProductFilters filters={filters} showSizeFilter={hasClothingItems} onApply={setFilters} />
        }
      />

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 16/9, ρητό αίτημα χρήστη (2η αλλαγή) — H1 + λίστα προϊόντων
              μέσα σε ΕΝΑ γκρι πλαίσιο με στρογγυλεμένες γωνίες (αντί για
              "γκρι σελίδα + ξεχωριστό λευκό ορθογώνιο πίσω από τις
              κάρτες" που ήταν πριν) — η σελίδα γύρισε σε bg-white, το
              γκρι μπαίνει ΜΟΝΟ εδώ, σε ένα ενιαίο, οριοθετημένο "κουτί"
              (ring-1 + rounded-2xl). Το H1 έγινε κεντραρισμένο
              (text-center, ήταν αριστερά). */}
          <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8">
            <h1 className="border-b border-gray-200 pb-4 text-center text-2xl font-bold tracking-tight text-gray-900">
              {category.title}
            </h1>

            <div className="mt-8">
              <ProductList
                products={filteredItems}
                fanId={context.fanId}
                tenantId={context.tenantId}
                isLoggedIn={context.isLoggedIn}
                onRequireAuth={context.onRequireAuth}
                categoryKey={category.key}
                categoryLabel={category.title}
              />
            </div>
          </div>
        </div>

        <Outlet context={context} />
      </div>
    </>
  )
}
