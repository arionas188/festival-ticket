import { HeartIcon, ShareIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { PencilIcon } from "@heroicons/react/20/solid"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import { useActiveStockHolds } from "../../queries/useActiveStockHolds"
import { useNow } from "../../hooks/useNow"
import StockBadge from "./StockBadge"
import DeleteProductDialog from "./DeleteProductDialog"
import { getCategoryLabel } from "../../lib/merchCategories"
import { getTotalStock } from "../../lib/stockTiers"
import { shareLink } from "../../lib/shareLink"

export default function ProductList({
  products,
  fanId,
  tenantId,
  isLoggedIn,
  onRequireAuth,
  categoryKey,
  categoryLabel,
  isAdmin = false,
}) {
  const navigate = useNavigate()
  const { data: favoriteIds = [] } = useFavorites(fanId, tenantId)
  const toggleFavorite = useToggleFavorite(fanId)
  // 19/9, ρητό αίτημα χρήστη: "Μη διαθέσιμο" (ενεργό hold, προσωρινό) αντί
  // για "Εξαντλημένο" (πραγματικό/μόνιμο μηδέν) — βλ. lib/stockTiers.js.
  const { heldProductIds } = useActiveStockHolds(tenantId)
  useNow(20000) // βλ. hooks/useNow.js -- το StockBadge scheduledFrom χρειάζεται re-render με φρέσκια ώρα

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

  // 16/9, ρητό αίτημα χρήστη ("icon share ... να μπορούν να το κάνουν
  // share instagram και παντού") — ίδια λογική με το ήδη υπάρχον κουμπί
  // κοινοποίησης στο ProductOverviewRoute.jsx (lib/shareLink.js, ένα
  // σημείο αλήθειας): σε κινητό ανοίγει το native share sheet του
  // λειτουργικού (Instagram, WhatsApp, Messages, ό,τι έχει εγκατεστημένο
  // ο χρήστης)· σε desktop αντιγράφει τον σύνδεσμο. Ο σύνδεσμος δείχνει
  // στη μοιράσιμη σελίδα προϊόντος (`/merch/overview/:slug`), ΟΧΙ στη
  // λίστα κατηγορίας — ίδιο URL που θα άνοιγε το κλικ πάνω στην κάρτα.
  function handleShare(e, product) {
    e.stopPropagation()
    shareLink({
      url: `${window.location.origin}/merch/overview/${product.slug}`,
      title: product.name,
    })
  }

  // 16/9, ρητό αίτημα χρήστη — αφαιρέθηκε το δικό του `bg-white` +
  // max-width wrapper (πριν δημιουργούσε ένα ξεχωριστό λευκό ορθογώνιο
  // πίσω από τις κάρτες, μέσα στο γκρι φόντο της σελίδας) — το max-width
  // container έρχεται πλέον απ' έξω, από το ένα ενιαίο γκρι πλαίσιο στο
  // MerchCategoryRoute.jsx. Το component επιστρέφει ΜΟΝΟ το grid.
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
      {products.map((product) => {
        const isFavorited = favoriteIds.includes(product.id)
        return (
          <Card
            key={product.id}
            // 16/9, ρητό αίτημα χρήστη — πιο έντονη σκιά ("να φαίνεται
            // σαν 3D"), τώρα που οι κάρτες επιπλέουν πάνω σε γκρι πλαίσιο
            // (πριν πάνω σε λευκό φόντο, η σκιά ξεχώριζε λιγότερο).
            className="relative cursor-pointer shadow-2xl"
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
                  onClick={(e) => handleShare(e, product)}
                  aria-label="Κοινοποίηση συνδέσμου"
                  className="absolute top-2 left-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
                >
                  <ShareIcon className="size-5 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, product.id)}
                  aria-label={isFavorited ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm hover:bg-white"
                >
                  {isFavorited ? (
                    <HeartIconSolid className="size-5 text-red-500" />
                  ) : (
                    <HeartIcon className="size-5 text-gray-700" />
                  )}
                </button>

                {/* 20/9, ρητό αίτημα χρήστη — μολύβι επεξεργασίας + κόκκινος
                    κάδος διαγραφής, ΜΟΝΟ για πραγματικούς tenant admins.
                    Κάτω-αριστερά στην εικόνα (τα share/favorite είναι πάνω),
                    ίδιο μοτίβο "grouped κουμπιά σε γωνία" με το EventsList.jsx.
                    stopPropagation και στα δύο — η κάρτα έχει δικό της onClick
                    πλοήγησης στο product overview, δεν πρέπει να πυροδοτηθεί
                    μαζί (DeleteProductDialog το κάνει ήδη μόνο του). */}
                {isAdmin && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <Link
                      to={`/merch/product/${product.slug}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      title="Επεξεργασία προϊόντος"
                      aria-label="Επεξεργασία προϊόντος"
                      className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                    </Link>
                    <DeleteProductDialog product={product} tenantId={tenantId} />
                  </div>
                )}
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

              <StockBadge
                quantity={getTotalStock(product)}
                className="mt-2"
                showCount={false}
                hasActiveHold={heldProductIds.has(product.id)}
                scheduledFrom={product.available_from}
              />

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
  )
}
