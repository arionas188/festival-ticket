import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import EventsList from "./EventsList"

export default function EkdiloseisNew({ tenantId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: true })

      if (error) {
        console.error("Events fetch error:", error)
      } else {
        setEvents(data)
      }
      setLoading(false)
    }

    if (tenantId) fetchEvents()
  }, [tenantId])

  if (loading) return <p>Φόρτωση events...</p>

  if (events.length === 0) {
    return <p>Δεν υπάρχουν events αυτή τη στιγμή.</p>
  }

  return <EventsList events={events} />
}