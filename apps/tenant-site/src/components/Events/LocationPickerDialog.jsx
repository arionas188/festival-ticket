import { useEffect, useRef, useState } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { loadGoogleMapsPlaces } from "../../lib/googleMapsLoader"

// Επιλογή τοποθεσίας event μέσω πραγματικής αναζήτησης Google Maps (13/9,
// ρητό αίτημα χρήστη) — αντί να γράφει ο admin ελεύθερο κείμενο, ψάχνει
// το πραγματικό μαγαζί/χώρο και επιλέγει από τα αποτελέσματα της Google.
// Κρατάμε ΚΑΙ τη μορφοποιημένη διεύθυνση (location) ΚΑΙ το πραγματικό
// Google Maps link του συγκεκριμένου μέρους (locationUrl,
// place.googleMapsURI) — το ίδιο ζευγάρι στηλών που ήδη διαβάζει το
// lib/maps.js (getMapsUrl) για το κουμπί "Location" στο EventsList.
//
// Χρησιμοποιεί το επίσημο PlaceAutocompleteElement (νέο web component,
// όχι το παλιό/deprecated Autocomplete class) — βλ. googleMapsLoader.js
// για lazy-load + μοντέλο ασφαλείας του API key.
export default function LocationPickerDialog({ open, onOpenChange, onSelect }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    // Σκόπιμο reset πριν ξεκινήσει η εξωτερική async φόρτωση (νέο άνοιγμα
    // dialog) — έγκυρη χρήση effect (εξωτερικό σύστημα: script loader).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)
    setLoading(true)

    loadGoogleMapsPlaces()
      .then(({ PlaceAutocompleteElement }) => {
        if (cancelled || !containerRef.current) return

        // Φρέσκο element σε κάθε άνοιγμα — αποφεύγει stale event
        // listeners από προηγούμενο άνοιγμα του dialog.
        containerRef.current.innerHTML = ""

        const element = new PlaceAutocompleteElement()
        element.style.width = "100%"
        containerRef.current.appendChild(element)

        element.addEventListener("gmp-select", async ({ placePrediction }) => {
          try {
            const place = placePrediction.toPlace()
            // "location" (lat/lng) προστέθηκε 13/9 για το μελλοντικό feature
            // "events κοντά μου" — ΔΕΝ αυξάνει τον αριθμό των API calls
            // (ίδια, μία fetchFields κλήση ανά επιλογή τοποθεσίας μέσα στο
            // ίδιο session token του PlaceAutocompleteElement, όπως πριν —
            // απλά ζητάει ένα ακόμα πεδίο στην ίδια κλήση).
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
          } catch {
            setError("Κάτι πήγε στραβά με την επιλογή. Δοκίμασε ξανά.")
          }
        })

        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, onOpenChange, onSelect])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Αναζήτηση τοποθεσίας</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Γράψε το όνομα του χώρου (π.χ. «Gazarte») και επίλεξέ το από τη
            λίστα της Google.
          </p>
          <div ref={containerRef} className="min-h-10" />
          {loading && <p className="text-sm text-muted-foreground">Φόρτωση...</p>}
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
