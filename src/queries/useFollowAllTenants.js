import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// "Ο fan που συνδέεται global ακολουθεί όλα τα tenants" — ρητά προσωρινή,
// απλοϊκή συμπεριφορά ("για αρχή", 7/9): μόλις συνδεθεί, ακολουθεί ΚΑΘΕ
// tenant της πλατφόρμας, όχι μόνο αυτό που έτυχε να επισκέπτεται. Θα
// ξαναδουλευτεί σε πιο έξυπνη λογική αργότερα (discovery/opt-in ανά
// tenant) — βλ. concerto-react-router-brief.md.
//
// Ξεχωριστό, ανεξάρτητο hook από το useFanSession (που ακολουθεί μόνο το
// tenant που βλέπεις αυτή τη στιγμή) — τρέχει σε global επίπεδο
// (ConcertoBar, μία φορά ανά session). Κάνει δικό του upsert στο `fans`
// αντί να υποθέτει ότι το useFanSession έτρεξε πρώτο, αφού τα δύο hooks
// τρέχουν ανεξάρτητα/παράλληλα.
export function useFollowAllTenants(user) {
  return useQuery({
    queryKey: ["follow_all_tenants", user?.id],
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
        // Ίδιο "zombie session" self-heal με το useFanSession.js — βλ. εκεί
        // για το γιατί (23503 = FK violation, το auth.users row δεν υπάρχει πια).
        if (fanError.code === "23503") {
          await supabase.auth.signOut({ scope: "local" })
        }
        throw fanError
      }

      const { data: tenants, error: tenantsError } = await supabase.from("tenants").select("id")
      if (tenantsError) throw tenantsError

      const rows = (tenants ?? []).map((t) => ({ fan_id: user.id, tenant_id: t.id }))
      if (rows.length === 0) return true

      const { error: followError } = await supabase
        .from("tenant_follows")
        .upsert(rows, { onConflict: "fan_id,tenant_id", ignoreDuplicates: true })
      if (followError) throw followError

      return true
    },
    enabled: !!user?.id,
  })
}
