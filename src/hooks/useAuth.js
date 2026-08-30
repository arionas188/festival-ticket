import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      // Καθάρισε το access_token από το URL μόλις γίνει parse
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return {
    session,
    user: session?.user ?? null,
    isLoading: session === undefined,
    isLoggedIn: !!session,
  }
}