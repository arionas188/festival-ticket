import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Μία παραγγελία + οι γραμμές της (με το προϊόν, για εικόνα/όνομα στο
// OrderSummaryRoute). Το RLS ("Fans can view own orders"/"own order items")
// φροντίζει ήδη ότι ο fan βλέπει ΜΟΝΟ τη δική του παραγγελία — δεν χρειάζεται
// επιπλέον .eq('fan_id', ...) εδώ.
export function useOrder(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*))")
        .eq("id", orderId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!orderId,
    // Το status μπορεί να αλλάξει server-side (pg_cron το κάνει 'expired')
    // χωρίς καμία ενέργεια του fan σε αυτή την καρτέλα — ξαναρωτάμε λίγο
    // συχνότερα από το default όσο η σελίδα είναι ανοιχτή, ώστε το countdown
    // να "πιάσει" τη λήξη έγκαιρα.
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 15000 : false),
  })
}
