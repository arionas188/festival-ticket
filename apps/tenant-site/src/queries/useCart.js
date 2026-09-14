import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// BUG FIX (8/9): tenantId προστέθηκε — πριν ήταν scoped μόνο ανά fan_id,
// οπότε το καλάθι ΕΝΟΣ tenant "διέρρεε" σε ΟΛΟΥΣ (live-επιβεβαιωμένο, το
// CartDialog έδειχνε κυριολεκτικά προϊόντα άλλου tenant). Βλ. migration
// 20260908130000. Δεν υπάρχει global/συγκεντρωτικό καλάθι στο Fan
// Dashboard — το "quick cart" είναι εξ ορισμού πράξη πάνω σε ΕΝΑ tenant
// (πληρωμή γίνεται ανά tenant, όχι συγκεντρωτικά).
export function useCart(fanId, tenantId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["cart", fanId, tenantId],
    queryFn: async () => {
      // 15/9: variant(...) — ώστε το CartDialog να δείχνει το επιλεγμένο
      // μέγεθος και να κόβει σωστά το + στο ΣΩΣΤΟ (ανά μέγεθος) stock, όχι
      // στο αθροιστικό του προϊόντος. null όταν το προϊόν δεν έχει μεγέθη.
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(*), variant:product_variants(id, size, stock_quantity)")
        .eq("fan_id", fanId)
        .eq("tenant_id", tenantId)

      if (error) throw error
      return data
    },
    enabled: !!fanId && !!tenantId,
  })

  const addItem = useMutation({
    // 15/9: variantId προαιρετικό (προϊόντα χωρίς μεγέθη δεν το στέλνουν
    // καθόλου, undefined). Bug fix: το matching με ήδη υπάρχουσα γραμμή
    // ΠΡΕΠΕΙ να είναι σε (product.id, variantId) μαζί — πριν ήταν μόνο σε
    // product.id, άρα "Small" + μετά "Medium" του ΙΔΙΟΥ προϊόντος θα
    // συγχωνεύονταν λάθος σε μία γραμμή αντί να μείνουν ξεχωριστές.
    mutationFn: async ({ product, quantity = 1, variantId = null }) => {
      const existing = query.data?.find(
        (i) => i.product.id === product.id && (i.variant?.id ?? null) === variantId
      )
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            fan_id: fanId,
            product_id: product.id,
            quantity,
            tenant_id: tenantId,
            variant_id: variantId,
          })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  // 15/9, bug fix: πριν το updateQuantity/removeItem έψαχναν τη γραμμή
  // καλαθιού με product.id — δούλευε μόνο επειδή υπήρχε ΤΟ ΠΟΛΥ μία γραμμή
  // ανά προϊόν. Τώρα ένα προϊόν με μεγέθη μπορεί να έχει ΠΟΛΛΑΠΛΕΣ γραμμές
  // (μία ανά μέγεθος) — το product.id δεν αρκεί πια για να διαλέξει τη
  // ΣΩΣΤΗ. Κλειδί έγινε το ίδιο το cart_items.id (μοναδικό ανά γραμμή).
  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, delta }) => {
      const { data, error } = await supabase.rpc("adjust_cart_quantity", {
        p_cart_item_id: cartItemId,
        p_delta: delta,
      })
      if (error) throw error
      return data
    },
    // Optimistic update: ενημέρωσε αμέσως την οθόνη, πριν καν απαντήσει η βάση
    onMutate: async ({ cartItemId, delta }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", fanId] })
      const previousCart = queryClient.getQueryData(["cart", fanId])

      queryClient.setQueryData(["cart", fanId], (old) => {
        if (!old) return old
        return old
          .map((row) =>
            row.id === cartItemId ? { ...row, quantity: row.quantity + delta } : row
          )
          .filter((row) => row.quantity > 0)
      })

      return { previousCart }
    },
    // Αν κάτι πάει στραβά, επανάφερε την προηγούμενη, σωστή κατάσταση
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart", fanId], context.previousCart)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })
  const removeItem = useMutation({
    mutationFn: async (cartItemId) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  const items = (query.data || []).map((row) => ({
    id: row.id,
    product: row.product,
    quantity: row.quantity,
    variant: row.variant,
  }))

  const itemCount = items.length

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  )

  return {
    items,
    itemCount,
    subtotal,
    addItem: (product, quantity, variantId) => addItem.mutate({ product, quantity, variantId }),
    updateQuantity: (cartItemId, delta) => updateQuantity.mutate({ cartItemId, delta }),
    removeItem: (cartItemId) => removeItem.mutate(cartItemId),
  }
}