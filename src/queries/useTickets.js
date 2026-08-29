import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTickets(eventId) {
  return useQuery({
    queryKey: ['tickets', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}