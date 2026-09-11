import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuth() {
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

    // Bfcache fix: όταν ο browser επαναφέρει παγωμένο στιγμιότυπο (π.χ. με back/forward),
    // ξανάλεγξε το πραγματικό, τρέχον session αντί να εμπιστευτείς το παγωμένο React state.
    function handlePageShow(event) {
      if (event.persisted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
        })
      }
    }
    window.addEventListener("pageshow", handlePageShow)

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener("pageshow", handlePageShow)
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    isLoading: session === undefined,
    isLoggedIn: !!session,
  }
}