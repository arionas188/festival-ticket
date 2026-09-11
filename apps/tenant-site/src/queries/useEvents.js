import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useEvents(tenantId) {
  return useQuery({
    queryKey: ['events', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!tenantId, // δεν κάνει fetch αν δεν έχουμε ακόμα tenantId
  })
}