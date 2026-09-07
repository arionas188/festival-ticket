import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useBandMembers(tenantId) {
  return useQuery({
    queryKey: ['band_members', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('band_members')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
