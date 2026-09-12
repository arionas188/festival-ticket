import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Διαγραφή event από τον tenant admin (13/9, ρητό αίτημα χρήστη — "κόκκινος
// κάδος", "να μη μαζεύει σκουπίδια η βάση") — πραγματικό DELETE, όχι soft
// delete/is_active flag. Σβήνει πρώτα τα tickets του event (αποφεύγει FK
// violation ανεξάρτητα από το αν υπάρχει ON DELETE CASCADE στο
// constraint), μετά το ίδιο το event. Ίδιο pattern με το αυτόματο
// "delete-expired-events" pg_cron job (βλ. migration
// 20260913120000_events_edit_delete_location_geo.sql).
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, tenantId }) => {
      const { error: ticketsError } = await supabase
        .from("tickets")
        .delete()
        .eq("event_id", eventId)

      if (ticketsError) throw ticketsError

      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)

      if (eventError) throw eventError

      return { id: eventId, tenantId }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", variables.tenantId] })
    },
  })
}
