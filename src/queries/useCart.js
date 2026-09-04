import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

export function useCart(fanId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["cart", fanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(*)")
        .eq("fan_id", fanId)

      if (error) throw error
      return data
    },
    enabled: !!fanId,
  })

  const addItem = useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      const existing = query.data?.find((i) => i.product.id === product.id)
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ fan_id: fanId, product_id: product.id, quantity })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  const updateQuantity = useMutation({
    mutationFn: async ({ productId, delta }) => {
      const item = query.data?.find((i) => i.product.id === productId)
      if (!item) return
  
      const { data, error } = await supabase.rpc("adjust_cart_quantity", {
        p_cart_item_id: item.id,
        p_delta: delta,
      })
      if (error) throw error
      return data
    },
    // Optimistic update: ενημέρωσε αμέσως την οθόνη, πριν καν απαντήσει η βάση
    onMutate: async ({ productId, delta }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", fanId] })
      const previousCart = queryClient.getQueryData(["cart", fanId])
  
      queryClient.setQueryData(["cart", fanId], (old) => {
        if (!old) return old
        return old
          .map((row) =>
            row.product.id === productId
              ? { ...row, quantity: row.quantity + delta }
              : row
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
    mutationFn: async (productId) => {
      const item = query.data?.find((i) => i.product.id === productId)
      if (!item) return
      const { error } = await supabase.from("cart_items").delete().eq("id", item.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", fanId] }),
  })

  const items = (query.data || []).map((row) => ({
    product: row.product,
    quantity: row.quantity,
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
    addItem: (product, quantity) => addItem.mutate({ product, quantity }),
    updateQuantity: (productId, delta) => updateQuantity.mutate({ productId, delta }),
    removeItem: (productId) => removeItem.mutate(productId),
  }
}