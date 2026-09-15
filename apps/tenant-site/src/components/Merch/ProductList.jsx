import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import StockBadge from "./StockBadge"
import { getCategoryLabel } from "../../lib/merchCategories"
import { getTotalStock } from "../../lib/stockTiers"

export default function ProductList({
  products,
  fanId,
  tenantId,
  isLoggedIn,
  onRequireAuth,
  categoryKey,
  categoryLabel,
}) {
  const navigate = useNavigate()
  const { data: favoriteIds = [] } = useFavorites(fanId, tenantId)
  const toggleFavorite = useToggleFavorite(fanId)

  function handleToggleFavorite(e, productId) {
    e.stopPropagation()
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    const isFavorited = favoriteIds.includes(productId)
    const product = products.find((p) => p.id === productId)
    toggleFavorite.mutate({ productId, isFavorited, price: product?.price, tenantId })
  }

  // 15/9, ρητό αίτημα χρήστη: ολόκληρη η κάρτα (όχι μόνο η φωτογραφία)
  // πρέπει να ανοίγει το product overview. Το αγαπημένα-icon και το
  // "Γρήγορη αγορά" κρατάνε το δικό τους ξεχωριστό click (stopPropagation
  // στο καθένα) ώστε να μην πυροδοτούν ΚΑΙ την πλοήγηση της κάρτας.
  //
  // 15/9, ρητή αναφορά χρήστη: περνάμε ΑΠΟ ΠΟΥ ήρθε ο fan (π.χ. "New
  // Arrivals") μέσω router state, ώστε το breadcrumb στο ProductOverviewRoute
  // να θυμάται ΑΥΤΗ τη διαδρομή αντί να ξαναϋπολογίζει την "πραγματική"
  // (στατική) κατηγορία του προϊόντος — δες σχόλιο εκεί.
  function handleCardClick(product) {
    navigate(`/merch/overview/${product.slug}`, {
      state: categoryKey ? { fromCategoryKey: categoryKey, fromCategoryLabel: categoryLabel } : undefined,
    })
  }

  function handleCardKeyDown(e, product) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleCardClick(product)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {products.map((product) => {
            const isFavorited = favoriteIds.includes(product.id)
            return (
              <Card
                key={product.id}
                className="relative cursor-pointer shadow-lg"
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(product)}
                onKeyDown={(e) => handleCardKeyDown(e, product)}
              >
                <CardContent>
                  <div className="relative overflow-hidden rounded-md ring-1 ring-foreground/10">
                    <img
                      alt={product.name}
                      src={product.image_urls?.[0]}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                      className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
                    >
                      {isFavorited ? (
                        <HeartIconSolid className="size-5 text-red-500" />
                      ) : (
                        <HeartIcon className="size-5 text-gray-700" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">{product.name}</h3>
                      {/* 15/9: κοινό σημείο αλήθειας (lib/merchCategories.js) —
                          πριν έλεγε "Μουσική" εδώ ενώ η σελίδα κατηγορίας
                          λέει "CD & Βινύλια" για το ίδιο category. */}
                      <p className="mt-1 text-sm text-gray-500">
                        {getCategoryLabel(product.category)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {Number(product.price).toFixed(2)}€
                    </p>
                  </div>

                  <StockBadge quantity={getTotalStock(product)} className="mt-2" showCount={false} />

                  {/* stopPropagation: το κλικ εδώ πρέπει να πάει ΜΟΝΟ στο
                      "Γρήγορη αγορά" modal, όχι ΚΑΙ στο onClick της κάρτας
                      (θα πυροδοτούσε 2 ταυτόχρονες, αντικρουόμενες πλοηγήσεις). */}
                  <Button
                    asChild
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link to={`product/${product.slug}`}>
                      Γρήγορη αγορά
                      <ShoppingCartIcon className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}