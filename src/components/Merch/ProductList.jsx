import { useState } from "react"
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import ProductGallery from "./ProductGallery"

export default function ProductList({ products, onQuickBuy, fanId }) {
  const { data: favoriteIds = [] } = useFavorites(fanId)
  const toggleFavorite = useToggleFavorite(fanId)
  const [galleryProduct, setGalleryProduct] = useState(null)

  function handleToggleFavorite(e, productId) {
    e.stopPropagation()
    if (!fanId) return
    const isFavorited = favoriteIds.includes(productId)
    toggleFavorite.mutate({ productId, isFavorited })
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          {products.map((product) => {
            const isFavorited = favoriteIds.includes(product.id)
            return (
              <div key={product.id} className="relative">
                <div className="relative">
                  <img
                    alt={product.name}
                    src={product.image_urls?.[0]}
                    onClick={() => setGalleryProduct(product)}
                    className="aspect-square w-full cursor-pointer rounded-md bg-gray-200 object-cover hover:opacity-75"
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

                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => onQuickBuy(product)}
                >
                  Γρήγορη αγορά
                  <ShoppingCartIcon className="ml-2 size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <ProductGallery product={galleryProduct} onClose={() => setGalleryProduct(null)} />
    </div>
  )
}