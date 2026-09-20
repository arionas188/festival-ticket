import { useEffect, useState } from "react"

// 20/9, ρητό αίτημα χρήστη (live test: "θέλω να κάνω εγώ refresh για να
// γράψει διαθέσιμο -- γίνεται να αλλάζει από μόνο του;"):
//
// Το useProducts.js ΗΔΗ κάνει refetch κάθε 15" (refetchInterval) -- αυτό
// ΔΕΝ ήταν το πρόβλημα. Η πραγματική αιτία: όταν το refetch φέρνει
// ΑΚΡΙΒΩΣ τα ίδια δεδομένα (τίποτα δεν άλλαξε στη βάση -- το
// products.available_from είναι πάντα το ίδιο, μόνο το "τώρα" προχωράει),
// το React Query "structural sharing" (προεπιλογή) κρατάει το ΙΔΙΟ
// object reference αντί να προκαλέσει άσκοπο re-render -- οπότε τα
// components που υπολογίζουν isScheduledUnavailable() (lib/stockTiers.js)
// ΔΕΝ ξανα-render-άρουν καθόλου, άρα ποτέ δεν ξαναδιαβάζουν το ρολόι.
// Γι' αυτό δούλευε ΜΟΝΟ με πλήρες refresh (νέο mount, νέος υπολογισμός).
//
// Αυτό το hook είναι το μόνο που χρειάζεται: ΚΑΘΟΛΟΥ επιπλέον κλήση
// δικτύου/βάσης -- απλά ένα local τικ που αναγκάζει re-render όποιο
// component το καλέσει, ώστε το ήδη σωστό υπολογισμό (available_from vs
// Date.now()) να ξανατρέξει με φρέσκια ώρα. Μηδενικό επιπλέον φορτίο στο
// Supabase/δίκτυο.
export function useNow(intervalMs = 20000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
