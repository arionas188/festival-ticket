import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Το ΠΡΑΓΜΑΤΙΚΟ write — αυτό δοκιμάζει ολόκληρο το σύστημα δικαιωμάτων:
// login → tenant_admins (RLS SELECT policy) → αυτό εδώ UPDATE, που το
// RLS write policy πάνω στο tenant_settings επιτρέπει/απορρίπτει με
// βάση ΑΚΡΙΒΩΣ το tenant_admins. Αν ο χρήστης δεν είναι admin αυτού του
// tenant, η Supabase επιστρέφει 0 affected rows (silent, όχι error) —
// το error handling παρακάτω το πιάνει ρητά.
export function useUpdateTenantProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, values }) => {
      const { data, error } = await supabase
        .from("tenant_settings")
        .update(values)
        .eq("tenant_id", tenantId)
        .select()

      if (error) throw error
      // RLS απέρριψε σιωπηλά (δεν είσαι admin αυτού του tenant) — 0 γραμμές
      // επιστράφηκαν αντί για error. Το κάνουμε ρητό error εδώ.
      if (data.length === 0) {
        throw new Error("Δεν επιτρέπεται η επεξεργασία αυτού του tenant.")
      }
      return data[0]
    },
    onSuccess: (_data, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ["my_admin_tenants"] })
      queryClient.invalidateQueries({ queryKey: ["tenant_profile", tenantId] })
    },
  })
}
