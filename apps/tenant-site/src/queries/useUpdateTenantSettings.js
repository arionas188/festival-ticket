import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Inline admin-editing πάνω στο ίδιο το δημόσιο site (12/9) — ίδιο write
// με το apps/admin-dashboard/src/queries/useUpdateTenantProfile.js, ίδιο
// RLS write policy πάνω στο tenant_settings (μόνο πραγματικός admin αυτού
// του tenant μπορεί να γράψει, βλ. tenant_admins migration). 0 γραμμές
// επιστράφηκαν = το RLS απέρριψε σιωπηλά, το κάνουμε ρητό error.
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, values }) => {
      const { data, error } = await supabase
        .from("tenant_settings")
        .update(values)
        .eq("tenant_id", tenantId)
        .select()

      if (error) throw error
      if (data.length === 0) {
        throw new Error("Δεν επιτρέπεται η επεξεργασία αυτού του tenant.")
      }
      return data[0]
    },
    onSuccess: () => {
      // Ξαναφέρνει tenant+settings (useTenant, queryKey ['tenant', domain])
      // ώστε η αλλαγή να φανεί αμέσως στο ίδιο site, χωρίς refresh.
      queryClient.invalidateQueries({ queryKey: ["tenant"] })
    },
  })
}
