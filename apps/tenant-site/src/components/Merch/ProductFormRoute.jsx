import { Navigate, useOutletContext, useParams } from "react-router-dom"
import ProductFormPage from "./ProductFormPage"
import { useProducts } from "../../queries/useProducts"
import { isUuid } from "../../lib/isUuid"
import { Skeleton } from "@/components/ui/skeleton"

// Routing wrapper γύρω από το ProductFormPage.jsx (20/9 — ίδιο ΑΚΡΙΒΩΣ
// μοτίβο με EventFormRoute.jsx). Δύο routes καταλήγουν εδώ (main.jsx):
// 'merch/product/new' (χωρίς :productId — δημιουργία) και
// 'merch/product/:productId/edit' (επεξεργασία).
//
// Βρίσκει το προϊόν μέσα στα ήδη cached δεδομένα του useProducts() αντί
// για ξεχωριστό fetch-by-id — δέχεται slug ή UUID, fallback σε Navigate
// αν δεν βρεθεί (ίδιο μοτίβο με ProductOverviewRoute.jsx).
//
// Admin guard εδώ (όχι μόνο κρυμμένο κουμπί στο UI): κάποιος που
// πληκτρολογεί απευθείας το URL χωρίς να είναι πραγματικός admin αυτού
// του tenant στέλνεται πίσω στο Merch Store — η πραγματική ασφάλεια είναι
// πάντα το RLS στη βάση (βλ. migration
// 20260920080000_add_products_admin_write.sql), αυτό είναι απλά σωστό UX.
export default function ProductFormRoute() {
  const context = useOutletContext()
  const { productId } = useParams()
  const { data: products, isLoading } = useProducts(context.tenantId)

  if (!context.isAdmin) return <Navigate to="/merch" replace />

  // 'merch/product/new' — δεν έχει :productId, δημιουργία, δεν χρειάζεται
  // να περιμένει το useProducts() να φορτώσει.
  if (!productId) {
    return <ProductFormPage tenantId={context.tenantId} product={null} />
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl bg-gray-50 p-4 pb-24 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const product = products?.find((p) =>
    isUuid(productId) ? p.id === productId : p.slug === productId
  )
  if (!product) return <Navigate to="/merch" replace />

  return <ProductFormPage tenantId={context.tenantId} product={product} />
}
