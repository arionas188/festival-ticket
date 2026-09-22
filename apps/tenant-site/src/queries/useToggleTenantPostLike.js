import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Like/unlike ανάρτησης News (20/9) — ΤΟ ΜΟΝΟ interaction που επιτρέπεται
// στους fans εκεί (ρητό αίτημα χρήστη: "to mono pou tha boroun na kanoun
// einai like"). Ίδιο toggle μοτίβο (insert/delete) με
// useFavorites.js#useToggleFavorite.
export function useToggleTenantPostLike(fanId, tenantId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, isLiked }) => {
      if (isLiked) {
        const { error } = await supabase
          .from("tenant_post_likes")
          .delete()
          .eq("fan_id", fanId)
          .eq("post_id", postId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("tenant_post_likes")
          .insert({ fan_id: fanId, post_id: postId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant_posts", tenantId] })
    },
  })
}
