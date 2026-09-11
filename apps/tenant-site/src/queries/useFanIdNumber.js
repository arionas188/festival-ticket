import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// FanIdCard.jsx (test/demo, 8/9): αριθμός "ταυτότητας" βάσει σειράς
// εγγραφής στο global Concerto (π.χ. 00004 = ο 4ος fan που γράφτηκε ΠΟΤΕ
// στην πλατφόρμα, ανεξαρτήτου tenant). Ρητά μόνο για UI/demo — δεν είναι
// επίσημο, σταθερό μητρώο (βλ. migration 20260908140000 για το γιατί).
//
// RPC αντί για client-side count query: το fans table έχει RLS (μόνο η
// δική σου γραμμή ορατή), οπότε ένα cross-row count από τον client θα
// γύριζε πάντα 1. Το get_own_fan_id_number() (βλ. migration 20260908150000)
// τρέχει server-side με SECURITY DEFINER και επιστρέφει μόνο τον ακέραιο —
// καμία διαρροή δεδομένων άλλου fan.
export function useFanIdNumber(fanId) {
  return useQuery({
    queryKey: ["fan_id_number", fanId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_own_fan_id_number")
      if (error) throw error
      return data
    },
    enabled: !!fanId,
  })
}
