// Στατική εικόνα χάρτη (Google Static Maps API) — προεπισκόπηση της
// επιλεγμένης τοποθεσίας event, ώστε ο admin να είναι σίγουρος ότι
// βρήκε το σωστό σημείο πριν αποθηκεύσει (13/9, ρητό αίτημα χρήστη).
//
// ΔΕΝ χρειάζεται νέο geocoding call — τα lat/lng είναι ήδη αποθηκευμένα
// στη φόρμα από το Google Places picker (βλ. handleLocationSelected στο
// EventFormPage.jsx). ΑΛΛΑ προσοχή: η ίδια η εικόνα χάρτη είναι ξεχωριστό
// προϊόν μέσα στο Google Maps Platform ("Maps Static API"), ΟΧΙ μέρος
// του ήδη φορτωμένου Places script — ξεχωριστό, χρεώσιμο billing SKU.
// Χρειάζεται το "Maps Static API" ενεργοποιημένο για το ίδιο key στο
// Google Cloud Console (ίδιο key με το Places, βλ. googleMapsLoader.js) —
// χωρίς αυτό, η εικόνα θα δείχνει σπασμένη.
export default function LocationMapPreview({ latitude, longitude, className = "" }) {
  if (latitude == null || longitude == null) return null

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: "15",
    size: "600x240",
    scale: "2",
    markers: `color:0x111827|${latitude},${longitude}`,
    key: apiKey || "",
  })

  return (
    <img
      alt="Προεπισκόπηση τοποθεσίας στον χάρτη"
      src={`https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`}
      className={`h-40 w-full rounded-md object-cover ${className}`}
    />
  )
}
