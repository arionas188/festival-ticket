import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Ίδιο pattern με το useFanTenants/useFanFavoriteMerch του tenant-site:
// σειριακά, απλά queries αντί για nested embed — ίδιος τεκμηριωμένος
// λόγος εκεί, το κρατάμε συνεπές και εδώ.
//
// Βήμα 1: ποια tenant_id διαχειρίζεται αυτός ο χρήστης (RLS το περιορίζει
// ήδη ΜΟΝΟ στις δικές του γραμμές, βλ. "admins can see their own admin
// rows" policy).
// Βήμα 2: στοιχεία εμφάνισης (όνομα, slug, λογότυπο) για αυτά τα tenants.
export function useMyAdminTenants(userId) {
  return useQuery({
    queryKey: ["my_admin_tenants", userId],
    queryFn: async () => {
      const { data: adminRows, error: adminError } = await supabase
        .from("tenant_admins")
        .select("tenant_id")
        .eq("user_id", userId)
      if (adminError) throw adminError
      if (adminRows.length === 0) return []

      const tenantIds = adminRows.map((row) => row.tenant_id)

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .in("id", tenantIds)
      if (tenantsError) throw tenantsError

      const { data: settingsRows, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("tenant_id, logo_url")
        .in("tenant_id", tenantIds)
      if (settingsError) throw settingsError

      return tenants.map((tenant) => ({
        ...tenant,
        logoUrl: settingsRows.find((s) => s.tenant_id === tenant.id)?.logo_url ?? null,
      }))
    },
    enabled: !!userId,
  })
}
