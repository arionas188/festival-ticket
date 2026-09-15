import { Outlet, useOutletContext } from "react-router-dom"
import CategoryGrid from "./CategoryGrid"
import MerchBreadcrumb from "./MerchBreadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useMerchCategories } from "../../hooks/useMerchCategories"

export default function MerchCategoriesRoute() {
  const context = useOutletContext()
  const { categories, isLoading, error } = useMerchCategories(context.tenantId)

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mt-6 flex flex-col gap-6 lg:gap-8">
            <Skeleton className="aspect-video w-full rounded-lg sm:aspect-4/1" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (error) return <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης προϊόντων.</p>

  return (
    <>
      {/* 15/9, ρητό αίτημα χρήστη: το breadcrumb πάει ΕΔΩ πλέον — έξω από
          το bg-gray-50 div, ώστε να κάθεται στον λευκό χώρο ανάμεσα στη
          γραμμή των tabs (Header.jsx) και το γκρι φόντο των κατηγοριών,
          ΟΧΙ μέσα στο γκρι. Κεντραρισμένο (βλ. MerchBreadcrumb.jsx) — καθώς
          μεγαλώνει η διαδρομή, μεγαλώνει συμμετρικά γύρω από το κέντρο. */}
      <MerchBreadcrumb crumbs={[{ label: "Merch Store", to: "/merch" }]} />

      <div className="bg-gray-50">
        <CategoryGrid categories={categories} />

        <Outlet context={context} />
      </div>
    </>
  )
}
