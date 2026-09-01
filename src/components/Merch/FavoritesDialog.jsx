import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import { useProducts } from "../../queries/useProducts"

export default function FavoritesDialog({ open, onOpenChange, fanId, tenantId, onQuickBuy }) {
  const { data: favoriteIds = [] } = useFavorites(fanId)
  const { data: allProducts } = useProducts(tenantId)
  const toggleFavorite = useToggleFavorite(fanId)

  const favoriteProducts = (allProducts || []).filter((p) =>
    favoriteIds.includes(p.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Αγαπημένα</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {favoriteProducts.length === 0 && (
            <p className="text-sm text-gray-500">Δεν έχεις προσθέσει αγαπημένα ακόμα.</p>
          )}

          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3"
            >
              <img
                src={product.image_urls?.[0]}
                alt={product.name}
                className="size-14 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {product.name}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {Number(product.price).toFixed(2)}€
                  </p>
                  <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                    <button
                      type="button"
                      onClick={() => onQuickBuy(product)}
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ShoppingCartIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite.mutate({ productId: product.id, isFavorited: true })
                      }
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}