import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    console.log("🔵 [useAuth] mount, calling getSession()")

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🔵 [useAuth] getSession resolved:", session ? "SESSION OK" : "NULL")
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔵 [useAuth] onAuthStateChange event:", event, session ? "SESSION OK" : "NULL")

      setSession(session)

      if (session && window.location.hash.includes("access_token")) {
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