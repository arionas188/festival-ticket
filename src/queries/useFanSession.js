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
      if (fanError) {
        // 23503 = foreign key violation: το auth.users row αυτού του session
        // δεν υπάρχει πια (π.χ. ο λογαριασμός διαγράφηκε από άλλο subdomain/
        // tab — κάθε subdomain έχει δικό του, ξεχωριστό localStorage session,
        // βλ. concerto-brief.md). Το session εδώ είναι "ζόμπι": ζωντανό
        // τοπικά, νεκρό στον server. scope:"local" καθαρίζει μόνο το τοπικό
        // storage — δεν χρειάζεται/δεν έχει νόημα server call, ο server δεν
        // έχει πια τίποτα να ακυρώσει γι' αυτό το session.
        if (fanError.code === "23503") {
          await supabase.auth.signOut({ scope: "local" })
        }
        throw fanError
      }

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