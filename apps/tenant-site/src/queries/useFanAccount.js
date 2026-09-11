import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Το προφίλ του fan όπως είναι ΑΠΟΘΗΚΕΥΜΕΝΟ στη βάση — μέσω RPC
// (get_own_fan_identity), γιατί το full_name/avatar_url είναι
// κρυπτογραφημένα στο fan_private_details, όχι plain στήλες στο fans.
// full_name/avatar_url εδώ ΑΥΤΟΜΑΤΑ συγχρονισμένα από το Google
// (syncFanFromAuth.js, σε κάθε login) — ΞΕΧΩΡΙΣΤΑ από τα πραγματικά
// first_name/last_name/display_name που ορίζει ο ίδιος ο fan μέσω της
// πλήρους φόρμας (βλ. useFanFullProfile.js). Χρησιμοποιείται από το
// ConcertoBar (badge/κόκκινο "Προφίλ", μέσω profile_customized) και το
// FanProfileRoute (avatar στο FanIdCard, κόκκινο banner).
//
// Το write path (useUpdateFanProfile / set_own_fan_full_name) αφαιρέθηκε
// (9/9) — αντικαταστάθηκε από useUpdateFanFullProfile
// (set_own_fan_full_profile), μία ενιαία save για ΟΛΗ τη φόρμα προφίλ.
// Η function set_own_fan_full_name παραμένει στη βάση (καμία βλάβη),
// απλά δεν την καλεί πια ο client.
export function useFanAccount(fanId) {
  return useQuery({
    queryKey: ["fan_account", fanId],
    queryFn: async () => {
      // Η RPC επιστρέφει 0 γραμμές αν δεν υπάρχει ακόμα fans row (πρώτο
      // login, sync σε εξέλιξη) — [0] ?? null διατηρεί το maybeSingle-like
      // null εδώ.
      const { data, error } = await supabase.rpc("get_own_fan_identity")
      if (error) throw error
      return data?.[0] ?? null
    },
    enabled: !!fanId,
  })
}
