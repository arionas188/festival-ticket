import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// 19/9, ρητό αίτημα χρήστη (screenshot — προϊόν "Εξαντλημένο" ενώ στην
// ουσία είναι απλά δεσμευμένο μέσα σε ενεργό hold κάποιου άλλου fan που
// βρίσκεται στο 10λεπτο/1λεπτο παράθυρο να ολοκληρώσει την πληρωμή του):
// ξεχωριστό, μικρό query — διαβάζει ΜΟΝΟ ανώνυμα αθροίσματα (product_id/
// variant_id/held_qty) μέσω του RPC get_active_stock_holds (βλ. migration
// 20260919090100), ΚΑΜΙΑ αναφορά σε ΠΟΙΟΣ κρατάει το απόθεμα. Χρησιμοποιείται
// από το StockBadge.jsx/SizeSelector.jsx (μέσω lib/stockTiers.js) για να
// διαφοροποιήσουν "Μη διαθέσιμο" (ενεργό hold, θα επιστρέψει) από
// "Εξαντλημένο" (πραγματικά μηδέν, καμία ενεργή δέσμευση να το εξηγεί).
export function useActiveStockHolds(tenantId) {
  const query = useQuery({
    queryKey: ["active-stock-holds", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_active_stock_holds", {
        p_tenant_id: tenantId,
      })
      if (error) throw error
      return data
    },
    enabled: !!tenantId,
    // 19/9: τα holds αλλάζουν μόνα τους (λήγουν) χωρίς καμία ενέργεια του
    // fan στην ίδια οθόνη — χωρίς refetchInterval, ο fan θα έβλεπε το
    // "Μη διαθέσιμο" να γίνεται ξανά "Διαθέσιμα" μόνο μετά από manual
    // refresh της σελίδας.
    refetchInterval: 15000,
  })

  const heldVariantIds = new Set()
  const heldProductIds = new Set()
  for (const row of query.data || []) {
    heldProductIds.add(row.product_id)
    if (row.variant_id) heldVariantIds.add(row.variant_id)
  }

  return { heldVariantIds, heldProductIds, isLoading: query.isLoading }
}
