import { useRef } from "react"
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
  //
  // 19/9, ρητό αίτημα χρήστη, bug: πατώντας γρήγορα +/- πολλές φορές στη
  // σειρά στο CartRoute.jsx, κάθε κλικ έστελνε ΑΜΕΣΩΣ δικό του αίτημα στη
  // βάση (RPC) — τα παράλληλα αιτήματα/onSettled invalidations
  // "τσακώνονταν" μεταξύ τους και η οθόνη καθυστερούσε αισθητά να
  // ανταποκριθεί. Fix (ίδιο πνεύμα με το ProductOverviewRoute.jsx, όπου τα
  // +/- δουλεύουν σε τοπικό state χωρίς ΚΑΝΕΝΑ δίκτυο ανά κλικ): η οθόνη
  // ενημερώνεται πάντα ΑΜΕΣΩΣ/τοπικά σε κάθε κλικ (μηδενική καθυστέρηση),
  // αλλά το πραγματικό αίτημα προς τη βάση "μαζεύεται" (debounce, 400ms) —
  // αν ο χρήστης πατήσει 5 φορές το "+" μέσα σε μισό δευτερόλεπτο, φεύγει
  // ΕΝΑ αίτημα με άθροισμα +5, όχι 5 ξεχωριστά. Το mutation δεν κάνει πια
  // δικό του optimistic onMutate (η άμεση ενημέρωση γίνεται στο
  // updateQuantity() παρακάτω, ΠΡΙΝ καν φύγει το αίτημα) — σε λάθος απλά
  // ξαναφέρνουμε την πραγματική κατάσταση από τη βάση.
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, delta }) => {
      const { data, error } = await supabase.rpc("adjust_cart_quantity", {
        p_cart_item_id: cartItemId,
        p_delta: delta,
      })
      if (error) throw error
      return data
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  // cartItemId -> άθροισμα clicks που δεν έχουν φύγει ακόμα προς τη βάση,
  // cartItemId -> το ενεργό setTimeout — και τα δύο refs ώστε να επιζούν
  // ανάμεσα σε renders χωρίς να ξαναδημιουργούνται.
  const pendingDeltaRef = useRef({})
  const debounceTimerRef = useRef({})

  function updateQuantity(cartItemId, delta) {
    // 19/9, ΠΡΑΓΜΑΤΙΚΗ αιτία της αργής απόκρισης (βρέθηκε μετά το πρώτο,
    // ημιτελές fix): το query ζει στο cache-key ["cart", fanId, tenantId]
    // (βλ. useQuery πιο πάνω), αλλά το setQueryData εδώ έγραφε σε
    // ["cart", fanId] — ΔΙΑΦΟΡΕΤΙΚΟ κλειδί (το setQueryData χρειάζεται
    // ΑΚΡΙΒΕΣ match, σε αντίθεση με το invalidateQueries που κάνει
    // prefix-match). Άρα η "άμεση/τοπική" ενημέρωση έγραφε σε ένα ΑΧΡΗΣΤΟ
    // cache entry που καμία οθόνη δεν διάβαζε ποτέ — η οθόνη ΠΑΝΤΑ περίμενε
    // το πραγματικό network round-trip (εξ ου και η καθυστέρηση, ακόμα και
    // με το debounce). Fix: ίδιο ΑΚΡΙΒΩΣ κλειδί με το useQuery.
    queryClient.setQueryData(["cart", fanId, tenantId], (old) => {
      if (!old) return old
      return old
        .map((row) =>
          row.id === cartItemId ? { ...row, quantity: row.quantity + delta } : row
        )
        .filter((row) => row.quantity > 0)
    })

    pendingDeltaRef.current[cartItemId] = (pendingDeltaRef.current[cartItemId] || 0) + delta
    clearTimeout(debounceTimerRef.current[cartItemId])
    debounceTimerRef.current[cartItemId] = setTimeout(() => {
      const totalDelta = pendingDeltaRef.current[cartItemId]
      delete pendingDeltaRef.current[cartItemId]
      delete debounceTimerRef.current[cartItemId]
      if (totalDelta) {
        updateQuantityMutation.mutate({ cartItemId, delta: totalDelta })
      }
    }, 400)
  }
  const removeItem = useMutation({
    mutationFn: async (cartItemId) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  // 15/9, ρητό αίτημα χρήστη: "ή να αφαιρέσει όλο το καλάθι" — bulk delete
  // ΟΛΩΝ των γραμμών αυτού του fan+tenant, όχι μία-μία (αυτό ήδη καλύπτεται
  // από removeItem). Ίδιο query scope (fan_id + tenant_id) με το useQuery
  // παραπάνω, ώστε να μην αγγίξει καλάθι άλλου tenant.
  const clearCart = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("fan_id", fanId)
        .eq("tenant_id", tenantId)
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
    // 15/9: για full-page routes (CartRoute.jsx) που θέλουν skeleton state
    // κατά τη φόρτωση, ίδιο μοτίβο με τα υπόλοιπα routes (ProductOverviewRoute.jsx).
    isLoading: query.isLoading,
    // 15/9: mutateAsync (όχι mutate) — έγινε awaitable ώστε ο caller να
    // μπορεί να προσθέσει σειριακά ΠΟΛΛΑΠΛΑ μεγέθη/ποσότητες του ίδιου
    // προϊόντος (ένα SizeSelector row ανά μέγεθος) και να ΠΕΡΙΜΕΝΕΙ να
    // ολοκληρωθούν όλα πριν προχωρήσει σε "Ολοκλήρωση παραγγελίας" — βλ.
    // ProductOverviewRoute.jsx. Callers που δεν κάνουν await συνεχίζουν να
    // δουλεύουν ακριβώς όπως πριν (fire-and-forget), το mutateAsync απλά
    // επιστρέφει ένα Promise που μπορεί να αγνοηθεί.
    addItem: (product, quantity, variantId) =>
      addItem.mutateAsync({ product, quantity, variantId }),
    updateQuantity,
    removeItem: (cartItemId) => removeItem.mutate(cartItemId),
    clearCart: () => clearCart.mutate(),
  }
}