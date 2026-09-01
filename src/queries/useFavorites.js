import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

export function useFavorites(fanId) {
  return useQuery({
    queryKey: ["favorites", fanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("fan_id", fanId)

      if (error) throw error
      return data.map((row) => row.product_id)
    },
    enabled: !!fanId,
  })
}

export function useToggleFavorite(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, isFavorited }) => {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("fan_id", fanId)
          .eq("product_id", productId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ fan_id: fanId, product_id: productId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", fanId] })
    },
  })
}