import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

export function useTenantFollow(fanId, tenantId) {
  return useQuery({
    queryKey: ["tenant_follow", fanId, tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_follows")
        .select("id")
        .eq("fan_id", fanId)
        .eq("tenant_id", tenantId)
        .maybeSingle()

      if (error) throw error
      return !!data
    },
    enabled: !!fanId && !!tenantId,
  })
}