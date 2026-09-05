import { EnvelopeIcon, PhoneIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import bandLogoFallback from '../../assets/images/MwraStiFwtia.png'
import bandCoverFallback from '../../assets/images/MwraStiFwtiaBand.webp'
import TenantTopBar from "./TenantTopBar"
import AuthGateDialog from "./AuthGateDialog"
import { useAuth } from "../../hooks/useAuth"
import { supabase } from "../../lib/supabase"
import { useFanSession } from "../../queries/useFanSession"
import { useCart } from "../../queries/useCart"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"

const TABS = ['Πληροφορίες', 'Εκδηλώσεις', 'Merch Store']

export default function Header({ tenant, settings }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Και τα τρία tabs είναι πλέον routes (Merch, Events, και το index '/' για
  // Πληροφορίες) — το activeTab προκύπτει αποκλειστικά από το pathname, χωρίς
  // ξεχωριστό React state.
  const activeTab = location.pathname.startsWith('/merch')
    ? 'Merch Store'
    : location.pathname.startsWith('/events')
      ? 'Εκδηλώσεις'
      : 'Πληροφορίες'

  const [authGateOpen, setAuthGateOpen] = useState(false)
  const { user, isLoggedIn } = useAuth()
  const { addItem } = useCart(user?.id)
  const { data: isFollowing, isLoading: followLoading } = useFanSession(isLoggedIn ? user : null, tenant?.id)

  const { data: favoriteIds = [] } = useFavorites(user?.id)
  const toggleFavorite = useToggleFavorite(user?.id)

  function handleFollowClick() {
    if (!isLoggedIn) {
      setAuthGateOpen(true)
      return
    }
  }

  // Κοινό callback: κάθε σημείο που χρειάζεται login το καλεί, αντί να διαχειρίζεται δικό του modal
  function requireAuth() {
    setAuthGateOpen(true)
  }

  function handleAddToCart(product, quantity) {
    addItem(product, quantity)
    if (favoriteIds.includes(product.id)) {
      toggleFavorite.mutate({ productId: product.id, isFavorited: true })
    }
  }

  function handleTabClick(tab) {
    if (tab === 'Merch Store') {
      navigate('/merch')
      return
    }
    if (tab === 'Εκδηλώσεις') {
      navigate('/events')
      return
    }
    navigate('/')
  }

  // Καλείται από το TenantTopBar (καλάθι/αγαπημένα), εκτός λίστας κατηγορίας
  function handleSelectProduct(product) {
    navigate(`/merch/product/${product.id}`)
  }

  const bandName = settings?.display_name || tenant?.name
  const bandBio = settings?.bio
  const bandLogo = settings?.logo_url || bandLogoFallback
  const bandCover = settings?.cover_image_url || bandCoverFallback

  const showTopBar = isLoggedIn && isFollowing

  const hasFollowedBefore = tenant?.id
    ? localStorage.getItem(`followed_tenant_${tenant.id}`) === "true"
    : false

  return (
    <div className="min-h-screen bg-white">
      <img
        alt=""
        src={bandCover}
        className="h-40 w-full rounded-b-2xl object-cover object-[50%_35%] sm:h-64 sm:w-2/3 sm:mx-auto"
      />

      <div className="mx-auto max-w-md px-4 sm:max-w-2xl">
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <img
            alt=""
            src={bandLogo}
            className="size-24 rounded-full ring-4 ring-white sm:size-32"
          />

          {showTopBar ? (
            <div className="mb-1 flex-1">
              <TenantTopBar
                fanAvatarUrl={user?.user_metadata?.avatar_url}
                onSignOut={() => supabase.auth.signOut()}
                tenantId={tenant?.id}
                fanId={user?.id}
                onQuickBuy={handleSelectProduct}
              />
            </div>
          ) : (
            <Button
              onClick={handleFollowClick}
              disabled={followLoading}
              className="mb-1 rounded-full bg-green-600 px-2 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700"
            >
              <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
              {hasFollowedBefore ? "Σύνδεση" : "Ακολούθησε"}
            </Button>
          )}
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold text-gray-900">{bandName}</h1>
          <p className="text-sm text-gray-400">Καλλιτέχνης</p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {TABS.map((tab) => (
            <Button
              key={tab}
              onClick={() => handleTabClick(tab)}
              aria-pressed={activeTab === tab}
              className={
                activeTab === tab
                  ? "rounded-full bg-green-600 px-4 text-white hover:bg-green-700"
                  : "rounded-full bg-white px-4 text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
              }
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          {/* Ένα μόνο Outlet: το router αποφασίζει ποιο route-component ταιριάζει
              (InfoRoute / EventsRoute / MerchCategoriesRoute κ.λπ.), όχι το tab state. */}
          <Outlet
            context={{
              tenantId: tenant?.id,
              fanId: user?.id,
              isLoggedIn,
              onRequireAuth: requireAuth,
              onAddToCart: handleAddToCart,
              bandBio,
            }}
          />
        </div>

        <div className="mt-8 mb-6 flex gap-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
          >
            <EnvelopeIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
            <span>Message</span>
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
          >
            <PhoneIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
            <span>Call</span>
          </button>
        </div>
      </div>

      <AuthGateDialog
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        tenantName={bandName}
        tenantLogo={bandLogo}
        tenantCover={bandCover}
      />
    </div>
  )
}