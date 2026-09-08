import { supabase } from "../lib/supabase"

// Κοινή λογική ανάμεσα σε useFanSession.js και useFollowAllTenants.js —
// και τα δύο έκαναν το ίδιο upsert στο fans πριν, ο καθένας με δικό του
// αντίγραφο κώδικα. Ενοποιήθηκε εδώ (8/9) γιατί προστέθηκε μια δεύτερη
// συνθήκη: κάθε login συγχρόνιζε ΑΝΕΥ ΟΡΩΝ full_name/avatar_url από το
// Google user_metadata — αν ο fan έχει επεξεργαστεί μόνος του το προφίλ
// του (Fan Dashboard → Προφίλ, fans.profile_customized = true), δεν πρέπει
// να το ξαναγράφουμε πάνω από τη δική του αλλαγή στο επόμενο login του.
// Βλ. concerto-react-router-brief.md, "Fan Dashboard".
export async function syncFanFromAuth(user) {
  const { data: existingFan } = await supabase
    .from("fans")
    .select("profile_customized")
    .eq("id", user.id)
    .maybeSingle()

  const isCustomized = existingFan?.profile_customized === true

  const payload = isCustomized
    ? { id: user.id, email: user.email }
    : {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
      }

  return supabase.from("fans").upsert(payload, { onConflict: "id" })
}
