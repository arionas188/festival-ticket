import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Μετατρέπει το τρέχον καλάθι (cart_items) σε μία pending παραγγελία με
// 10λεπτο hold στο stock — όλη η atomic λογική (δέσμευση stock, δημιουργία
// order/order_items, άδειασμα καλαθιού) ζει μέσα στο SECURITY DEFINER RPC
// create_order_from_cart (βλ. migration 20260914150000_add_orders_checkout.sql),
// όχι εδώ. Το hook απλά το καλεί και επιστρέφει το νέο order id.
export function useCreateOrder(fanId, tenantId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_order_from_cart", {
        p_fan_id: fanId,
        p_tenant_id: tenantId,
      })
      if (error) throw error
      return data // uuid του νέου order
    },
    onSuccess: () => {
      // Το καλάθι μόλις αδειάστηκε server-side (μέρος του ίδιου RPC) — να
      // το ξέρει και το UI αμέσως, όχι μόνο στο επόμενο refetch.
      queryClient.invalidateQueries({ queryKey: ["cart", fanId] })
    },
  })
}
