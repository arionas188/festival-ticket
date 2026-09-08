import { EnvelopeIcon, PhoneIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import bandLogoFallback from '../../assets/images/MwraStiFwtia.png'
import bandCoverFallback from '../../assets/images/MwraStiFwtiaBand.webp'
import TenantTopBar from "./TenantTopBar"
import { useAuth } from "../../hooks/useAuth"
import { useFanSession, useFollowTenant } from "../../queries/useFanSession"
import { useUnfollowTenant } from "../../queries/useFanTenants"
import { useCart } from "../../queries/useCart"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"

const TABS = ['Πληροφορίες', 'Εκδηλώσεις', 'Merch Store']

export default function Header({ tenant, settings, onRequireAuth }) {
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

  const { user, isLoggedIn } = useAuth()
  const { addItem } = useCart(user?.id, tenant?.id)
  const { data: isFollowing, isLoading: followLoading } = useFanSession(isLoggedIn ? user : null, tenant?.id)
  const followTenant = useFollowTenant()
  const unfollowTenant = useUnfollowTenant(user?.id)

  const { data: favoriteIds = [] } = useFavorites(user?.id, tenant?.id)
  const toggleFavorite = useToggleFavorite(user?.id)

  // Το login γίνεται πλέον αποκλειστικά από το global ConcertoBar (πάνω από
  // το header — βλ. App.jsx, το onRequireAuth prop ανοίγει το dialog εκεί).
  // Το παλιό, τοπικό AuthGateDialog παραμένει στον φάκελο, ανενεργό — βλ.
  // concerto-react-router-brief.md. BUG FIX (8/9): το follow ΔΕΝ είναι πια
  // αυτόματο (ούτε στο login, ούτε απλά επισκεπτόμενος το tenant) — γίνεται
  // ΜΟΝΟ όταν ο ήδη-συνδεδεμένος fan πατήσει ρητά εδώ. Αν δεν είναι καν
  // συνδεδεμένος, ανοίγει πρώτα το global login (onRequireAuth) — το ίδιο
  // dialog που χρησιμοποιείται και στα child routes (π.χ. "πρόσθεσε στο
  // καλάθι"/"αγαπημένα"/"εισιτήριο") μέσω Outlet context παρακάτω.
  function handleFollowClick() {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    if (isFollowing) {
      unfollowTenant.mutate(tenant.id)
    } else {
      followTenant.mutate({ fanId: user.id, tenantId: tenant.id })
    }
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
    navigate('/about')
  }

  // Καλείται από το TenantTopBar (καλάθι/αγαπημένα), εκτός λίστας κατηγορίας
  function handleSelectProduct(product) {
    navigate(`/merch/product/${product.id}`)
  }

  const tenantName = settings?.display_name || tenant?.name
  const tenantBio = settings?.bio
  const tenantLogo = settings?.logo_url || bandLogoFallback
  const tenantCover = settings?.cover_image_url || bandCoverFallback

  return (
    <div className="min-h-screen bg-white">
      <img
        alt=""
        src={tenantCover}
        className="h-40 w-full rounded-b-2xl object-cover object-[50%_35%] sm:h-64 sm:w-2/3 sm:mx-auto"
      />

      <div className="mx-auto max-w-md px-4 sm:max-w-2xl">
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <img
            alt=""
            src={tenantLogo}
            className="size-24 rounded-full ring-4 ring-white sm:size-32"
          />

          <div className="mb-1 flex flex-1 items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Search/favorite/καλάθι ξεκλειδώνουν με το global login
                    μόνο του (isLoggedIn) — ανεξάρτητα από το αν ακολουθεί
                    ΚΑΙ αυτό το tenant. Το follow δείχνεται ξεχωριστά, δίπλα. */}
                {isFollowing ? (
                  <button
                    type="button"
                    onClick={handleFollowClick}
                    disabled={unfollowTenant.isPending}
                    className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-red-50 hover:text-red-700 hover:ring-red-600/20"
                  >
                    Ακολουθείς
                  </button>
                ) : (
                  <Button
                    onClick={handleFollowClick}
                    disabled={followLoading || followTenant.isPending}
                    className="shrink-0 rounded-full bg-green-600 px-2 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700"
                  >
                    <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
                    Ακολούθησε
                  </Button>
                )}

                <div className="flex-1">
                  <TenantTopBar
                    tenantId={tenant?.id}
                    fanId={user?.id}
                    onQuickBuy={handleSelectProduct}
                  />
                </div>
              </>
            ) : (
              <Button
                onClick={handleFollowClick}
                className="rounded-full bg-green-600 px-2 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700"
              >
                <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
                Ακολούθησε
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold text-gray-900">{tenantName}</h1>
          {settings?.category_label && (
            <p className="text-sm text-gray-400">{settings.category_label}</p>
          )}
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
              onRequireAuth,
              onAddToCart: handleAddToCart,
              tenantType: tenant?.type,
              tenantBio,
              galleryUrls: settings?.gallery_urls,
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

    </div>
  )
}