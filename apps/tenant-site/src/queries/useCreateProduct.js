import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Δημιουργία νέου merch προϊόντος "από την αρχή" από τον tenant admin
// (20/9, ρητό αίτημα χρήστη — "Πρόσθεσε προϊόν" στο Merch Store, αντί να
// το κάνει μέσα από το Supabase table editor). Ίδιο μοτίβο ασφάλειας/δομής
// με useCreateEvent.js: RLS policies στο migration
// 20260920080000_add_products_admin_write.sql (μόνο admin ΤΟΥ
// συγκεκριμένου tenant μπορεί να γράψει), slug ΑΥΤΟΜΑΤΟ από trigger
// (set_product_slug, βλ. migration 20260906075738) — ΔΕΝ το στέλνουμε
// καθόλου εδώ.
//
// Δύο διαδοχικά inserts όταν υπάρχουν μεγέθη (products, μετά
// product_variants) — το Supabase JS client δεν κάνει multi-table
// transactions από τον browser. Αν αποτύχει το insert των variants,
// διαγράφουμε το μόλις-δημιουργηθέν product ώστε να μη μείνει "ορφανό"
// προϊόν ρούχου χωρίς κανένα μέγεθος στη βάση.
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, values, imageUrls }) => {
      // sort_order: μετά το τελευταίο ήδη υπάρχον προϊόν αυτού του tenant
      // (τα νέα προϊόντα εμφανίζονται στο τέλος της λίστας — ο admin δεν
      // έχει ζητήσει ακόμα δυνατότητα αναδιάταξης).
      const { data: lastProduct } = await supabase
        .from("products")
        .select("sort_order")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()
      const nextSortOrder = (lastProduct?.sort_order ?? -1) + 1

      const isClothing = values.category === "clothing"

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          tenant_id: tenantId,
          name: values.name,
          description: values.description || null,
          category: values.category,
          price: values.price,
          // Ρούχα με πραγματικά μεγέθη: το αθροιστικό απόθεμα υπολογίζεται
          // από τα product_variants (βλ. lib/stockTiers.js, getTotalStock)
          // — το products.stock_quantity μένει 0, δεν χρησιμοποιείται.
          stock_quantity: isClothing ? 0 : (values.stock_quantity ?? 0),
          image_urls: imageUrls,
          is_active: true,
          sort_order: nextSortOrder,
          // 20/9, ρητό αίτημα χρήστη -- βλ. πλήρες σχόλιο στο
          // ProductFormPage.jsx/migration 20260920090000_add_products_scheduling.sql.
          is_new_arrival: values.is_new_arrival ?? false,
          available_from: values.available_from ?? null,
        })
        .select()
        .single()

      if (productError) throw productError

      if (isClothing && values.variants?.length) {
        const variantRows = values.variants.map((v) => ({
          product_id: product.id,
          size: v.size,
          stock_quantity: v.stock_quantity,
        }))

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantRows)

        if (variantsError) {
          await supabase.from("products").delete().eq("id", product.id)
          throw variantsError
        }
      }

      return product
    },
    onSuccess: (_product, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.tenantId] })
    },
  })
}
