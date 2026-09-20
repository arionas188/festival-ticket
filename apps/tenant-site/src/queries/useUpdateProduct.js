import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Επεξεργασία υπάρχοντος merch προϊόντος από τον tenant admin (20/9, ρητό
// αίτημα χρήστη — "μολύβι" σε κάθε προϊόν, ίδιο μοτίβο ασφάλειας με
// useCreateProduct.js: RLS "tenant admins can update their own tenant
// products"/"...variants for their own products").
//
// Τα product_variants ΔΕΝ γίνονται diff ανά γραμμή — σβήνουμε ΟΛΕΣ τις
// παλιές γραμμές μεγέθους αυτού του προϊόντος και ξαναγράφουμε τις
// τρέχουσες (ίδιο μοτίβο με useUpdateEvent.js/tickets). Ισχύει ΚΑΙ όταν
// ο admin αλλάξει κατηγορία από/προς "clothing" — τα παλιά μεγέθη
// καθαρίζονται σωστά και στις δύο κατευθύνσεις.
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, tenantId, values, imageUrls }) => {
      const isClothing = values.category === "clothing"

      const { error: productError } = await supabase
        .from("products")
        .update({
          name: values.name,
          description: values.description || null,
          category: values.category,
          price: values.price,
          stock_quantity: isClothing ? 0 : (values.stock_quantity ?? 0),
          image_urls: imageUrls,
          // 20/9, ρητό αίτημα χρήστη -- βλ. πλήρες σχόλιο στο
          // ProductFormPage.jsx/migration 20260920090000_add_products_scheduling.sql.
          is_new_arrival: values.is_new_arrival ?? false,
          available_from: values.available_from ?? null,
        })
        .eq("id", productId)

      if (productError) throw productError

      const { error: deleteVariantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId)

      if (deleteVariantsError) throw deleteVariantsError

      if (isClothing && values.variants?.length) {
        const variantRows = values.variants.map((v) => ({
          product_id: productId,
          size: v.size,
          stock_quantity: v.stock_quantity,
        }))

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantRows)

        if (variantsError) throw variantsError
      }

      return { id: productId, tenantId }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.tenantId] })
    },
  })
}
