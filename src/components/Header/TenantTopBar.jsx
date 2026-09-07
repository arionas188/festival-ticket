import { useState } from "react"
import { HeartIcon, ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import TenantSearchDialog from "./TenantSearchDialog"
import FavoritesDialog from "../Merch/FavoritesDialog"
import CartDialog from "../Merch/CartDialog"
import { useCart } from "../../queries/useCart"
import { useFavorites } from "../../queries/useFavorites"

// Το avatar εδώ είναι πλέον καθαρά ένδειξη ("είσαι συνδεδεμένος") — καμία
// δική του λειτουργικότητα/menu πια. Η διαχείριση λογαριασμού (αποσύνδεση/
// διαγραφή) μετακόμισε στο global avatar, ένα σημείο για όλους τους
// tenants αντί για ξεχωριστό dropdown σε καθέναν — βλ.
// src/components/Concerto/ConcertoBar.jsx, concerto-react-router-brief.md.
export default function TenantTopBar({ fanAvatarUrl, tenantId, fanId, onQuickBuy }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart(fanId)
  const { data: favoriteIds = [] } = useFavorites(fanId)
  const favoritesCount = favoriteIds.length

  return (
    <>
      <div className="flex items-center gap-2">
        <img
          alt="Το προφίλ σου"
          src={fanAvatarUrl}
          className="size-9 rounded-full object-cover ring-2 ring-white"
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex size-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            <MagnifyingGlassIcon className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setFavoritesOpen(true)}
            className="relative flex size-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            <HeartIcon className="size-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex size-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            <ShoppingCartIcon className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <TenantSearchDialog open={searchOpen} onOpenChange={setSearchOpen} tenantId={tenantId} />

      <FavoritesDialog
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        fanId={fanId}
        tenantId={tenantId}
        onQuickBuy={onQuickBuy}
      />

      <CartDialog open={cartOpen} onOpenChange={setCartOpen} fanId={fanId} />
    </>
  )
}
