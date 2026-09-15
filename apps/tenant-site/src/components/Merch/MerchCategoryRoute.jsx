import { useMemo, useState } from "react"
import { Link, Outlet, useOutletContext, useParams } from "react-router-dom"
import ProductFilters from "./ProductFilters"
import ProductList from "./ProductList"
import MerchBreadcrumb from "./MerchBreadcrumb"
import CardGridSkeleton from "@/components/ui/card-grid-skeleton"
import { useMerchCategories } from "../../hooks/useMerchCategories"

export default function MerchCategoryRoute() {
  const context = useOutletContext()
  const { categoryKey } = useParams()
  const [sortBy, setSortBy] = useState("newest")
  const { categories, isLoading, error } = useMerchCategories(context.tenantId)

  const category = categories.find((c) => c.key === categoryKey)

  const sortedItems = useMemo(() => {
    const items = [...(category?.items || [])]
    if (sortBy === "price_asc") return items.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") return items.sort((a, b) => b.price - a.price)
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [category, sortBy])

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CardGridSkeleton
            count={4}
            gridClassName="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2"
          />
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
          merch. Κεντραρισμένο (βλ. MerchBreadcrumb.jsx). */}
      <MerchBreadcrumb
        crumbs={[
          { label: "Merch Store", to: "/merch" },
          { label: category.title, to: `/merch/category/${categoryKey}` },
        ]}
      />

      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProductFilters sortBy={sortBy} onSortChange={setSortBy} />

          <ProductList
            products={sortedItems}
            fanId={context.fanId}
            tenantId={context.tenantId}
            isLoggedIn={context.isLoggedIn}
            onRequireAuth={context.onRequireAuth}
            categoryKey={category.key}
            categoryLabel={category.title}
          />
        </div>

        <Outlet context={context} />
      </div>
    </>
  )
}
