import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { PencilIcon } from "@heroicons/react/20/solid"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import StockBadge from "./StockBadge"
import { getTotalStock, isScheduledUnavailable } from "../../lib/stockTiers"
import { useActiveStockHolds } from "../../queries/useActiveStockHolds"
import { useNow } from "../../hooks/useNow"
import { getCategoryLabel } from "../../lib/merchCategories"
import { shareLink } from "../../lib/shareLink"
import MerchBreadcrumb from "./MerchBreadcrumb"
import SizeSelector from "./SizeSelector"
import DeleteProductDialog from "./DeleteProductDialog"
import { useProducts } from "../../queries/useProducts"
import { useCart } from "../../queries/useCart"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import { isUuid } from "../../lib/isUuid"

// Πραγματική, μοιράσιμη σελίδα προϊόντος (14/9, ρητό αίτημα χρήστη —
// "product overview για να μπορεί να το κάνει share το link"). ΞΕΧΩΡΙΣΤΗ
// από το υπάρχον "Γρήγορη αγορά" modal (ProductQuickShop/ProductModalRoute
// στο merch/product/:productId, που μένει ακριβώς όπως είναι). Flat sibling
// route, ίδιο μοτίβο με merch/order/:orderId — αντικαθιστά εντελώς το grid
// αντί να κάθεται από πάνω του (βλ. main.jsx). Το κλικ πάνω σε ΟΛΟΚΛΗΡΗ την
// κάρτα προϊόντος στο ProductList.jsx (όχι μόνο τη φωτογραφία, 15/9) οδηγεί
// πλέον εδώ.
export default function ProductOverviewRoute() {
  const { productId } = useParams()
  const context = useOutletContext()
  const navigate = useNavigate()
  // 15/9, ρητή αναφορά χρήστη: αν ήρθες εδώ πατώντας πάνω σε μια κάρτα μέσα
  // από μια λίστα κατηγορίας (π.χ. "New Arrivals"), το breadcrumb πρέπει να
  // θυμάται ΑΥΤΗ τη διαδρομή — όχι να ξαναϋπολογίζει την "πραγματική"
  // (στατική) κατηγορία του προϊόντος, που μπορεί να είναι διαφορετική
  // (ένα ρούχο ανήκει ΚΑΙ στο "Ρουχισμός" ΚΑΙ ενδεχομένως στο "New
  // Arrivals" ταυτόχρονα). Περνάει μέσω router state από το ProductList.jsx
  // (state, ΟΧΙ query param — έτσι ένα μοιρασμένο/direct link ΔΕΝ το έχει,
  // και σωστά πέφτει πίσω στην πραγματική κατηγορία, βλ. categoryLabel/
  // categoryLinkTo παρακάτω).
  const location = useLocation()
  const { data: products, isLoading } = useProducts(context.tenantId)
  const { data: favoriteIds = [] } = useFavorites(context.fanId, context.tenantId)
  const toggleFavorite = useToggleFavorite(context.fanId)
  // 15/9, bug: ο fan μπορούσε να βάλει π.χ. 20 τεμάχια στο καλάθι ενώ
  // υπήρχαν μόνο 15 διαθέσιμα — το + δεν είχε ΚΑΝΕΝΑ όριο. Στο backend το
  // create_order_from_cart RPC ΗΔΗ αποτρέπει πραγματικό overselling (atomic
  // check στο checkout) — άρα ποτέ δεν κινδύνευσε πραγματικό stock — αλλά ο
  // fan έβλεπε λάθος/παραπλανητικό UI μέχρι να σκάσει σφάλμα στο checkout.
  // Fix: διαβάζουμε το καλάθι εδώ και υπολογίζουμε πόσο ΑΚΟΜΑ χωράει να
  // προστεθεί (stock_quantity μείον ό,τι ήδη έχει ο fan στο καλάθι), και
  // κόβουμε το stepper/"Προσθήκη" εκεί.
  const { items: cartItems } = useCart(context.fanId, context.tenantId)
  // 19/9, ρητό αίτημα χρήστη: "Μη διαθέσιμο" (ενεργό hold, προσωρινό) αντί
  // για "Εξαντλημένο" (πραγματικό/μόνιμο μηδέν) — βλ. lib/stockTiers.js.
  const { heldVariantIds, heldProductIds } = useActiveStockHolds(context.tenantId)
  useNow(20000) // βλ. hooks/useNow.js -- αναγκάζει re-render ώστε το isScheduledUnavailable() να ξαναδιαβάζει το ρολόι, μηδενικό extra network/DB κόστος

  // 15/9, ρητό αίτημα χρήστη (screenshots 2-4): αντί για ΕΝΑ επιλεγμένο
  // μέγεθος + μία κοινή ποσότητα, ο fan μπορεί τώρα να βάλει ποσότητα σε
  // ΠΟΛΛΑΠΛΑ μεγέθη ταυτόχρονα (π.χ. 2 Small ΚΑΙ 1 Medium στο ίδιο visit) —
  // variantId -> ποσότητα. Για προϊόντα ΧΩΡΙΣ μεγέθη (music/other, ή
  // clothing χωρίς backfill ακόμα) χρησιμοποιείται η παλιά, απλή ποσότητα.
  const [quantities, setQuantities] = useState({})
  // 19/9, ρητό αίτημα χρήστη: default 0 (όχι 1) — "Προσθήκη στο καλάθι"/
  // "Ολοκλήρωση παραγγελίας" ξεκινούν ανενεργά μέχρι να βάλει ο fan έστω 1,
  // ίδιο μοτίβο με το μέγεθος στα ρούχα ΚΑΙ με το ProductQuickShop.jsx.
  const [simpleQuantity, setSimpleQuantity] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 pb-24 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-8 flex flex-col gap-3 lg:mt-0">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Δέχεται είτε UUID είτε slug — ίδιο pattern με ProductModalRoute.jsx.
  const product = products?.find((p) =>
    isUuid(productId) ? p.id === productId : p.slug === productId
  )

  // Σπασμένο/παλιό link (π.χ. προϊόν που αποσύρθηκε): γύρνα στο merch grid.
  if (!product) return <Navigate to="/merch" replace />

  const isFavorited = favoriteIds.includes(product.id)

  // 15/9: stock ανά μέγεθος (product_variants). hasVariants: μόνο clothing
  // ΜΕ πραγματικές γραμμές variants μπαίνει στο νέο, multi-size flow —
  // clothing χωρίς backfill ακόμα πέφτει πίσω στο παλιό, αθροιστικό
  // behavior (SizeSelector δείχνει ρητά "δεν υπάρχουν ακόμα μεγέθη").
  const hasVariants = Boolean(product.product_variants?.length)

  // Ανά variant: πόσο ΑΚΟΜΑ χωράει να προστεθεί (stock_quantity ΤΟΥ
  // ΣΥΓΚΕΚΡΙΜΕΝΟΥ μεγέθους μείον ό,τι ήδη έχει ο fan στο καλάθι για ΑΥΤΟ το
  // μέγεθος) — ΟΧΙ το αθροιστικό product.stock_quantity, αλλιώς θα
  // επέτρεπε π.χ. 8 Small ενώ υπάρχουν μόνο 2 Small σε προϊόν με σύνολο 15
  // σε όλα τα μεγέθη μαζί.
  // 20/9, ρητό αίτημα χρήστη: όσο products.available_from είναι στο
  // μέλλον, το πραγματικό stock υπάρχει ήδη στη βάση αλλά ΔΕΝ μπορεί να
  // προστεθεί στο καλάθι ακόμα -- το "πόσο χωράει" μηδενίζεται εδώ, στο
  // ΙΔΙΟ σημείο που ήδη υπολογίζει το πραγματικό όριο (καμία διπλή
  // λογική). Η ένδειξη ("Διαθέσιμο από ...") έρχεται από το StockBadge/
  // SizeSelector παρακάτω, βλ. lib/stockTiers.js.
  const isScheduled = isScheduledUnavailable(product)

  const maxByVariant = {}
  if (hasVariants) {
    for (const variant of product.product_variants) {
      const existingCartQty =
        cartItems.find((i) => i.product.id === product.id && i.variant?.id === variant.id)
          ?.quantity ?? 0
      maxByVariant[variant.id] = isScheduled ? 0 : Math.max(0, variant.stock_quantity - existingCartQty)
    }
  }

  const selectedEntries = Object.entries(quantities).filter(([, qty]) => qty > 0)
  const hasSizeSelection = selectedEntries.length > 0

  // Προϊόντα ΧΩΡΙΣ μεγέθη (music/other, ή clothing χωρίς backfill): ίδιο
  // παλιό, απλό stepper όπως πριν.
  const simpleExistingCartQty = !hasVariants
    ? (cartItems.find((i) => i.product.id === product.id && !i.variant)?.quantity ?? 0)
    : 0
  const simpleMaxAddable = !hasVariants
    ? isScheduled
      ? 0
      : product.stock_quantity != null
        ? Math.max(0, product.stock_quantity - simpleExistingCartQty)
        : Infinity
    : 0
  const effectiveSimpleQuantity = Math.min(simpleQuantity, Math.max(0, simpleMaxAddable))
  const isSoldOut = !hasVariants && simpleMaxAddable <= 0
  // 19/9: πρέπει ΚΑΙ να υπάρχει stock ΚΑΙ ο fan να έχει βάλει ποσότητα > 0
  // — πριν εξαρτιόταν μόνο από το stock, οπότε με default ποσότητα 1 τα
  // κουμπιά ήταν ενεργά αμέσως μόλις φόρτωνε η σελίδα.
  const simpleCanAdd = !hasVariants && effectiveSimpleQuantity > 0

  const canAddToCart = hasVariants ? hasSizeSelection : simpleCanAdd

  // 15/9: πλέον από κοινό σημείο αλήθειας (lib/merchCategories.js) — πριν
  // υπήρχε ξεχωριστό, ασύμφωνο αντίγραφο εδώ ("Μουσική" ενώ η σελίδα
  // κατηγορίας λέει "CD & Βινύλια" για το ίδιο category, ρητή αναφορά χρήστη).
  // 15/9: αν υπάρχει "από πού ήρθες" στο router state, χρησιμοποίησε ΑΥΤΟ
  // (π.χ. "New Arrivals") — αλλιώς fallback στην πραγματική κατηγορία του
  // προϊόντος (π.χ. "Ρουχισμός"), όπως πριν. Direct/μοιρασμένο link δεν
  // έχει state, άρα πάντα σωστά πέφτει στο fallback.
  const categoryLabel = location.state?.fromCategoryLabel ?? getCategoryLabel(product.category)
  const categoryLinkTo = location.state?.fromCategoryKey
    ? `/merch/category/${location.state.fromCategoryKey}`
    : `/merch/category/${product.category}`
  const galleryImages = product.image_urls?.length ? product.image_urls : [null]

  // 16/9: η λογική κοινοποίησης μετακόμισε στο κοινό lib/shareLink.js
  // (χρησιμοποιείται πλέον ΚΑΙ από τις κάρτες προϊόντων στο ProductList.jsx)
  // — εδώ μένει μόνο το URL της τρέχουσας σελίδας.
  function handleShare() {
    shareLink({ url: window.location.href, title: product.name })
  }

  function handleToggleFavorite() {
    if (!context.isLoggedIn) {
      context.onRequireAuth()
      return
    }
    toggleFavorite.mutate({
      productId: product.id,
      isFavorited,
      price: product.price,
      tenantId: context.tenantId,
    })
  }

  function handleChangeQuantity(variantId, newQty) {
    setQuantities((prev) => ({ ...prev, [variantId]: newQty }))
  }

  // Προσθέτει στο καλάθι ΟΛΑ τα επιλεγμένα μεγέθη/ποσότητες μαζί (ή την
  // απλή ποσότητα, για προϊόν χωρίς μεγέθη) — μία σειριακή αλυσίδα awaits
  // (context.onAddToCart είναι πλέον mutateAsync, βλ. useCart.js/Header.jsx),
  // ΟΧΙ παράλληλα, ώστε το "existing row" matching μέσα στο useCart.addItem
  // να μη χάσει ενημερώσεις μεταξύ δύο ταυτόχρονων κλήσεων.
  async function addSelectionsToCart() {
    if (hasVariants) {
      for (const [variantId, qty] of selectedEntries) {
        await context.onAddToCart(product, qty, variantId)
      }
      setQuantities({})
    } else {
      await context.onAddToCart(product, effectiveSimpleQuantity, null)
      setSimpleQuantity(1)
    }
  }

  async function handleAddToCart() {
    // Δημόσιο URL — δέχεται και αποσυνδεδεμένο επισκέπτη από κοινοποιημένο
    // link, ίδιο μοτίβο με ProductQuickShop.jsx.
    if (!context.isLoggedIn) {
      context.onRequireAuth()
      return
    }
    if (!canAddToCart || isProcessing) return
    setIsProcessing(true)
    try {
      await addSelectionsToCart()
      toast.success("Προστέθηκε στο καλάθι.")
    } catch {
      toast.error("Κάτι πήγε στραβά με την προσθήκη στο καλάθι. Δοκίμασε ξανά.")
    } finally {
      setIsProcessing(false)
    }
  }

  // 15/9, ρητό αίτημα χρήστη: "Ολοκλήρωση παραγγελίας" δίπλα στο "Προσθήκη
  // στο καλάθι" — προσθέτει την επιλογή στο καλάθι ΚΑΙ πάει στη σελίδα
  // ΟΛΟΚΛΗΡΟΥ του καλαθιού (merch/cart, CartRoute.jsx — βάσει reference
  // component που έδωσε ο χρήστης), ΟΧΙ κατευθείαν σε νέα order· το
  // πραγματικό checkout (useCreateOrder) γίνεται ΕΚΕΙ, όχι εδώ.
  async function handleCompleteOrder() {
    if (!context.isLoggedIn) {
      context.onRequireAuth()
      return
    }
    if (!canAddToCart || isProcessing) return
    setIsProcessing(true)
    try {
      await addSelectionsToCart()
      navigate("/merch/cart")
    } catch {
      toast.error("Κάτι πήγε στραβά με την προσθήκη στο καλάθι. Δοκίμασε ξανά.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* 15/9, ρητό αίτημα χρήστη: το breadcrumb πάει ΕΔΩ πλέον, ΠΡΙΝ από το
          bg-white div της σελίδας — ίδιο μοτίβο "sibling πριν από το
          root div" με όλες τις σελίδες merch πλέον (βλ. MerchBreadcrumb.jsx
          για sticky/κεντράρισμα). Ο "mt-6" wrapper του Outlet (Header.jsx)
          παραμένει το sticky containing block, τόσο ψηλός όσο ΟΛΗ η σελίδα
          — καμία αλλαγή στο sticky fix της ίδιας μέρας, απλά το breadcrumb
          δεν είναι πια εμφωλευμένο μέσα στο δικό της max-w-5xl div. */}
      <MerchBreadcrumb
        crumbs={[
          { label: "Merch Store", to: "/merch" },
          { label: categoryLabel, to: categoryLinkTo },
          { label: product.name, to: `/merch/overview/${product.slug}` },
        ]}
      />

      <div className="bg-white pt-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Gallery — πραγματικές φωτογραφίες του προϊόντος (image_urls),
              όχι placeholder. Η πρώτη πιάνει διπλό πλάτος σε desktop, ίδια
              λογική με το reference design του χρήστη. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {galleryImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${product.name} φωτογραφία ${i + 1}`}
                className={
                  i === 0
                    ? "aspect-square w-full rounded-lg bg-gray-100 object-cover sm:col-span-2"
                    : "aspect-square w-full rounded-lg bg-gray-100 object-cover"
                }
              />
            ))}
          </div>

          {/* Details */}
          <div className="mt-8 lg:mt-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-heading text-xl font-medium text-gray-900">{product.name}</h1>
              <p className="shrink-0 text-xl font-medium text-gray-900">
                {Number(product.price).toFixed(2)}€
              </p>
            </div>

            {/* 15/9, ρητό αίτημα χρήστη: εδώ (μέσα στη σελίδα προϊόντος) ο
                ακριβής αριθμός ΠΑΡΑΜΕΝΕΙ — αφαιρέθηκε ΜΟΝΟ από την κάρτα του
                grid (βλ. ProductList.jsx, showCount={false}). */}
            <StockBadge
              quantity={getTotalStock(product)}
              className="mt-3"
              hasActiveHold={heldProductIds.has(product.id)}
              scheduledFrom={product.available_from}
            />

            {product.description && (
              <p className="mt-4 text-sm/6 text-gray-600">{product.description}</p>
            )}

            {/* 15/9: κάθε γραμμή μεγέθους έχει πλέον ΤΗ ΔΙΚΗ ΤΗΣ ποσότητα
                (βλ. SizeSelector.jsx) — ο fan μπορεί να επιλέξει πολλαπλά
                μεγέθη μαζί, χωρίς ξεχωριστό "Ποσότητα" section από κάτω. */}
            {/* 19/9, ρητό αίτημα χρήστη, δύο γύροι: αρχικά είχε μπει
                bg-gray-50 ΜΟΝΟ γύρω από αυτό το fieldset — μετά ζητήθηκε
                ολόκληρη η σελίδα να έχει το γκρι πλαίσιο (βλ. το
                rounded-2xl bg-gray-50 λίγο πιο πάνω, γύρω από ΟΛΟ το
                περιεχόμενο). Άρα εδώ πλέον bg-white αντί για bg-gray-50 —
                "λευκή κάρτα πάνω σε γκρι πλαίσιο", ίδιο μοτίβο/ίδια σκιά
                (shadow-2xl) με τις κάρτες προϊόντων (ProductList.jsx) —
                αλλιώς θα ήταν γκρι μέσα σε γκρι, αόρατο περίγραμμα. */}
            {product.category === "clothing" && (
              <fieldset
                aria-label="Επιλογή μεγέθους"
                className="mt-6 rounded-lg bg-white p-3 shadow-2xl sm:p-4"
              >
                <div className="text-sm font-medium text-gray-900">Μέγεθος</div>
                <SizeSelector
                  variants={product.product_variants}
                  quantities={quantities}
                  maxByVariant={maxByVariant}
                  onChangeQuantity={handleChangeQuantity}
                  heldVariantIds={heldVariantIds}
                  scheduledFrom={product.available_from}
                />
                {hasVariants && !hasSizeSelection && (
                  <p className="mt-2 text-xs text-gray-500">
                    Επίλεξε μέγεθος και ποσότητα για να προσθέσεις στο καλάθι.
                  </p>
                )}
              </fieldset>
            )}

            {/* Προϊόντα χωρίς μεγέθη (music/other, ή clothing χωρίς backfill
                ακόμα): παλιό, απλό stepper. */}
            {!hasVariants && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSimpleQuantity((q) => Math.max(0, q - 1))}
                    disabled={isSoldOut || effectiveSimpleQuantity <= 0}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {effectiveSimpleQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSimpleQuantity((q) => Math.min(q + 1, simpleMaxAddable))}
                    disabled={effectiveSimpleQuantity >= simpleMaxAddable}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                {isSoldOut && simpleExistingCartQty > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Έχεις ήδη όλη τη διαθέσιμη ποσότητα στο καλάθι σου.
                  </p>
                )}
                {simpleCanAdd && simpleExistingCartQty > 0 && Number.isFinite(simpleMaxAddable) && (
                  <p className="mt-1 text-xs text-gray-500">
                    {simpleExistingCartQty} ήδη στο καλάθι σου — μέγιστο ακόμα {simpleMaxAddable}.
                  </p>
                )}
                {!isSoldOut && effectiveSimpleQuantity === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Επίλεξε ποσότητα για να συνεχίσεις.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
        </div>

          {/* 19/9, ρητό αίτημα χρήστη (screenshot): τα κουμπιά ενέργειας
              βγαίνουν πλέον ΕΞΩ από το γκρι πλαίσιο (rounded-2xl bg-gray-50
              πιο πάνω) — ίδιο μοτίβο με το κουμπί "Πληρωμή" στο
              ProductQuickShop.jsx, που είναι sibling ΕΞΩ από το λευκό Card,
              όχι εμφωλευμένο μέσα του. */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!canAddToCart || isProcessing}
              >
                Προσθήκη στο καλάθι
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
                aria-label={isFavorited ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}
              >
                {isFavorited ? (
                  <HeartIconSolid className="size-5 text-red-500" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleShare}
                aria-label="Κοινοποίηση συνδέσμου"
              >
                <ShareIcon className="size-5" />
              </Button>
              {/* 20/9, ρητό αίτημα χρήστη — επεξεργασία/διαγραφή ΚΑΙ από την
                  ίδια τη σελίδα του προϊόντος (όχι μόνο από την κάρτα στο
                  grid, βλ. ProductList.jsx), ΜΟΝΟ για πραγματικούς tenant
                  admins. Ίδιο "outline icon button" στυλ με τα favorite/share
                  διπλανά, ώστε να μη ξεχωρίζει σαν ξένο σώμα σε αυτή τη
                  σειρά — αυτό ζήτησε ρητά ο χρήστης ("style όπως αυτό που
                  έχουμε στο product"). */}
              {context.isAdmin && (
                <>
                  <Button type="button" variant="outline" size="icon" asChild>
                    <Link
                      to={`/merch/product/${product.slug}/edit`}
                      aria-label="Επεξεργασία προϊόντος"
                    >
                      <PencilIcon className="size-5" />
                    </Link>
                  </Button>
                  <DeleteProductDialog product={product} tenantId={context.tenantId} />
                </>
              )}
            </div>
            {/* 15/9, ρητό αίτημα χρήστη (screenshot 5): "Ολοκλήρωση
                παραγγελίας" δίπλα στην ήδη υπάρχουσα σειρά — προσθέτει την
                επιλογή στο καλάθι ΚΑΙ πάει κατευθείαν στη συνολική
                παραγγελία. */}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleCompleteOrder}
              disabled={!canAddToCart || isProcessing}
            >
              Ολοκλήρωση παραγγελίας
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
