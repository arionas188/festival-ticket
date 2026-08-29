import { useState } from "react"
import { HeartIcon, ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import TenantSearchDialog from "./TenantSearchDialog"

export default function TenantTopBar({ fanAvatarUrl, favoritesCount = 0, cartCount = 0 }) {
  const [searchOpen, setSearchOpen] = useState(false)

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
            className="relative flex size-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            <ShoppingCartIcon className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <TenantSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}