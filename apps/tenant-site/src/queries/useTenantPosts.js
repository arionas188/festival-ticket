import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// "New" tab feed (20/9, ρητό αίτημα χρήστη — instagram-stories στυλ
// αναρτήσεις πριν ανέβει η μπάντα στη σκηνή). ΜΟΝΙΜΗ διαγραφή στη λήξη
// (βλ. migration 20260920100000_add_tenant_posts.sql), οπότε συνήθως ΔΕΝ
// χρειάζεται client-side φιλτράρισμα expires_at εδώ — ΩΣΤΟΣΟ ο pg_cron
// τρέχει ανά λεπτό (ίδιο interval με το ήδη υπάρχον expire_stale_orders),
// άρα υπάρχει ένα μικρό (<60") παράθυρο όπου μια ήδη ληγμένη ανάρτηση
// μπορεί ακόμα να υπάρχει στη βάση. Φιλτράρουμε την ΕΔΩ client-side
// (ίδιο defensive μοτίβο με isScheduledUnavailable, βλ. lib/stockTiers.js)
// ώστε να μην φανεί ποτέ, ούτε για λίγα δευτερόλεπτα, κάτι που ήδη
// "έπρεπε" να έχει φύγει.
//
// Embed tenant_post_likes(fan_id) — like_count/isLiked υπολογίζονται
// client-side από αυτό (βλ. PostCard.jsx), ίδιο embed μοτίβο με
// useEvents.js (tickets(*)).
export function useTenantPosts(tenantId) {
  return useQuery({
    queryKey: ["tenant_posts", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_posts")
        .select("*, tenant_post_likes(fan_id)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data.filter((post) => new Date(post.expires_at) > new Date())
    },
    enabled: !!tenantId,
    // Ίδιο refetchInterval με useProducts.js — νέες αναρτήσεις/likes από
    // άλλους, ΚΑΙ αναρτήσεις που λήγουν, φαίνονται χωρίς χειροκίνητο refresh.
    refetchInterval: 15000,
  })
}
