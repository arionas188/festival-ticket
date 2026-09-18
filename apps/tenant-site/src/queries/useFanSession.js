import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"
import { syncFanFromAuth } from "./syncFanFromAuth"

// BUG FIX (8/9): πριν, το ίδιο το visit μιας tenant σελίδας ενώ ήσουν
// συνδεδεμένος έκανε ΑΥΤΟΜΑΤΑ follow — silent upsert στο tenant_follows,
// χωρίς ο fan να πατήσει ποτέ "Ακολούθησε". Ο χρήστης το επιβεβαίωσε ως
// bug: θέλει το follow ρητό, ανά tenant, μόνο όταν πατηθεί το κουμπί —
// το login (global) ξεκλειδώνει search/favorite/καλάθι σε ΚΑΘΕ tenant,
// αλλά ΔΕΝ σημαίνει αυτόματα ότι τον ακολουθεί. Το ίδιο localStorage flag
// (followed_tenant_...) αφαιρέθηκε εντελώς — δεν πρέπει να "θυμάται"
// κατάσταση follow μετά από logout, το isFollowing πρέπει να προκύπτει
// πάντα ζωντανά από τη βάση. Βλ. και useFollowTenant παρακάτω και το
// (αφαιρεμένο) useFollowAllTenants.js.
// 18/9: κωδικοί σφάλματος που σημαίνουν "το session αυτής της συσκευής
// είναι στην πραγματικότητα άκυρο/σπασμένο", όχι ένα κανονικό, ανακτήσιμο
// error — σε όλες αυτές τις περιπτώσεις ο σωστός χειρισμός είναι local
// sign-out (καθάρισμα μόνο στη συσκευή, καμία server-side ενέργεια), ώστε
// ο fan να ξαναγίνεται "επισκέπτης" και να μπορεί να ξανακάνει σύνδεση
// καθαρά, αντί να μένει κολλημένος με σπασμένα requests σε κάθε φόρτωση.
function isBrokenSessionError(error) {
  return (
    // foreign key violation: το auth.users row αυτού του session δεν
    // υπάρχει πια (π.χ. ο λογαριασμός διαγράφηκε από άλλο subdomain/tab).
    error.code === "23503" ||
    // not-null violation στο fans.id: σημαίνει ότι το auth.uid() γύρισε
    // null μέσα στην function — το request έφτασε με ένα token που δεν
    // αντιστοιχεί πια σε έγκυρο, ενεργό session (π.χ. ήδη χρησιμοποιημένο/
    // ληγμένο refresh token — αυτό ήταν η αιτία των δύο 400 σφαλμάτων
    // που ανέφερε ο χρήστης στο concertofamily.netlify.app).
    error.code === "23502" ||
    // PostgREST's δικοί του κωδικοί για ληγμένο/άκυρο JWT.
    error.code === "PGRST301" ||
    error.code === "PGRST303"
  )
}

export function useFanSession(user, tenantId) {
  return useQuery({
    queryKey: ["fan_session", user?.id, tenantId],
    queryFn: async () => {
      const { error: fanError } = await syncFanFromAuth(user)
      if (fanError) {
        // scope:"local" καθαρίζει μόνο το τοπικό storage — δεν χρειάζεται/
        // δεν έχει νόημα server call, ο server δεν έχει πια τίποτα έγκυρο
        // να ακυρώσει γι' αυτό το session.
        if (isBrokenSessionError(fanError)) {
          await supabase.auth.signOut({ scope: "local" })
        }
        throw fanError
      }

      const { data, error: followError } = await supabase
        .from("tenant_follows")
        .select("fan_id")
        .eq("fan_id", user.id)
        .eq("tenant_id", tenantId)
        .maybeSingle()
      if (followError) throw followError

      return !!data
    },
    enabled: !!user?.id && !!tenantId,
  })
}

// Ρητό follow — καλείται ΜΟΝΟ από το κλικ στο "Ακολούθησε" (Header.jsx),
// ποτέ αυτόματα.
export function useFollowTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fanId, tenantId }) => {
      const { error } = await supabase.from("tenant_follows").upsert(
        { fan_id: fanId, tenant_id: tenantId },
        { onConflict: "fan_id,tenant_id", ignoreDuplicates: true }
      )
      if (error) throw error
    },
    onSuccess: (_data, { fanId, tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ["fan_session", fanId, tenantId] })
      queryClient.invalidateQueries({ queryKey: ["fan_tenants", fanId] })
    },
  })
}
