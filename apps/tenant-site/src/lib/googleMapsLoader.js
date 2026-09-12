// Επίσημος "dynamic library import" bootstrap loader της Google (Maps
// JavaScript API docs, https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)
// — φορτώνει το Maps JS API ΜΙΑ φορά συνολικά (idempotent ακόμα κι αν
// κληθεί πολλές φορές) και ΜΟΝΟ όταν χρειαστεί πραγματικά: καλείται lazy
// από το LocationPickerDialog όταν ανοίγει, όχι σε κάθε φόρτωση σελίδας
// (13/9, βλ. concerto-brief.md).
//
// Μοντέλο ασφαλείας (ρητή απαίτηση χρήστη — "να μην έχουμε κενό
// ασφαλείας"): αυτό το API key ΕΙΝΑΙ σκόπιμα ορατό στον browser — έτσι
// δουλεύει εγγενώς κάθε client-side Google Maps ενσωμάτωση, δεν είναι
// bug. Η προστασία ΔΕΝ είναι μυστικότητα του key, είναι δύο περιορισμοί
// πάνω στο ίδιο το key, μέσα στο Google Cloud Console (βλ. οδηγίες
// χρήστη): (1) HTTP referrer restriction — μόνο τα domains μας
// (concerto.gr subdomains, localhost dev) επιτρέπεται να το
// χρησιμοποιήσουν· (2) API restriction — το key δουλεύει ΜΟΝΟ για Maps
// JavaScript API + Places API (New), τίποτα άλλο. Αυτό είναι η επίσημη,
// τεκμηριωμένη πρακτική της Google για ακριβώς αυτή την περίπτωση.
let loaderPromise = null

export function loadGoogleMapsPlaces() {
  if (loaderPromise) return loaderPromise

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Λείπει το VITE_GOOGLE_MAPS_API_KEY — πρόσθεσέ το στο .env (βλ. concerto-brief.md).",
      ),
    )
  }

  loaderPromise = (async () => {
    // Επίσημο inline bootstrap snippet της Google — ρυθμίζει
    // window.google.maps.importLibrary συγχρονισμένα (η ίδια η φόρτωση
    // του script γίνεται async μέσα του). Αντιγραμμένο αυτούσιο από τα
    // επίσημα docs, όχι δική μας εκδοχή.
    ;(g => {
      var h, a, k, p = "The Google Maps JavaScript API",
        c = "google", l = "importLibrary", q = "__ib__",
        m = document, b = window
      b = b[c] || (b[c] = {})
      var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(),
        // Αυτούσιο επίσημο snippet της Google, όχι δικός μας κώδικας.
        // eslint-disable-next-line no-async-promise-executor
        u = () => h || (h = new Promise(async (f, n) => {
          await (a = m.createElement("script"))
          e.set("libraries", [...r] + "")
          for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k])
          e.set("callback", c + ".maps." + q)
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e
          d[q] = f
          a.onerror = () => h = n(Error(p + " could not load."))
          a.nonce = m.querySelector("script[nonce]")?.nonce || ""
          m.head.append(a)
        }))
      d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
    })({ key: apiKey, v: "weekly" })

    return window.google.maps.importLibrary("places")
  })()

  return loaderPromise
}
