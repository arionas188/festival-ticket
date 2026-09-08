import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Fan Dashboard → "Αγαπημένα merch": συγκεντρωτικά, από ΟΛΟΥΣ τους tenants —
// τρία διαδοχικά queries, ίδιο στυλ με useFanTenants.js/useTenant.js (όχι
// nested embed — βλ. εκεί το γιατί).
export function useFanFavoriteMerch(fanId) {
  return useQuery({
    queryKey: ["fan_favorite_merch", fanId],
    queryFn: async () => {
      const { data: favRows, error: favError } = await supabase
        .from("favorites")
        .select("product_id, price_at_favorite")
        .eq("fan_id", fanId)
      if (favError) throw favError

      const productIds = favRows.map((r) => r.product_id)
      if (productIds.length === 0) return []

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, image_urls, tenant_id")
        .in("id", productIds)
      if (productsError) throw productsError

      const tenantIds = [...new Set(products.map((p) => p.tenant_id))]

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

      return products.map((product) => {
        const favRow = favRows.find((r) => r.product_id === product.id)
        const settings = settingsRows.find((s) => s.tenant_id === product.tenant_id)
        const domainRow = domainRows.find((d) => d.tenant_id === product.tenant_id)
        const priceAtFavorite = favRow?.price_at_favorite

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_urls?.[0],
          tenantName: settings?.display_name,
          tenantLogoUrl: settings?.logo_url,
          domain: domainRow?.domain,
          priceDropped:
            priceAtFavorite != null && Number(product.price) < Number(priceAtFavorite),
          priceAtFavorite,
        }
      })
    },
    enabled: !!fanId,
  })
}
