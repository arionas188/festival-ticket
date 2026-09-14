import { useState } from "react"
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom"
import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import StockBadge from "./StockBadge"
import { getTotalStock } from "../../lib/stockTiers"
import SizeSelector from "./SizeSelector"
import { useProducts } from "../../queries/useProducts"
import { useCart } from "../../queries/useCart"
import { useFavorites, useToggleFavorite } from "../../queries/useFavorites"
import { isUuid } from "../../lib/isUuid"

// Πραγματική, μοιράσιμη σελίδα προϊόντος (14/9, ρητό αίτημα χρήστη —
// "product overview για να μπορεί να το κάνει share το link"). ΞΕΧΩΡΙΣΤΗ
// από το υπάρχον "Γρήγορη αγορά" modal (ProductQuickShop/ProductModalRoute
// στο merch/product/:productId, που μένει ακριβώς όπως είναι). Flat sibling
// route, ίδιο μοτίβο με merch/order/:orderId — αντικαθιστά εντελώς το grid
// αντί να κάθεται από πάνω του (βλ. main.jsx). Το κλικ πάνω στη φωτογραφία
// προϊόντος στο ProductList.jsx οδηγεί πλέον εδώ αντί για το παλιό
// photo-only ProductGallery modal.
export default function ProductOverviewRoute() {
  const { productId } = useParams()
  const context = useOutletContext()
  const { data: products, isLoading } = useProducts(context.tenantId)
  const { data: favoriteIds = [] } = useFavorites(context.fanId, context.tenantId)
  const toggleFavorite = useToggleFavorite(context.fanId)
  // 15/9, bug: ο fan μπορούσε να βάλει π.χ. 20 τεμάχια στο καλάθι ενώ
  // υπήρχαν μόνο 15 διαθέσιμα — το + δεν είχε ΚΑΝΕΝΑ όριο. Στο backend το
  // create_order_from_cart RPC ΗΔΗ αποτρέπει πραγματικό overselling (atomic
  // check στο checkout) — άρα ποτέ δεν κινδύνευσε πραγματικό stock — αλλά ο
  // fan έβλεπε λάθος/παραπλανητικό UI μέχρι να σκάσει σφάλμα στο checkout.
  // Fix: διαβάζουμε το καλάθι εδώ και υπολογίζουμε πόσο ΑΚΟΜΑ χωράει να
  // προστεθεί (stock_quantity μείον ό,τι ήδη έχει ο fan στο καλάθι για ΑΥΤΟ
  // το προϊόν), και κόβουμε το stepper/"Προσθήκη" εκεί.
  const { items: cartItems } = useCart(context.fanId, context.tenantId)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState(null)

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

  // 15/9: stock ανά μέγεθος (product_variants, βλ. migration 20260915120000).
  // requiresSizeSelection: μόνο clothing ΜΕ πραγματικές γραμμές variants —
  // clothing χωρίς backfill ακόμα πέφτει πίσω στο παλιό, αθροιστικό
  // behavior (SizeSelector δείχνει ρητά "δεν υπάρχουν ακόμα μεγέθη").
  const hasVariants = Boolean(product.product_variants?.length)
  const requiresSizeSelection = product.category === "clothing" && hasVariants
  const selectedVariant =
    product.product_variants?.find((v) => v.id === selectedVariantId) ?? null
  // null όταν δεν χρειάζεται μέγεθος καθόλου — ίδιο behavior με πριν.
  const cartVariantId = requiresSizeSelection ? selectedVariantId : null
  const needsSizePick = requiresSizeSelection && !selectedVariantId

  // stock_quantity: το ίδιο πεδίο που χρησιμοποιεί ήδη το create_order_from_cart
  // RPC για το atomic reservation στο checkout. null/undefined (π.χ. προϊόν
  // χωρίς tracked stock) δεν μπλοκάρει τίποτα — Infinity. ΣΗΜΑΝΤΙΚΟ: το όριο
  // εδώ είναι του ΕΠΙΛΕΓΜΕΝΟΥ μεγέθους όταν υπάρχει, ΟΧΙ το αθροιστικό
  // product.stock_quantity — αλλιώς θα επέτρεπε π.χ. 8 Small ενώ υπάρχουν
  // μόνο 2 Small σε ένα προϊόν με σύνολο 15 σε όλα τα μεγέθη μαζί.
  const stockForCap = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
  const existingCartQty =
    cartItems.find(
      (i) => i.product.id === product.id && (i.variant?.id ?? null) === cartVariantId
    )?.quantity ?? 0
  const maxAddable = needsSizePick
    ? 0
    : stockForCap != null
      ? Math.max(0, stockForCap - existingCartQty)
      : Infinity
  const canAddToCart = !needsSizePick && maxAddable > 0
  // Το stepper δεν μπορεί ποτέ να δείξει/στείλει περισσότερο από maxAddable —
  // ΑΥΤΟ ήταν το bug (πριν δεν υπήρχε κανένα όριο).
  const effectiveQuantity = Math.min(quantity, Math.max(1, maxAddable))
  // Ίδιο mapping με ProductList.jsx — για συνέπεια, όχι νέα κατηγοριοποίηση.
  const categoryLabel =
    product.category === "clothing"
      ? "Ρουχισμός"
      : product.category === "music"
        ? "Μουσική"
        : "Διάφορα"
  const galleryImages = product.image_urls?.length ? product.image_urls : [null]

  // Legacy fallback αντιγραφής (document.execCommand) — χρειάζεται γιατί το
  // navigator.clipboard υπάρχει ΜΟΝΟ σε "secure context" (https, ή localhost).
  // Σε plain http (π.χ. τοπικό dev server πάνω σε http://<subdomain>:5173)
  // το navigator.clipboard είναι undefined και ΣΚΑΕΙ αν το καλέσουμε απευθείας
  // — αυτό ήταν το bug. execCommand είναι deprecated αλλά δουλεύει παντού,
  // ό,τι πρωτόκολλο κι αν έχει η σελίδα.
  function legacyCopy(text) {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    let ok
    try {
      ok = document.execCommand("copy")
    } catch {
      ok = false
    }
    document.body.removeChild(textarea)
    return ok
  }

  function handleShare() {
    const url = window.location.href

    if (typeof navigator.share === "function") {
      // Ο χρήστης μπορεί να ακυρώσει το native share sheet — δεν είναι σφάλμα.
      navigator.share({ title: product.name, url }).catch(() => {})
      return
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Ο σύνδεσμος αντιγράφηκε."))
        .catch(() => toast.error("Δεν ήταν δυνατή η αντιγραφή του συνδέσμου."))
      return
    }

    if (legacyCopy(url)) {
      toast.success("Ο σύνδεσμος αντιγράφηκε.")
    } else {
      toast.error("Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.")
    }
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

  function handleAddToCart() {
    // Δημόσιο URL — δέχεται και αποσυνδεδεμένο επισκέπτη από κοινοποιημένο
    // link, ίδιο μοτίβο με ProductQuickShop.jsx.
    if (!context.isLoggedIn) {
      context.onRequireAuth()
      return
    }
    if (!canAddToCart) return
    context.onAddToCart(product, effectiveQuantity, cartVariantId)
    toast.success("Προστέθηκε στο καλάθι.")
  }

  return (
    <div className="bg-white pt-6 pb-16 sm:pb-24">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ol role="list" className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/merch" className="hover:text-gray-700">
              Merch Store
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900">{categoryLabel}</li>
        </ol>
      </nav>

      <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
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

            <StockBadge quantity={getTotalStock(product)} className="mt-3" />

            {product.description && (
              <p className="mt-4 text-sm/6 text-gray-600">{product.description}</p>
            )}

            {/* 15/9: πραγματικό stock ανά μέγεθος, χρωματισμένο/disabled — βλ.
                SizeSelector.jsx (ίδιο component με το ProductQuickShop.jsx modal). */}
            {product.category === "clothing" && (
              <fieldset aria-label="Επιλογή μεγέθους" className="mt-6">
                <div className="text-sm font-medium text-gray-900">Μέγεθος</div>
                <SizeSelector
                  variants={product.product_variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />
              </fieldset>
            )}

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!canAddToCart}
                  className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{effectiveQuantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(q + 1, maxAddable))}
                  disabled={effectiveQuantity >= maxAddable}
                  className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
              {/* Ενημέρωση γιατί κόπηκε το + — όχι απλά σιωπηλό disable. */}
              {needsSizePick && (
                <p className="mt-1 text-xs text-gray-500">
                  Επίλεξε μέγεθος για να δεις τη διαθεσιμότητα.
                </p>
              )}
              {!needsSizePick && Number.isFinite(maxAddable) && existingCartQty > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {existingCartQty} ήδη στο καλάθι σου — μέγιστο ακόμα {maxAddable}.
                </p>
              )}
              {!needsSizePick && !canAddToCart && stockForCap > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Έχεις ήδη όλη τη διαθέσιμη ποσότητα στο καλάθι σου.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
