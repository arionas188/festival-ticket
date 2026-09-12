import { PlusIcon } from '@heroicons/react/20/solid'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import bandLogoFallback from '../../assets/images/MwraStiFwtia.png'
import bandCoverFallback from '../../assets/images/MwraStiFwtiaBand.webp'
import TenantTopBar from "./TenantTopBar"
import EditCoverImageDialog from "./EditCoverImageDialog"
import EditLogoImageDialog from "./EditLogoImageDialog"
import { useAuth } from "../../hooks/useAuth"
import { useIsTenantAdmin } from "../../hooks/useIsTenantAdmin"
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
  // Inline admin-editing (12/9, βλ. concerto-brief.md) — true ΜΟΝΟ αν ο
  // συνδεδεμένος χρήστης είναι πραγματικός admin ΑΥΤΟΥ του tenant (μέσω
  // tenant_admins). Ελέγχεται εδώ (όχι μέσα στο EditCoverImageDialog) ώστε
  // να περάσει και στα child routes μέσω Outlet context — το ίδιο isAdmin
  // αποφασίζει και για το μολύβι του bio, στο InfoRoute.jsx.
  const { data: isAdmin } = useIsTenantAdmin(tenant?.id, isLoggedIn ? user?.id : null)
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
      <div className="relative">
        <img
          alt=""
          src={tenantCover}
          className="h-32 w-full rounded-b-2xl object-cover object-[50%_35%] sm:h-64 sm:w-2/3 sm:mx-auto"
        />
        {isAdmin && <EditCoverImageDialog tenantId={tenant?.id} currentUrl={settings?.cover_image_url} />}
      </div>

      <div className="mx-auto max-w-md px-4 sm:max-w-2xl">
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <div className="relative shrink-0">
            <img
              alt=""
              src={tenantLogo}
              className="size-24 rounded-full ring-4 ring-white sm:size-32"
            />
            {isAdmin && <EditLogoImageDialog tenantId={tenant?.id} currentUrl={settings?.logo_url} />}
          </div>

          {/* flex-wrap safety net (14/9, μέρος του ίδιου responsive fix
              παραπάνω): σε πολύ στενές οθόνες (~360px) το follow button +
              τα 3 εικονίδια (search/αγαπημένα/καλάθι) μαζί δεν χωράνε σε
              μία γραμμή — πριν αυτό προκαλούσε οριζόντιο overflow (και άρα
              zoom-out σε όλη τη σελίδα). Με flex-wrap, αν ποτέ δεν χωρέσει,
              περνάει απλά σε δεύτερη γραμμή αντί να ξεχειλίζει την οθόνη. */}
          <div className="mb-1 flex flex-1 flex-wrap items-center gap-3 gap-y-2">
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

        {/* border-b κάτω από τα tabs (14/9, ρητό αίτημα χρήστη) — μια απλή
            γραμμή που ξεχωρίζει οπτικά πού τελειώνουν τα κουμπιά
            Πληροφορίες/Εκδηλώσεις/Merch Store και πού ξεκινάει το
            περιεχόμενο της κάθε καρτέλας από κάτω.
            grid grid-cols-3 (14/9, bug fix — ρητή αναφορά χρήστη: "σε
            κινητό με 360px πλάτος φαίνεται μικρότερο και έχει κενό"):
            πριν ήταν flex με shrink-0 (default του Button) + whitespace-
            nowrap + px-4 σταθερό — τα 3 pill buttons μαζί ξεπερνούσαν τα
            ~328px διαθέσιμου πλάτους σε στενά κινητά (το "Merch Store"
            έκοβε κυριολεκτικά έξω από την οθόνη). Αυτό έκανε ΟΛΗ τη
            σελίδα πλατύτερη από το viewport, οπότε το κινητό zoom-out-άρει
            αυτόματα ΟΛΟΚΛΗΡΗ τη σελίδα για να χωρέσει — απ' αυτό η
            εντύπωση "όλο το site φαίνεται μικρότερο + κενό στο πλάι".
            Grid 3 ίσων στηλών εγγυάται ότι ΠΟΤΕ δεν ξεπερνάνε το πλάτος
            του container, ό,τι μήκος κειμένου κι αν έχουν. */}
        <div className="mt-6 grid grid-cols-3 items-center gap-1.5 border-b border-gray-200 pb-4 sm:gap-2">
          {TABS.map((tab) => (
            <Button
              key={tab}
              onClick={() => handleTabClick(tab)}
              aria-pressed={activeTab === tab}
              className={
                activeTab === tab
                  ? "w-full min-w-0 truncate rounded-full bg-green-600 px-2 text-xs text-white hover:bg-green-700 sm:px-4 sm:text-sm"
                  : "w-full min-w-0 truncate rounded-full bg-white px-2 text-xs text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:px-4 sm:text-sm"
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
              // 13/9, ρητό αίτημα χρήστη: αν ο admin δεν ανεβάσει εικόνα σε
              // ένα event, να μπαίνει default το cover image του tenant —
              // βλ. EventFormPage.jsx. Ήδη φορτωμένο εδώ (settings), καμία
              // επιπλέον κλήση.
              coverImageUrl: settings?.cover_image_url,
              isAdmin,
            }}
          />
        </div>
      </div>

    </div>
  )
}