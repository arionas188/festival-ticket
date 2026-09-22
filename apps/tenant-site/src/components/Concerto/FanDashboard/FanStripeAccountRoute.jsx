import { useOutletContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTenantStripeStatus } from "../../../queries/useTenantStripeStatus"
import { useConnectStripeAccount } from "../../../queries/useConnectStripeAccount"

// /account/stripe -- ορατό στο pill nav (FanDashboardLayout.jsx) ΜΟΝΟ σε
// tenant admin (useIsTenantAdmin), αλλά ΚΑΙ εδώ ξαναελέγχουμε tenantId
// πριν δείξουμε οτιδήποτε -- το route ΔΕΝ έχει δικό του guard/redirect
// ακόμα (θα προστεθεί όταν χτιστεί το πραγματικό onboarding, βλ. TODO στο
// useConnectStripeAccount.js), το κουμπί κάνει πραγματικό write μόνο
// μέσω Netlify Function + Stripe, όχι εδώ.
export default function FanStripeAccountRoute() {
  const { tenantId } = useOutletContext()
  const { data: stripeStatus, isLoading } = useTenantStripeStatus(tenantId)
  const connectStripe = useConnectStripeAccount()

  if (isLoading) return null

  return (
    <div>
      <p className="mb-6 text-sm font-semibold text-foreground">Πληρωμές (Stripe)</p>

      <Card>
        <CardHeader>
          <CardTitle>Σύνδεση Stripe account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {stripeStatus?.stripe_charges_enabled ? (
              <p className="text-sm text-emerald-600">
                Το Stripe account σου είναι συνδεδεμένο και ενεργό.
              </p>
            ) : stripeStatus?.stripe_account_id ? (
              <p className="text-sm text-amber-600">
                Ξεκίνησες τη σύνδεση, αλλά το Stripe account σου δεν έχει
                ολοκληρώσει ακόμα το onboarding.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Δεν έχεις συνδέσει ακόμα Stripe account — χρειάζεται για να
                δέχεσαι πληρωμές από fans.
              </p>
            )}

            {connectStripe.isError ? (
              <p className="text-sm text-destructive">{connectStripe.error.message}</p>
            ) : null}

            <Button
              type="button"
              variant={stripeStatus?.stripe_charges_enabled ? "outline" : "default"}
              disabled={connectStripe.isPending}
              onClick={() => connectStripe.mutate({ tenantId })}
            >
              {connectStripe.isPending
                ? "Μεταφορά στο Stripe..."
                : stripeStatus?.stripe_account_id
                  ? "Συνέχισε τη σύνδεση Stripe"
                  : "Σύνδεσε το Stripe σου"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
