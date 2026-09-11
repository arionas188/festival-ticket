import { supabase } from "../lib/supabase"

// Το πραγματικό sync/upsert έγινε server-side (9/9) — βλ. migration
// 20260909110000_encrypt_all_fan_personal_fields.sql,
// sync_own_fan_from_auth(). Το email/full_name/avatar_url είναι πλέον
// κρυπτογραφημένα (fan_private_details), όχι plaintext στήλες στο fans,
// οπότε το encrypt πρέπει να γίνει ΜΕΣΑ στη function (η οποία ξέρει το
// Vault key) — ο client απλά στέλνει τα raw δεδομένα από το Google
// user_metadata μέσω RPC, ποτέ δεν τα γράφει ο ίδιος στη βάση.
// Η ίδια η function αποφασίζει αν θα αγνοήσει full_name/avatar_url όταν
// ο fan έχει κάνει profile_customized (βλ. σχόλιο εκεί) — η λογική
// isCustomized που ήταν εδώ πριν μετακόμισε server-side μαζί με αυτήν.
export async function syncFanFromAuth(user) {
  return supabase.rpc("sync_own_fan_from_auth", {
    p_email: user.email,
    p_full_name: user.user_metadata?.full_name || user.user_metadata?.name,
    p_avatar_url: user.user_metadata?.avatar_url,
  })
}
