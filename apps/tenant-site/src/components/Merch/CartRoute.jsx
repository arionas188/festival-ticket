import { useState } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { cn } from "@/lib/utils"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCart } from "../../queries/useCart"
import { useCreateOrder } from "../../queries/useCreateOrder"
import { checkoutErrorMessage } from "../../lib/checkoutErrors"
import { getOrderTotals } from "../../lib/pricing"
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
  // 19/9, ρητό αίτημα χρήστη: αντί για native window.confirm, πραγματικό
  // themed modal (ίδια Dialog primitives με το CartDialog.jsx) — ρωτάει
  // ρητά πριν διαγράψει ΟΛΟ το καλάθι, καταστροφική/μη αναστρέψιμη ενέργεια.
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  // 18/9, ρητό αίτημα χρήστη: η "Σύνοψη παραγγελίας" δείχνει καθαρή αξία
  // + ΦΠΑ 24% ξεχωριστά, αντί για ένα μονολιθικό "Σύνολο" — βλ.
  // lib/pricing.js για την ακριβή λογική/γιατί. 19/9, ρητό αίτημα χρήστη:
  // η αρχική έκδοση πρόσθετε ΚΑΙ 3€ έξοδα αποστολής εδώ, αλλά αφαιρέθηκε —
  // "να μην μπερδευτούμε, θέλω ο fan να βλέπει το κανονικό ποσό, αυτό που
  // βγαίνει από τη βάση δεδομένων" (το order.subtotal στη βάση δεν είχε/
  // έχει αποστολή, βλ. migration 20260919071300 + OrderSummaryRoute.jsx).
  // shipping/grandTotal ΔΕΝ destructure-άρονται πια — getOrderTotals() τα
  // υπολογίζει ακόμα (θα χρειαστούν όταν έχουμε πραγματικό κόστος
  // αποστολής), απλά δεν εμφανίζονται εδώ.
  const { net, vat } = getOrderTotals(subtotal)

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

  // 15/9, ίδιο bulk-clear με το CartDialog.jsx. 19/9, ρητό αίτημα χρήστη:
  // το window.confirm αντικαταστάθηκε από πραγματικό modal (βλ. Dialog πιο
  // κάτω στο JSX) — αυτό εδώ πλέον απλά εκτελεί, το ίδιο το κουμπί ανοίγει
  // το modal, ΟΧΙ αυτή τη συνάρτηση κατευθείαν.
  function handleClearCart() {
    clearCart()
    setClearConfirmOpen(false)
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
          {/* 19/9, ρητό αίτημα χρήστη: ίδιο "γκρι πλαίσιο" ύφος με τις
              υπόλοιπες σελίδες merch (MerchCategoriesRoute.jsx/
              MerchCategoryRoute.jsx/ProductOverviewRoute.jsx) — αντιγραφή
              του ίδιου, ήδη καθιερωμένου pattern, όχι κάτι νέο. */}
          <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8">
            {/* 19/9, ρητό αίτημα χρήστη: κεντραρισμένος τίτλος με κάτω γραμμή,
                ίδιο μοτίβο με τον τίτλο κατηγορίας στο MerchCategoryRoute.jsx
                — συνέπεια με τις υπόλοιπες σελίδες merch. */}
            <h1 className="border-b border-gray-200 pb-4 text-center text-2xl font-bold tracking-tight text-gray-900">
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
              <h2 id="cart-heading" className="sr-only">
                Προϊόντα στο καλάθι σου
              </h2>

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
                        {/* 19/9, ρητό αίτημα χρήστη: κλικ πάνω στη φωτογραφία
                            πάει πίσω στη σελίδα του προϊόντος (ProductOverviewRoute),
                            ίδιο URL με τις κάρτες προϊόντων (ProductList.jsx). */}
                        <Link to={`/merch/overview/${product.slug}`}>
                          <img
                            alt={product.name}
                            src={product.image_urls?.[0]}
                            className="size-24 rounded-md object-cover sm:size-48"
                          />
                        </Link>
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
                              {/* 19/9, ρητό αίτημα χρήστη (screenshot 2): ίδια θέση/σειρά
                                  με το SizeSelector.jsx — το "(Ν)" ΠΡΙΝ από το stepper,
                                  όχι μετά. Ρητό αίτημα χρήστη (νέο screenshot): λέξη
                                  "Διαθεσιμότητα" μπροστά — πριν ήταν μόνο "(5)", χωρίς
                                  καμία εξήγηση τι δείχνει αυτός ο αριθμός. */}
                              {stockLimit != null && (
                                <span className="text-xs text-gray-500">
                                  Διαθεσιμότητα ({stockLimit})
                                </span>
                              )}
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
                            {/* 19/9, ρητό αίτημα χρήστη — bug: "γιατί αλλάζουν θέση
                                αυτά;": αυτό το μήνυμα πριν εμφανιζόταν/εξαφανιζόταν
                                εντελώς (conditional render), οπότε άλλαζε το ύψος
                                ΑΥΤΟΥ του <li> και ΟΛΑ τα επόμενα προϊόντα της λίστας
                                "πηδούσαν" θέση από κάτω. Fix: το μήνυμα είναι ΠΑΝΤΑ
                                στο DOM (σταθερό ύψος γραμμής), απλά γίνεται invisible
                                (καταλαμβάνει τον ίδιο χώρο, απλά δεν φαίνεται) όταν δεν
                                ισχύει — καμία μετατόπιση πια στα υπόλοιπα προϊόντα. */}
                            {stockLimit != null && (
                              <p
                                className={cn(
                                  "mt-1 text-xs text-gray-500",
                                  !atLimit && "invisible"
                                )}
                              >
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

              {/* 19/9, ρητό αίτημα χρήστη (screenshot): το "Άδειασμα
                  καλαθιού" μετακόμισε εδώ — κάτω από τη λίστα/γραμμή,
                  ΠΑΝΩ από τη "Σύνοψη παραγγελίας" — σε κυκλικό (rounded-full)
                  κόκκινο κουμπί αντί για απλό link πάνω-δεξιά, με το κάδο
                  εικονίδιο δεξιά από το κείμενο, και κεντραρισμένο (τόσο
                  το ίδιο το κουμπί μέσα στη σειρά του, όσο και το
                  περιεχόμενό του μέσα στο κουμπί). Ανοίγει modal
                  επιβεβαίωσης (βλ. Dialog πιο κάτω) αντί να αδειάζει
                  κατευθείαν το καλάθι. */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setClearConfirmOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Άδειασμα καλαθιού
                  <TrashIcon aria-hidden="true" className="size-4" />
                </button>
              </div>
            </section>

            {/* Order summary */}
            {/* 19/9: η σελίδα έγινε γκρι γύρω-γύρω (βλ. πιο πάνω) — αυτό το
                section άλλαξε από bg-gray-50 σε bg-white + shadow-2xl (λευκή
                κάρτα πάνω σε γκρι πλαίσιο, ίδιο μοτίβο με το "Μέγεθος" στο
                ProductOverviewRoute.jsx) — αλλιώς θα ήταν γκρι μέσα σε γκρι,
                αόρατο περίγραμμα. */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-white px-4 py-6 shadow-2xl sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                Σύνοψη παραγγελίας
              </h2>

              {/* 19/9, ρητό αίτημα χρήστη — "να μην μπερδευτούμε, θέλω ο
                  fan να βλέπει το κανονικό ποσό, αυτό που βγαίνει από τη
                  βάση δεδομένων": αφαιρέθηκαν η γραμμή "Έξοδα αποστολής"
                  και το "Τελικό σύνολο" (που τα πρόσθετε) — το πραγματικό
                  κόστος αποστολής δεν είναι ακόμα γνωστό (εκκρεμεί
                  συνεργασία courier, βλ. concerto-brief.md), οπότε δεν
                  δείχνουμε πια έναν αριθμό-εικασία εδώ. Το "Σύνολο" τώρα
                  είναι ΑΚΡΙΒΩΣ το subtotal που αποθηκεύεται στην παραγγελία
                  (order.subtotal) — ίδιο νούμερο σε ΚΑΘΕ σελίδα του merch
                  flow πλέον, καμία ασυμφωνία. Θα ξαναμπεί γραμμή αποστολής
                  (εδώ ΚΑΙ στο OrderSummaryRoute.jsx, μαζί) με πραγματικό
                  αριθμό όταν κλείσει η συνεργασία. */}
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                  <dt className="text-sm text-gray-600">Καθαρή αξία</dt>
                  <dd className="text-sm font-medium text-gray-900">{net.toFixed(2)}€</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">ΦΠΑ 24%</dt>
                  <dd className="text-sm font-medium text-gray-900">{vat.toFixed(2)}€</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
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
      </div>

      {/* 19/9, ρητό αίτημα χρήστη: πραγματικό modal επιβεβαίωσης αντί για
          native window.confirm — ίδια Dialog primitives με το CartDialog.jsx. */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Άδειασμα καλαθιού</DialogTitle>
            <DialogDescription>
              Θα διαγραφούν όλα τα προϊόντα από το καλάθι σου. Αυτή η ενέργεια δεν
              αναιρείται.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setClearConfirmOpen(false)}>
              Άκυρο
            </Button>
            <Button type="button" variant="destructive" onClick={handleClearCart}>
              Άδειασμα καλαθιού
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
