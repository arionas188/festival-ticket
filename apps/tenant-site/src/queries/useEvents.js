import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// Embed των tickets (13/9) — χρειάζεται στο EventsList για να αποφασίσει
// αν ένα event είναι "μόνο δωρεάν" (FREE badge) ή "εξαντλημένο σε όλες τις
// κατηγορίες" (SOLD OUT badge), με βάση τις ΠΡΑΓΜΑΤΙΚΕΣ γραμμές tickets
// (όχι το χοντρικό events.capacity/tickets_sold, που δεν ενημερώνεται ανά
// κατηγορία). PostgREST embed μέσω tickets(*) — δουλεύει με το ήδη
// υπάρχον foreign key tickets.event_id -> events.id. Προσθετικό, δεν
// σπάει τίποτα από τα υπάρχοντα event.* πεδία.
export function useEvents(tenantId) {
  return useQuery({
    queryKey: ['events', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, tickets(*)')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!tenantId, // δεν κάνει fetch αν δεν έχουμε ακόμα tenantId
  })
}
