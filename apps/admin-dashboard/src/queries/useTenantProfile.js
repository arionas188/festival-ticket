import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Διαβάζει τα τρέχοντα στοιχεία ενός tenant, για να γεμίσουν η φόρμα
// επεξεργασίας. Public read (ίδιο RLS με το tenant-site) — το access
// control εδώ είναι στο WRITE, όχι στο READ (βλ. useUpdateTenantProfile).
export function useTenantProfile(tenantId) {
  return useQuery({
    queryKey: ["tenant_profile", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_settings")
        .select("bio, logo_url, cover_image_url, updated_at")
        .eq("tenant_id", tenantId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
