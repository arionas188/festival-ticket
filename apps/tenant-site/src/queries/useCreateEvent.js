import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Δημιουργία νέου event "από την αρχή" από τον tenant admin (13/9, ρητό
// αίτημα χρήστη) — βλ. RLS policies στο migration
// 20260912180000_add_events_tickets_admin_write.sql (μόνο admin ΤΟΥ
// συγκεκριμένου tenant μπορεί να γράψει, ίδιος μηχανισμός με
// tenant_settings/tenant-images).
//
// Δύο διαδοχικά inserts (events, μετά tickets) — το Supabase JS client δεν
// κάνει multi-table transactions από τον browser. Αν αποτύχει το insert
// των tickets, διαγράφουμε το μόλις-δημιουργηθέν event ώστε να μη μείνει
// "ορφανό" event χωρίς εισιτήρια στη βάση.
//
// values.tickets εδώ είναι ΜΟΝΟ οι επιλεγμένοι (checked) τύποι εισιτηρίων
// — το φιλτράρισμα γίνεται στο EventFormPage πριν το mutate, ώστε αυτό το
// hook να μένει απλό (απλά γράφει ό,τι του δοθεί).
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, values, imageUrl }) => {
      const capacity = values.tickets.reduce(
        (sum, t) => sum + Number(t.quantity),
        0,
      )

      // date + time (ξεχωριστά πεδία στη φόρμα, 13/9) -> ένα timestamp.
      const isoDate = new Date(`${values.date}T${values.time}`).toISOString()

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          tenant_id: tenantId,
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
        .select()
        .single()

      if (eventError) throw eventError

      const ticketRows = values.tickets.map((t, index) => ({
        event_id: event.id,
        name: t.label,
        price: t.price,
        quantity: t.quantity,
        sort_order: index,
      }))

      const { error: ticketsError } = await supabase
        .from("tickets")
        .insert(ticketRows)

      if (ticketsError) {
        await supabase.from("events").delete().eq("id", event.id)
        throw ticketsError
      }

      return event
    },
    onSuccess: (_event, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", variables.tenantId] })
    },
  })
}
