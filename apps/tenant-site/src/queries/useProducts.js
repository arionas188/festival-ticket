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
    // 19/9, ρητό αίτημα χρήστη, bug: μετά τη λήξη ενός hold (βλ.
    // useActiveStockHolds.js), το προϊόν σωστά ξαναγινόταν "Διαθέσιμα" (η
    // ετικέτα, που ΕΙΧΕ δικό της refetchInterval), αλλά ο ΙΔΙΟΣ ο αριθμός
    // (π.χ. "(9)") έμενε παγωμένος στην παλιά, δεσμευμένη τιμή — μέχρι
    // πλήρες page refresh. Αιτία: ΑΥΤΟ το query (η πηγή του πραγματικού
    // stock_quantity) δεν είχε ΚΑΝΕΝΑ refetchInterval, οπότε δεν ξανακαλούσε
    // τη βάση μόνο του — μόνο σε mount/window-focus (React Query default).
    // Fix: ίδιο interval με το useActiveStockHolds.js, ώστε ο αριθμός ΚΑΙ η
    // ετικέτα να ενημερώνονται πάντα ΜΑΖΙ, ποτέ ασύγχρονα μεταξύ τους.
    refetchInterval: 15000,
  })
}