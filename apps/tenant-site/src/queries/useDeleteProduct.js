import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Διαγραφή merch προϊόντος από τον tenant admin (20/9, ρητό αίτημα χρήστη
// — "να του δίνουμε τη δυνατότητα να μπορεί να το διαγράψει") — πραγματικό
// DELETE, όχι soft delete/is_active flag, ίδιο μοτίβο με useDeleteEvent.js.
//
// Σβήνει πρώτα τα cart_items που δείχνουν σε αυτό το προϊόν (ενεργά
// καλάθια άλλων fans — ασφαλές να φύγουν, δεν είναι ακόμα παραγγελία/
// πληρωμή). Τα product_variants φεύγουν ΑΥΤΟΜΑΤΑ (on delete cascade, βλ.
// migration 20260915120000_add_product_variants.sql) — καμία ξεχωριστή
// ενέργεια χρειάζεται εδώ.
//
// ΔΕΝ αγγίζουμε order_items σκόπιμα — είναι ιστορικό παραγγελιών
// (snapshot τιμής/μεγέθους τη στιγμή της αγοράς), ΔΕΝ πρέπει ποτέ να
// χαθεί σιωπηλά. Αν το προϊόν έχει ήδη order_items, το ίδιο το DELETE
// στο products θα αποτύχει (foreign key) — αυτό είναι το ΣΩΣΤΟ,
// αναμενόμενο αποτέλεσμα, όχι bug· το error μήνυμα φτάνει στον admin
// μέσω του .catch() στο DeleteProductDialog.jsx.
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, tenantId }) => {
      const { error: cartItemsError } = await supabase
        .from("cart_items")
        .delete()
        .eq("product_id", productId)

      if (cartItemsError) throw cartItemsError

      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (productError) throw productError

      return { id: productId, tenantId }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.tenantId] })
    },
  })
}
