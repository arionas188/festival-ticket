import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import ProductQuickShop from "./ProductQuickShop"
import { useProducts } from "../../queries/useProducts"
import { isUuid } from "../../lib/isUuid"

export default function ProductModalRoute() {
  const context = useOutletContext()
  const { productId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: products, isLoading } = useProducts(context.tenantId)

  // "default" σημαίνει ότι το προϊόν είναι η πρώτη σελίδα του ιστορικού, δηλαδή
  // ο χρήστης ήρθε από κοινοποιημένο link. Τότε δεν υπάρχει πίσω μέσα στο site,
  // οπότε αντικαθιστούμε την εγγραφή αντί να γυρίσουμε πίσω.
  const cameFromSharedLink = location.key === "default"

  function handleClose() {
    if (cameFromSharedLink) {
      navigate("..", { replace: true })
      return
    }
    navigate(-1)
  }

  if (isLoading) return null

  // Δέχεται είτε UUID (παλιά, ήδη κοινοποιημένα links) είτε slug (νέα links).
  const product = products?.find((p) =>
    isUuid(productId) ? p.id === productId : p.slug === productId
  )

  // Σπασμένο/παλιό link (π.χ. προϊόν που αποσύρθηκε): γύρνα στη λίστα από πάνω
  if (!product) return <Navigate to=".." replace />

  return (
    <ProductQuickShop
      key={product.id}
      product={product}
      onClose={handleClose}
      onAddToCart={context.onAddToCart}
      isLoggedIn={context.isLoggedIn}
      onRequireAuth={context.onRequireAuth}
    />
  )
}
