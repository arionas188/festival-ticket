import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HeartIcon, ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import TenantSearchDialog from "./TenantSearchDialog"
import FavoritesDialog from "../Merch/FavoritesDialog"
import { useCart } from "../../queries/useCart"
import { useFavorites } from "../../queries/useFavorites"

// Χωρίς avatar εδώ (8/9) — η ένδειξη "είσαι συνδεδεμένος/ακολουθείς" περνάει
// πλέον αποκλειστικά από το κείμενο του follow button στο Header.jsx
// ("Ακολούθησε"/"Ακολουθείς"). Η διαχείριση λογαριασμού (αποσύνδεση/
// διαγραφή) παραμένει στο global avatar, ένα σημείο για όλους τους
// tenants αντί για ξεχωριστό dropdown σε καθέναν — βλ.
// src/components/Concerto/ConcertoBar.jsx, concerto-react-router-brief.md.
export default function TenantTopBar({ tenantId, fanId, onQuickBuy }) {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const { itemCount } = useCart(fanId, tenantId)
  const { data: favoriteIds = [] } = useFavorites(fanId, tenantId)
  const favoritesCount = favoriteIds.length

  return (
    <>
      <div className="flex items-center justify-end gap-2">
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

        {/* 15/9, ρητή απόφαση: αντί για το μικρό CartDialog popup, πηγαίνει
            στη νέα πλήρη σελίδα καλαθιού (CartRoute.jsx, merch/cart) —
            συνέπεια με το ότι και το checkout ήδη πάει σε πλήρη σελίδα
            (OrderSummaryRoute), λιγότερη διπλή λογική επεξεργασίας καλαθιού
            σε δύο σημεία. Το CartDialog.jsx ΔΕΝ διαγράφηκε — έμεινε στον
            φάκελο, απλά δεν χρησιμοποιείται πια εδώ, σε περίπτωση που
            χρειαστεί να αλλάξει γνώμη ο χρήστης. */}
        <button
          type="button"
          onClick={() => navigate("/merch/cart")}
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

      <TenantSearchDialog open={searchOpen} onOpenChange={setSearchOpen} tenantId={tenantId} />

      <FavoritesDialog
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        fanId={fanId}
        tenantId={tenantId}
        onQuickBuy={onQuickBuy}
      />

    </>
  )
}
