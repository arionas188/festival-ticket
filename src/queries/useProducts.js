import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProducts(tenantId) {
  return useQuery({
    queryKey: ['products', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
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