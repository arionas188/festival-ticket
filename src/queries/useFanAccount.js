import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Το προφίλ του fan όπως είναι ΑΠΟΘΗΚΕΥΜΕΝΟ στη βάση (fans table) — όχι το
// Google user_metadata απευθείας, γιατί μετά την πρώτη επεξεργασία μπορεί
// να διαφέρουν σκόπιμα (βλ. profile_customized, syncFanFromAuth.js).
// Χρησιμοποιείται και από το ConcertoBar (badge/κόκκινο "Προφίλ") και από
// το FanProfileRoute (φόρμα).
export function useFanAccount(fanId) {
  return useQuery({
    queryKey: ["fan_account", fanId],
    queryFn: async () => {
      // maybeSingle, όχι single: στο ΠΡΩΤΟ login ενός νέου fan υπάρχει race
      // με το fans upsert (syncFanFromAuth.js, μέσω useFanSession.js στο
      // Header) — το row μπορεί να μην υπάρχει ακόμα τη στιγμή που φορτώνει
      // το ConcertoBar. null είναι έγκυρη, αναμενόμενη απάντηση εδώ, όχι σφάλμα.
      const { data, error } = await supabase
        .from("fans")
        .select("full_name, avatar_url, profile_customized")
        .eq("id", fanId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!fanId,
  })
}

export function useUpdateFanProfile(fanId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fullName }) => {
      const { error } = await supabase
        .from("fans")
        .update({ full_name: fullName, profile_customized: true })
        .eq("id", fanId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan_account", fanId] })
    },
  })
}
