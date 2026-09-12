import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Επεξεργασία υπάρχοντος event από τον tenant admin (13/9, ρητό αίτημα
// χρήστη — "μολύβι" στο κάθε event, ίδιο μοτίβο ασφάλειας με
// useCreateEvent.js: RLS "tenant admins can update their own tenant
// events"/"...tickets for their own events").
//
// Τα tickets ΔΕΝ γίνονται diff ανά γραμμή (ποια άλλαξε, ποια έμεινε ίδια)
// — σβήνουμε όλες τις παλιές γραμμές του event και ξαναγράφουμε τις
// τρέχουσες. Πιο απλό και σίγουρο από reconciliation λογική, και δεν
// πειράζει επειδή δεν υπάρχει ακόμα κράτηση/αγορά εισιτηρίου (quantity_sold
// είναι πάντα 0 σε αυτό το στάδιο του app) — βλ. TODO στο TicketDialog.jsx.
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, tenantId, values, imageUrl }) => {
      const capacity = values.tickets.reduce(
        (sum, t) => sum + Number(t.quantity),
        0,
      )
      const isoDate = new Date(`${values.date}T${values.time}`).toISOString()

      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: values.title,
          description: values.description || null,
          date: isoDate,
          location: values.location || null,
          location_url: values.locationUrl || null,
          latitude: values.latitude ?? null,
          longitude: values.longitude ?? null,
          image_url: imageUrl || null,
          capacity,
        })
        .eq("id", eventId)

      if (eventError) throw eventError

      const { error: deleteTicketsError } = await supabase
        .from("tickets")
        .delete()
        .eq("event_id", eventId)

      if (deleteTicketsError) throw deleteTicketsError

      const ticketRows = values.tickets.map((t, index) => ({
        event_id: eventId,
        name: t.label,
        price: t.price,
        quantity: t.quantity,
        sort_order: index,
      }))

      const { error: ticketsError } = await supabase
        .from("tickets")
        .insert(ticketRows)

      if (ticketsError) throw ticketsError

      return { id: eventId, tenantId }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", variables.tenantId] })
    },
  })
}
