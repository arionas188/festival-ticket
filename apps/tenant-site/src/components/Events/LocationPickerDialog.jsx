import { useEffect, useRef, useState } from "react"
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { loadGoogleMapsPlaces } from "../../lib/googleMapsLoader"

// Επιλογή τοποθεσίας event μέσω πραγματικής αναζήτησης Google Maps (13/9,
// ρητό αίτημα χρήστη) — αντί να γράφει ο admin ελεύθερο κείμενο, ψάχνει
// το πραγματικό μαγαζί/χώρο και επιλέγει από τα αποτελέσματα της Google.
// Κρατάμε ΚΑΙ τη μορφοποιημένη διεύθυνση (location) ΚΑΙ το πραγματικό
// Google Maps link του συγκεκριμένου μέρους (locationUrl,
// place.googleMapsURI) — το ίδιο ζευγάρι στηλών που ήδη διαβάζει το
// lib/maps.js (getMapsUrl) για το κουμπί "Location" στο EventsList.
//
// 12/9 (ρητό αίτημα χρήστη, με screenshots): το επίσημο web component
// PlaceAutocompleteElement έχει ΔΙΚΟ ΤΟΥ, μη-στυλιζόμενο dropdown που σε
// mobile ανοίγει σαν ξεχωριστή full-screen σκούρα οθόνη (native-looking
// Google overlay) αντί να εμφανίζει τα αποτελέσματα μέσα στο ίδιο μας το
// dialog — μπερδεύει τον χρήστη ("δεύτερη φωτογραφία"). Λύση: δεν
// χρησιμοποιούμε το widget UI καθόλου· καλούμε απευθείας το προγραμματικό
// AutocompleteSuggestion.fetchAutocompleteSuggestions() (επίσημο, μη
// deprecated API — Places API New, βλ. docs "Place Autocomplete Data API")
// και ζωγραφίζουμε τη δική μας λίστα αποτελεσμάτων, ίδιο look-and-feel με
// το υπόλοιπο app (ίδιο pattern με το custom Combobox).
export default function LocationPickerDialog({ open, onOpenChange, onSelect }) {
  const [placesLib, setPlacesLib] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const sessionTokenRef = useRef(null)
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  // Φόρτωση της βιβλιοθήκης "places" + φρέσκο session token σε κάθε
  // άνοιγμα του dialog (ένα session token ανά "αναζήτηση μέχρι επιλογή",
  // όπως προτείνει η Google για σωστή χρέωση).
  useEffect(() => {
    if (!open) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)
    setLoading(true)
    setQuery("")
    setSuggestions([])

    loadGoogleMapsPlaces()
      .then((lib) => {
        if (cancelled) return
        setPlacesLib(lib)
        sessionTokenRef.current = new lib.AutocompleteSessionToken()
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open])

  // Debounced αναζήτηση προτάσεων καθώς γράφει ο admin.
  useEffect(() => {
    if (!placesLib || !query.trim()) {
      // Καθαρισμός παλιών αποτελεσμάτων όταν αδειάζει το πεδίο — έγκυρη
      // χρήση effect (εξαρτάται από το εξωτερικό placesLib), ίδιο pattern
      // με το reset στο effect του "open" παραπάνω.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current
      setSearching(true)
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            sessionToken: sessionTokenRef.current,
            language: "el",
          })
        // Αγνόησε απάντηση από παλιότερο, ήδη ξεπερασμένο αίτημα (ο admin
        // έγραψε γρηγορότερα από όσο πρόλαβαν να γυρίσουν τα αποτελέσματα).
        if (requestId !== requestIdRef.current) return
        setSuggestions(results || [])
      } catch {
        if (requestId !== requestIdRef.current) return
        setError("Κάτι πήγε στραβά με την αναζήτηση. Δοκίμασε ξανά.")
      } finally {
        if (requestId === requestIdRef.current) setSearching(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query, placesLib])

  async function handlePick(suggestion) {
    try {
      const place = suggestion.placePrediction.toPlace()
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "googleMapsURI", "location"],
      })
      onSelect({
        location: place.formattedAddress || place.displayName || "",
        locationUrl: place.googleMapsURI || "",
        latitude: place.location ? place.location.lat() : null,
        longitude: place.location ? place.location.lng() : null,
      })
      onOpenChange(false)
      // Νέο session token — το προηγούμενο "κλείνει" με αυτή την επιλογή.
      if (placesLib) sessionTokenRef.current = new placesLib.AutocompleteSessionToken()
    } catch {
      setError("Κάτι πήγε στραβά με την επιλογή. Δοκίμασε ξανά.")
    }
  }

  const showNoResults =
    !loading && !searching && query.trim().length > 0 && suggestions.length === 0 && !error

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Αναζήτηση τοποθεσίας</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Γράψε το όνομα του χώρου (π.χ. «Gazarte») και επίλεξέ το από τη
            λίστα.
          </p>

          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση τοποθεσίας..."
              disabled={loading}
              className="pl-8"
            />
          </div>

          {(loading || searching) && (
            <p className="text-sm text-muted-foreground">Φόρτωση...</p>
          )}

          {suggestions.length > 0 && (
            <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={s.placePrediction.placeId ?? i}>
                  <button
                    type="button"
                    onClick={() => handlePick(s)}
                    className="w-full rounded-md p-2.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <p className="font-medium text-foreground">
                      {s.placePrediction.mainText?.text || s.placePrediction.text.text}
                    </p>
                    {s.placePrediction.secondaryText && (
                      <p className="text-xs text-muted-foreground">
                        {s.placePrediction.secondaryText.text}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showNoResults && (
            <p className="text-sm text-muted-foreground">Δεν βρέθηκε αποτέλεσμα.</p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
