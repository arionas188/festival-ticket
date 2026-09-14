import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProducts(tenantId) {
  return useQuery({
    queryKey: ['products', tenantId],
    queryFn: async () => {
      // 15/9: product_variants(*) — stock ανά μέγεθος για ρούχα (βλ.
      // migration 20260915120000). Προϊόντα χωρίς variants (music/other, ή
      // clothing πριν γίνει backfill) γυρνάνε απλά άδειο array εδώ.
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}