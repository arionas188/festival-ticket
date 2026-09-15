import { useState } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "../../queries/useCart"
import { useCreateOrder } from "../../queries/useCreateOrder"
import { checkoutErrorMessage } from "../../lib/checkoutErrors"
import MerchBreadcrumb from "./MerchBreadcrumb"

// 15/9, ρητό αίτημα χρήστη ("άλλο component που θα έχει τη συνολική
// παραγγελία" — το έδωσε ο ίδιος ως reference Tailwind UI "Shopping Cart"
// page). Πραγματική, μοιράσιμη σελίδα ΚΑΛΑΘΙΟΥ (ολόκληρου, όλων των
// προϊόντων — ΟΧΙ μόνο του ενός από όπου ήρθε ο fan), flat sibling ίδιο
// μοτίβο με merch/order/:orderId / merch/overview/:productId. Προσαρμογές
// πάνω στο reference του χρήστη, με βάση την ήδη υπάρχουσα λογική του
// project:
//  - Το fake `products` array αντικαταστάθηκε με πραγματικά δεδομένα
//    (useCart, ίδιο hook με το CartDialog.jsx).
//  - Το `<select>` dropdown ποσότητας αντικαταστάθηκε με το ήδη υπάρχον
//    −/ποσότητα/+ stepper (ίδιο pattern παντού στο project — SizeSelector,
//    CartDialog, ProductOverviewRoute), κομμένο στο πραγματικό stock ανά
//    variant/προϊόν, ΟΧΙ ελεύθερο 1-8.
//  - Shipping/Tax estimate αφαιρέθηκαν εντελώς — δεν υπάρχει shipping ή
//    φόρος μοντελοποιημένος πουθενά στο project σήμερα, θα ήταν fake
//    αριθμοί χωρίς αντίκρισμα.
//  - "In stock / Ships in X weeks" αφαιρέθηκε — αντικαταστάθηκε με το ήδη
//    υπάρχον μήνυμα ορίου ("Έχεις ήδη όλη τη διαθέσιμη ποσότητα"), ίδιο με
//    το CartDialog.jsx.
//  - Το "Checkout" submit καλεί το ΗΔΗ υπάρχον useCreateOrder RPC και πάει
//    στο merch/order/:orderId (10λεπτο hold + countdown, βλ.
//    OrderSummaryRoute.jsx) — ΔΕΝ ξαναφτιάχνει τη λογική δέσμευσης stock.
//
// ΣΗΜΕΙΩΣΗ προς τον χρήστη: το εικονίδιο καλαθιού στο header ΣΥΝΕΧΙΖΕΙ να
// ανοίγει το μικρό CartDialog.jsx (δεν το άγγιξα, δεν ζητήθηκε) — τώρα
// υπάρχουν δύο τρόποι να δεις/επεξεργαστείς το καλάθι σου (dialog + αυτή η
// σελίδα). Πες μου αν θες το εικονίδιο να στέλνει εδώ αντί να ανοίγει το
// dialog.
export default function CartRoute() {
  const { fanId, tenantId, isLoggedIn, onRequireAuth } = useOutletContext()
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart, subtotal, isLoading } = useCart(
    fanId,
    tenantId
  )
  const createOrder = useCreateOrder(fanId, tenantId)
  const [checkoutError, setCheckoutError] = useState(null)

  function handleCheckout(e) {
    e.preventDefault()
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    setCheckoutError(null)
    createOrder.mutate(undefined, {
      onSuccess: (orderId) => navigate(`/merch/order/${orderId}`),
      onError: (error) => setCheckoutError(checkoutErrorMessage(error)),
    })
  }

  // 15/9, ίδιο bulk-clear με το CartDialog.jsx (πρόσθεσα εκεί νωρίτερα
  // σήμερα) — window.confirm επίτηδες, καταστροφική/μη αναστρέψιμη ενέργεια.
  function handleClearCart() {
    if (window.confirm("Να αδειάσει όλο το καλάθι σου;")) {
      clearCart()
    }
  }

  return (
    <>
      {/* 15/9, ρητό αίτημα χρήστη: το breadcrumb πάει ΕΔΩ πλέον, ΠΡΙΝ από
          το bg-white div — ίδιο μοτίβο "sibling πριν από το root div" με
          όλες τις σελίδες merch πλέον (βλ. MerchBreadcrumb.jsx για
          sticky/κεντράρισμα). Το "Καλάθι" παραμένει πραγματικό (self-)link,
          όχι plain text — ρητό αίτημα χρήστη, ίδιος κανόνας παντού: κάθε
          crumb clickable, ακόμα και το τρέχον. */}
      <MerchBreadcrumb
        crumbs={[
          { label: "Merch Store", to: "/merch" },
          { label: "Καλάθι", to: "/merch/cart" },
        ]}
      />

      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Το καλάθι σου
        </h1>

        {isLoading ? (
          <div className="mt-12 flex flex-col gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-24 shrink-0 rounded-md sm:size-48" />
                <div className="flex-1 space-y-2 pt-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !isLoggedIn ? (
          <div className="mt-12 flex flex-col items-start gap-3">
            <p className="text-sm text-gray-500">Συνδέσου για να δεις το καλάθι σου.</p>
            <Button type="button" onClick={onRequireAuth}>
              Σύνδεση
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 flex flex-col items-start gap-3">
            <p className="text-sm text-gray-500">Το καλάθι σου είναι άδειο.</p>
            <Button asChild variant="outline">
              <Link to="/merch">Συνέχεια αγορών</Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
          >
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <div className="flex items-center justify-between">
                <h2 id="cart-heading" className="sr-only">
                  Προϊόντα στο καλάθι σου
                </h2>
                <span />
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs font-medium text-gray-500 hover:text-red-600"
                >
                  Άδειασμα καλαθιού
                </button>
              </div>

              <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map(({ id: cartItemId, product, quantity, variant }) => {
                  // 15/9: ίδια λογική ορίου με CartDialog.jsx — το σωστό όριο
                  // είναι του variant όταν υπάρχει, ΟΧΙ το αθροιστικό
                  // product.stock_quantity.
                  const stockLimit = variant ? variant.stock_quantity : product.stock_quantity
                  const atLimit = stockLimit != null && quantity >= stockLimit

                  return (
                    <li key={cartItemId} className="flex py-6 sm:py-10">
                      <div className="shrink-0">
                        <img
                          alt={product.name}
                          src={product.image_urls?.[0]}
                          className="size-24 rounded-md object-cover sm:size-48"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <span className="font-medium text-gray-700">{product.name}</span>
                              </h3>
                            </div>
                            {variant && (
                              <p className="mt-1 text-sm text-gray-500">Μέγεθος {variant.size}</p>
                            )}
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {Number(product.price).toFixed(2)}€
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, -1)}
                                className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, 1)}
                                disabled={atLimit}
                                className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            {atLimit && (
                              <p className="mt-1 text-xs text-gray-500">
                                Έχεις ήδη όλη τη διαθέσιμη ποσότητα ({stockLimit}).
                              </p>
                            )}

                            <div className="absolute top-0 right-0">
                              <button
                                type="button"
                                onClick={() => removeItem(cartItemId)}
                                className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500"
                              >
                                <span className="sr-only">Αφαίρεση</span>
                                <TrashIcon aria-hidden="true" className="size-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                Σύνοψη παραγγελίας
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                  <dt className="text-base font-medium text-gray-900">Σύνολο</dt>
                  <dd className="text-base font-medium text-gray-900">{subtotal.toFixed(2)}€</dd>
                </div>
              </dl>

              {checkoutError && (
                <p className="mt-4 text-sm text-destructive">{checkoutError}</p>
              )}

              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={createOrder.isPending}>
                  {createOrder.isPending ? "Επεξεργασία..." : "Ολοκλήρωση παραγγελίας"}
                </Button>
              </div>
            </section>
          </form>
        )}
      </div>
    </div>
    </>
  )
}
