import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

const EMPTY_PROFILE = {
  first_name: null,
  last_name: null,
  display_name: null,
  phone: null,
  date_of_birth: null,
  city: null,
  favorite_genres: [],
  favorite_tenant_ids: [],
}

// Πλήρες, επεξεργάσιμο προφίλ fan — Όνομα/Επίθετο/Display name/Τηλέφωνο/
// Ημ. γέννησης/Πόλη (κρυπτογραφημένα) + Αγαπημένα είδη μουσικής/Αγαπημένα
// tenants (απλά). ΞΕΧΩΡΙΣΤΟ από useFanAccount (full_name/avatar_url
// auto-synced από Google, βλ. εκεί) — αυτό εδώ είναι η "πλήρης φόρμα" που
// συμπληρώνει ο ίδιος ο fan, μέσω RPC (get/set_own_fan_full_profile, βλ.
// migrations 20260909120000/20260909130000).
export function useFanFullProfile(fanId) {
  return useQuery({
    queryKey: ["fan_full_profile", fanId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_own_fan_full_profile")
      if (error) throw error
      return data?.[0] ?? EMPTY_PROFILE
    },
    enabled: !!fanId,
  })
}

export function useUpdateFanFullProfile(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values) => {
      const { error } = await supabase.rpc("set_own_fan_full_profile", {
        p_first_name: values.firstName || null,
        p_last_name: values.lastName || null,
        p_display_name: values.displayName || null,
        p_phone: values.phone || null,
        p_date_of_birth: values.dateOfBirth || null,
        p_city: values.city || null,
        p_favorite_genres: values.favoriteGenres || [],
        p_favorite_tenant_ids: values.favoriteTenantIds || [],
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan_full_profile", fanId] })
      // profile_customized άλλαξε σε true μέσα στην RPC — ενημέρωσε και το
      // useFanAccount (τροφοδοτεί το κόκκινο badge στο ConcertoBar).
      queryClient.invalidateQueries({ queryKey: ["fan_account", fanId] })
    },
  })
}

// Live έλεγχος διαθεσιμότητας display name (debounced στο component, βλ.
// FanProfileRoute.jsx) — ΟΧΙ useQuery/useMutation, απλή async function,
// γιατί καλείται χειροκίνητα μέσα σε ένα δικό μας debounce effect, όχι σε
// React Query lifecycle. Best-effort/UX μόνο· η πραγματική εγγύηση
// (server-side re-check) είναι ΜΕΣΑ στο set_own_fan_full_profile.
export async function checkDisplayNameAvailable(displayName) {
  const { data, error } = await supabase.rpc("check_own_display_name_available", {
    p_display_name: displayName,
  })
  if (error) throw error
  return data
}
