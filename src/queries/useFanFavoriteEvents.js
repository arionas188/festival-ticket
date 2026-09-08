import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Fan Dashboard → "Αγαπημένα events": συγκεντρωτικά, από ΟΛΟΥΣ τους tenants,
// με badge "άλλαξε" αν title/date διαφέρουν από το snapshot που κρατήθηκε τη
// στιγμή του favorite (βλ. event_favorites migration + useEventFavorites.js).
export function useFanFavoriteEvents(fanId) {
  return useQuery({
    queryKey: ["fan_favorite_events", fanId],
    queryFn: async () => {
      const { data: favRows, error: favError } = await supabase
        .from("event_favorites")
        .select("event_id, snapshot_title, snapshot_date")
        .eq("fan_id", fanId)
      if (favError) throw favError

      const eventIds = favRows.map((r) => r.event_id)
      if (eventIds.length === 0) return []

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date, image_url, tenant_id")
        .in("id", eventIds)
      if (eventsError) throw eventsError

      const tenantIds = [...new Set(events.map((e) => e.tenant_id))]

      const { data: settingsRows, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("tenant_id, display_name, logo_url")
        .in("tenant_id", tenantIds)
      if (settingsError) throw settingsError

      const { data: domainRows, error: domainsError } = await supabase
        .from("tenant_domains")
        .select("tenant_id, domain")
        .in("tenant_id", tenantIds)
      if (domainsError) throw domainsError

      return events.map((event) => {
        const favRow = favRows.find((r) => r.event_id === event.id)
        const settings = settingsRows.find((s) => s.tenant_id === event.tenant_id)
        const domainRow = domainRows.find((d) => d.tenant_id === event.tenant_id)
        const changed =
          !!favRow &&
          (favRow.snapshot_title !== event.title ||
            new Date(favRow.snapshot_date).getTime() !== new Date(event.date).getTime())

        return {
          eventId: event.id,
          title: event.title,
          date: event.date,
          imageUrl: event.image_url,
          tenantName: settings?.display_name,
          tenantLogoUrl: settings?.logo_url,
          domain: domainRow?.domain,
          changed,
        }
      })
    },
    enabled: !!fanId,
  })
}
