import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// BUG FIX (8/9): tenantId προστέθηκε — πριν ήταν scoped μόνο ανά fan_id,
// οπότε τα favorites ΕΝΟΣ tenant "διέρρεαν" σε ΟΛΟΥΣ (live-επιβεβαιωμένο).
// Βλ. migration 20260908130000 για το γιατί/το backfill. Η ΜΟΝΗ εξαίρεση
// είναι το Fan Dashboard (useFanFavoriteMerch.js) — ΕΠΙΤΗΔΕΣ δεν φιλτράρει
// ανά tenant, δείχνει όλα τα tenants μαζί, συγκεντρωτικά.
export function useFavorites(fanId, tenantId) {
  return useQuery({
    queryKey: ["favorites", fanId, tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("fan_id", fanId)
        .eq("tenant_id", tenantId)

      if (error) throw error
      return data.map((row) => row.product_id)
    },
    enabled: !!fanId && !!tenantId,
  })
}

export function useToggleFavorite(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    // price: μόνο όταν γίνεται ΝΕΟ favorite (isFavorited: false → true) —
    // "φωτογραφία" της τιμής εκείνη τη στιγμή, βλ. useFanFavoriteMerch.js
    // για το γιατί (price-drop badge στο Fan Dashboard). tenantId: ΜΟΝΟ
    // στο insert (βλ. πάνω) — το delete βρίσκει τη γραμμή ήδη μοναδικά με
    // fan_id+product_id.
    mutationFn: async ({ productId, isFavorited, price, tenantId }) => {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("fan_id", fanId)
          .eq("product_id", productId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("favorites").insert({
          fan_id: fanId,
          product_id: productId,
          price_at_favorite: price ?? null,
          tenant_id: tenantId,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      // Partial key match (χωρίς tenantId/price στο array) — invalidate-άρει
      // ΟΛΑ τα ["favorites", fanId, ...] queries, ανεξάρτητα από tenant.
      queryClient.invalidateQueries({ queryKey: ["favorites", fanId] })
      queryClient.invalidateQueries({ queryKey: ["fan_favorite_merch", fanId] })
    },
  })
}
