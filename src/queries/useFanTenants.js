import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Λίστα tenants που ακολουθεί ο fan (Fan Dashboard → "Tenants που
// ακολουθώ") — τρία διαδοχικά queries αντί για ένα nested embed, ίδιο στυλ
// με useTenant.js (εκεί έγινε η ίδια επιλογή για tenant_domains/
// tenant_settings, βλ. εκείνο το αρχείο).
export function useFanTenants(fanId) {
  return useQuery({
    queryKey: ["fan_tenants", fanId],
    queryFn: async () => {
      const { data: follows, error: followsError } = await supabase
        .from("tenant_follows")
        .select("tenant_id, tenants ( id, name, slug, type )")
        .eq("fan_id", fanId)
      if (followsError) throw followsError

      const tenantIds = (follows ?? []).map((f) => f.tenant_id)
      if (tenantIds.length === 0) return []

      const { data: settingsRows, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("tenant_id, display_name, logo_url")
        .in("tenant_id", tenantIds)
      if (settingsError) throw settingsError

      const { data: domainRows, error: domainsError } = await supabase
        .from("tenant_domains")
        .select("tenant_id, domain")
        .in("tenant_id", tenantIds)
      if (domainsError) throw domainsError

      return follows.map((f) => {
        const settings = settingsRows.find((s) => s.tenant_id === f.tenant_id)
        const domainRow = domainRows.find((d) => d.tenant_id === f.tenant_id)
        return {
          tenantId: f.tenant_id,
          name: settings?.display_name || f.tenants?.name,
          logoUrl: settings?.logo_url,
          domain: domainRow?.domain,
        }
      })
    },
    enabled: !!fanId,
  })
}

export function useUnfollowTenant(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tenantId) => {
      const { error } = await supabase
        .from("tenant_follows")
        .delete()
        .eq("fan_id", fanId)
        .eq("tenant_id", tenantId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan_tenants", fanId] })
      // Partial key (χωρίς tenantId) — ώστε το κουμπί follow στο Header.jsx
      // (isFollowing) να ξαναγίνει "Ακολούθησε" αμέσως, όπου κι αν έγινε
      // το unfollow (Fan Dashboard εδώ, ή απευθείας από το tenant).
      queryClient.invalidateQueries({ queryKey: ["fan_session", fanId] })
    },
  })
}
