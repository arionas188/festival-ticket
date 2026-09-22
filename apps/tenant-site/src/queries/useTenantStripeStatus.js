import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Κατάσταση σύνδεσης Stripe ΑΥΤΟΥ του tenant — διαβάζεται ξεχωριστά από
// το useTenant.js (που ήδη φέρνει bio/logo/cover_image_url για ΚΑΘΕ
// επισκέπτη) γιατί αυτά τα δύο πεδία αφορούν ΜΟΝΟ τον tenant admin (βλ.
// FanStripeAccountRoute.jsx, ορατό μόνο πίσω από useIsTenantAdmin) — δεν
// έχει νόημα να τα κουβαλάει το public query για κάθε απλό fan.
export function useTenantStripeStatus(tenantId) {
  return useQuery({
    queryKey: ["tenant_stripe_status", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_settings")
        .select("stripe_account_id, stripe_charges_enabled")
        .eq("tenant_id", tenantId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
