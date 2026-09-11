import { useMutation } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Καλεί το delete_own_account() RPC (SECURITY DEFINER function, βλ. migration
// 20260907120000) — διαγράφει auth.users row του τρέχοντος χρήστη, που κάνει
// cascade σε fans/tenant_follows/favorites/cart_items αυτόματα.
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_own_account")
      if (error) throw error
      // Το auth.users row (άρα και το session) δεν υπάρχει πια — καθαρίζουμε
      // και το τοπικό state/localStorage με το ίδιο signOut που ήδη
      // χρησιμοποιεί το project παντού.
      await supabase.auth.signOut()
    },
  })
}
