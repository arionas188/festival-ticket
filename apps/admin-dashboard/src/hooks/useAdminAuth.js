import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

// Ίδιο pattern με apps/tenant-site/src/hooks/useAuth.js — ίδιο Supabase
// Auth session (μοιρασμένο μέσω cookieStorage, βλ. packages/shared),
// οπότε ένας χρήστης που είναι ήδη συνδεδεμένος σε ένα tenant site
// εμφανίζεται ήδη συνδεδεμένος και εδώ. Το ΑΝ επιτρέπεται να διαχειριστεί
// κάτι είναι ξεχωριστό ερώτημα (βλ. useMyAdminTenants) — αυτό το hook
// απαντάει μόνο "ποιος είσαι".
export function useAdminAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (session && window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    isLoading: session === undefined,
    isLoggedIn: !!session,
  }
}
