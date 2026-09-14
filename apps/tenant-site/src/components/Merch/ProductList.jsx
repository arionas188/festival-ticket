import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import StockBadge from "./StockBadge"
import { getTotalStock } from "../../lib/stockTiers"

export default function ProductList({ products, fanId, tenantId, isLoggedIn, onRequireAuth }) {
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

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {products.map((product) => {
            const isFavorited = favoriteIds.includes(product.id)
            return (
              <Card key={product.id} className="relative shadow-lg">
                <CardContent>
                  <div className="relative overflow-hidden rounded-md ring-1 ring-foreground/10">
                    {/* 14/9: πήγαινε στη μοιράσιμη σελίδα προϊόντος (πραγματική
                        σελίδα, όχι το παλιό photo-only ProductGallery modal). */}
                    <Link to={`/merch/overview/${product.slug}`}>
                      <img
                        alt={product.name}
                        src={product.image_urls?.[0]}
                        className="aspect-square w-full cursor-pointer object-cover hover:opacity-75"
                      />
                    </Link>

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
                      <p className="mt-1 text-sm text-gray-500">
                        {product.category === "clothing"
                          ? "Ρουχισμός"
                          : product.category === "music"
                          ? "Μουσική"
                          : "Διάφορα"}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {Number(product.price).toFixed(2)}€
                    </p>
                  </div>

                  <StockBadge quantity={getTotalStock(product)} className="mt-2" />

                  {/* asChild + Link: πραγματικό <a>, ίδιο styling με το Button
                      (ίδιο Radix Slot pattern με DialogTrigger/DialogClose asChild) */}
                  <Button asChild variant="outline" className="mt-3 w-full">
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