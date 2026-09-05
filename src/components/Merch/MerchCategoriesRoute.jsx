import { Outlet, useOutletContext } from "react-router-dom"
import CategoryGrid from "./CategoryGrid"
import { useMerchCategories } from "../../hooks/useMerchCategories"

export default function MerchCategoriesRoute() {
  const context = useOutletContext()
  const { categories, isLoading, error } = useMerchCategories(context.tenantId)

  if (isLoading) return <p className="p-8 text-sm text-gray-500">Φόρτωση προϊόντων...</p>
  if (error) return <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης προϊόντων.</p>

  return (
    <div className="bg-gray-50">
      <CategoryGrid categories={categories} />

      <Outlet context={context} />
    </div>
  )
}
