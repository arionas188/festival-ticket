import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Fan Dashboard → "Τρέχον καλάθι": συγκεντρωτικά, ΑΝΑ tenant, από ΟΛΟΥΣ
// τους tenants όπου ο fan έχει κάτι στο καλάθι του — ίδιο στυλ διαδοχικών
// queries με useFanFavoriteMerch.js/useFanTenants.js (όχι nested embed,
// βλ. εκεί για το γιατί).
//
// Read-only εδώ, ΕΠΙΤΗΔΕΣ: η μεταβολή ποσότητας/αφαίρεση γίνεται ήδη μέσα
// από το CartDialog.jsx πάνω στο κάθε tenant ξεχωριστά (useCart.js, με το
// πραγματικό adjust_cart_quantity RPC) — δεν αναδημιουργείται εδώ η ίδια
// λογική, το group κάθε tenant έχει link πίσω στο ίδιο το tenant.
export function useFanCart(fanId) {
  return useQuery({
    queryKey: ["fan_cart", fanId],
    queryFn: async () => {
      const { data: cartRows, error: cartError } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, variant_id, tenant_id")
        .eq("fan_id", fanId)
      if (cartError) throw cartError
      if (cartRows.length === 0) return []

      const productIds = [...new Set(cartRows.map((r) => r.product_id))]
      const tenantIds = [...new Set(cartRows.map((r) => r.tenant_id))]
      // 22/9, bug fix (React "duplicate key" warning, ρητή αναφορά χρήστη):
      // χρειάζεται και το μέγεθος εδώ, ίδιο μοτίβο με useCart.js -- βλ.
      // παρακάτω γιατί.
      const variantIds = [...new Set(cartRows.map((r) => r.variant_id).filter(Boolean))]

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, image_urls")
        .in("id", productIds)
      if (productsError) throw productsError

      // Άδειο array όταν δεν υπάρχει κανένα variant_id -- το .in() με άδειο
      // array θα επέστρεφε 0 γραμμές ούτως ή άλλως, αλλά το προσπερνάμε
      // ρητά για να μην κάνουμε περιττό query.
      let variants = []
      if (variantIds.length > 0) {
        const { data: variantRows, error: variantsError } = await supabase
          .from("product_variants")
          .select("id, size")
          .in("id", variantIds)
        if (variantsError) throw variantsError
        variants = variantRows
      }

      const { data: settingsRows, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("tenant_id, display_name, logo_url")
        .in("tenant_id", tenantIds)
      if (settingsError) throw settingsError

      const { data: domainRows, error: domainsError } = await supabase
        .from("tenant_domains")
        .select("tenant_id, domain")
        .in("tenant_id", tenantIds)
      if (domainsError) throw domainsError

      return tenantIds.map((tenantId) => {
        const settings = settingsRows.find((s) => s.tenant_id === tenantId)
        const domainRow = domainRows.find((d) => d.tenant_id === tenantId)

        // BUG FIX (22/9, ρητή αναφορά χρήστη -- React error "two children
        // with the same key"): πριν δεν περνούσε ΚΑΘΟΛΟΥ το row.id εδώ, οπότε
        // το FanCurrentCartRoute.jsx αναγκαστικά έκανε key={product.id} --
        // αν ο fan έχει προσθέσει το ΙΔΙΟ προϊόν σε 2 διαφορετικά μεγέθη
        // (2 ξεχωριστές γραμμές cart_items, ίδιο product_id), προέκυπταν
        // δύο <li> με το ΙΔΙΟ key. Τώρα κάθε item κουβαλάει το δικό του
        // cart_items id (μοναδικό ΠΑΝΤΑ) -- βλ. FanCurrentCartRoute.jsx.
        const items = cartRows
          .filter((row) => row.tenant_id === tenantId)
          .map((row) => ({
            id: row.id,
            product: products.find((p) => p.id === row.product_id),
            variant: row.variant_id ? variants.find((v) => v.id === row.variant_id) : null,
            quantity: row.quantity,
          }))
          .filter((item) => item.product)

        const subtotal = items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        )

        return {
          tenantId,
          tenantName: settings?.display_name,
          tenantLogoUrl: settings?.logo_url,
          domain: domainRow?.domain,
          items,
          subtotal,
        }
      })
    },
    enabled: !!fanId,
  })
}
