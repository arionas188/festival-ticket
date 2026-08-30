import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

export function useEnsureFanAndFollow(user, tenantId) {
  const queryClient = useQueryClient()

  useEffect(() => {
    async function ensure() {
      if (!user || !tenantId) return

      const { error: fanError } = await supabase.from("fans").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
        },
        { onConflict: "id", ignoreDuplicates: false }
      )
      if (fanError) console.error("Fan upsert error:", fanError)

      const { error: followError } = await supabase.from("tenant_follows").upsert(
        { fan_id: user.id, tenant_id: tenantId },
        { onConflict: "fan_id,tenant_id", ignoreDuplicates: true }
      )
      if (followError) console.error("Follow upsert error:", followError)

      if (!followError) {
        localStorage.setItem(`followed_tenant_${tenantId}`, "true")
        queryClient.setQueryData(["tenant_follow", user.id, tenantId], true)
      } else {
        queryClient.invalidateQueries({ queryKey: ["tenant_follow", user.id, tenantId] })
      }
    }

    ensure()
  }, [user, tenantId, queryClient])
}