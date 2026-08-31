import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

export function useFanSession(user, tenantId) {
  return useQuery({
    queryKey: ["fan_session", user?.id, tenantId],
    queryFn: async () => {
      const { error: fanError } = await supabase.from("fans").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
        },
        { onConflict: "id" }
      )
      if (fanError) throw fanError

      const { error: followError } = await supabase.from("tenant_follows").upsert(
        { fan_id: user.id, tenant_id: tenantId },
        { onConflict: "fan_id,tenant_id", ignoreDuplicates: true }
      )
      if (followError) throw followError

      localStorage.setItem(`followed_tenant_${tenantId}`, "true")

      return true
    },
    enabled: !!user?.id && !!tenantId,
  })
}