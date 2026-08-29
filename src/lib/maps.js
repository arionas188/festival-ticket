export function getMapsUrl(event) {
  if (event?.location_url) return event.location_url

  const destination = event?.location || event?.title || ''
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
