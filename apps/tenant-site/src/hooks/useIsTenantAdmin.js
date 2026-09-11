import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Ελέγχει αν ο συνδεδεμένος χρήστης είναι admin ΑΥΤΟΥ του tenant, μέσω
// του tenant_admins (ίδιο RLS-protected στοιχείο με το admin-dashboard,
// βλ. apps/admin-dashboard/src/queries/useMyAdminTenants.js). Χρησιμοποιείται
// ώστε να εμφανίζεται το inline "edit" μολύβι πάνω στο cover/bio ΜΟΝΟ σε
// πραγματικούς admins αυτού του tenant — ποτέ σε απλούς fans (12/9, βλ.
// concerto-brief.md, "inline admin editing").
export function useIsTenantAdmin(tenantId, userId) {
  return useQuery({
    queryKey: ["is_tenant_admin", tenantId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_admins")
        .select("tenant_id")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .maybeSingle()
      if (error) throw error
      return !!data
    },
    enabled: !!tenantId && !!userId,
  })
}
