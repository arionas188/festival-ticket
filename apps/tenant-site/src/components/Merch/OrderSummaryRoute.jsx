import { useEffect, useState } from "react"
import { Link, useOutletContext, useParams } from "react-router-dom"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrder } from "../../queries/useOrder"
import { useCart } from "../../queries/useCart"

// Δεκάλεπτο countdown μέχρι το expires_at της παραγγελίας, σε mm:ss. Το
// pg_cron (βλ. migration 20260914150000) τρέχει κάθε λεπτό server-side και
// θα κάνει το status 'expired' μόνο του — αυτό το countdown είναι ΜΟΝΟ
// οπτική ένδειξη για τον fan, δεν λήγει τίποτα τοπικά.
function useCountdown(expiresAt) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const clamped = Math.max(0, remainingMs)
  const minutes = Math.floor(clamped / 60000)
  const seconds = Math.floor((clamped % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export default function OrderSummaryRoute() {
  const { orderId } = useParams()
  const context = useOutletContext()
  const { data: order, isLoading, error } = useOrder(orderId)
  const { addItem } = useCart(context.fanId, context.tenantId)
  const countdown = useCountdown(order?.expires_at || new Date().toISOString())

  function handlePayment() {
    // TODO (επόμενο session): εδώ μπαίνει το πραγματικό Stripe call. Χρειάζεται
    // μια serverless function (Netlify Functions ή Supabase Edge Functions —
    // καμία από τις δύο δεν υπάρχει ακόμα στο repo) που κρατάει το Stripe
    // secret key, δημιουργεί ένα PaymentIntent για ΑΥΤΟ το order.id, και
    // επιστρέφει ό,τι χρειάζεται το Stripe.js frontend SDK για να ολοκληρώσει
    // την πληρωμή. Το order παραμένει 'pending' μέχρι το Stripe webhook
    // (επίσης serverless) να το κάνει 'completed'.
  }

  function handleReAddToCart() {
    // 15/9: περνάει και το variant_id (μέγεθος) όταν υπάρχει — αλλιώς μια
    // παραγγελία "T-Shirt, Μέγεθος M" θα ξαναπρόσθετε το προϊόν ΧΩΡΙΣ
    // μέγεθος, μπερδεύοντας το καλάθι/checkout.
    order.order_items.forEach((item) => addItem(item.product, item.quantity, item.variant_id))
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 pb-24 sm:p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl p-4 sm:p-6">
        <p className="text-sm text-gray-500">Η παραγγελία δεν βρέθηκε.</p>
        <Link to="/merch" className="mt-2 inline-block text-sm font-medium text-gray-900 underline">
          ← Πίσω στο Merch Store
        </Link>
      </div>
    )
  }

  const isExpired = order.status === "expired"
  const isPending = order.status === "pending"

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 pb-24 sm:p-6">
      <h1 className="font-heading text-lg font-medium">Η παραγγελία σου</h1>

      {isPending && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
          <span className="text-gray-600">Κράτηση stock για</span>
          <span className="font-semibold tabular-nums text-gray-900">{countdown}</span>
        </div>
      )}

      {isExpired && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-destructive">
              Η κράτηση έληξε πριν ολοκληρωθεί η πληρωμή — το απόθεμα ελευθερώθηκε.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleReAddToCart} className="self-start">
              Πρόσθεσε ξανά στο καλάθι
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
        <ul className="flex flex-col gap-3">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img
                src={item.product?.image_urls?.[0]}
                alt={item.product?.name}
                className="size-14 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.product?.name}
                  {item.size_label && (
                    <span className="font-normal text-gray-500"> — Μέγεθος {item.size_label}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × {Number(item.unit_price).toFixed(2)}€
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-gray-900">
                {(Number(item.unit_price) * item.quantity).toFixed(2)}€
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-900">Σύνολο</span>
          <span className="text-base font-semibold text-gray-900">
            {Number(order.subtotal).toFixed(2)}€
          </span>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={handlePayment} disabled={!isPending}>
        Πληρωμή
      </Button>
    </div>
  )
}
