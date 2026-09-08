import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Ίδιο pattern με useFavorites.js (merch) — event_favorites είναι ξεχωριστό
// table, όχι επέκταση του favorites (βλ. migration 20260908120000, γιατί).
export function useEventFavorites(fanId) {
  return useQuery({
    queryKey: ["event_favorites", fanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_favorites")
        .select("event_id")
        .eq("fan_id", fanId)

      if (error) throw error
      return data.map((row) => row.event_id)
    },
    enabled: !!fanId,
  })
}

export function useToggleEventFavorite(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    // event: μόνο όταν γίνεται ΝΕΟ favorite — "φωτογραφία" τίτλου/ημερομηνίας
    // εκείνη τη στιγμή, βλ. useFanFavoriteEvents.js (badge "άλλαξε").
    mutationFn: async ({ eventId, isFavorited, event }) => {
      if (isFavorited) {
        const { error } = await supabase
          .from("event_favorites")
          .delete()
          .eq("fan_id", fanId)
          .eq("event_id", eventId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("event_favorites").insert({
          fan_id: fanId,
          event_id: eventId,
          snapshot_title: event?.title ?? null,
          snapshot_date: event?.date ?? null,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_favorites", fanId] })
    },
  })
}
