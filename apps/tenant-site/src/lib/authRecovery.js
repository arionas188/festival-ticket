import { supabase } from "./supabase"

// 18/9, αρχικό diagnosis: κωδικοί σφάλματος που σημαίνουν "το session
// αυτής της συσκευής είναι στην πραγματικότητα άκυρο/σπασμένο" (π.χ. ήδη
// χρησιμοποιημένο/ληγμένο refresh token — Supabase refresh token
// rotation), ΟΧΙ ένα κανονικό, ανακτήσιμο error. Σε όλες αυτές τις
// περιπτώσεις ο σωστός χειρισμός είναι local sign-out (καθάρισμα μόνο στη
// συσκευή, καμία server-side ενέργεια) ώστε ο fan να ξαναγίνεται
// "επισκέπτης" και να μπορεί να ξανακάνει σύνδεση καθαρά, αντί να μένει
// κολλημένος με σπασμένα requests σε κάθε φόρτωση.
//
// 19/9, ρητή αναφορά χρήστη (401 στο console σε cart_items — ΙΔΙΟ root
// cause με το 18/9 diagnosis, απλά σε διαφορετικό query): αυτός ο έλεγχος
// ζούσε ΜΟΝΟ μέσα στο useFanSession.js, άρα δεν "έπιανε" σπασμένο session
// σε ΚΑΝΕΝΑ άλλο query/mutation (cart, favorites, orders, κ.λπ.) — μόνο
// στο συγκεκριμένο σημείο που τον φώναζε ρητά κάποιος κώδικας. Μετακόμισε
// εδώ, σε κοινό αρχείο, ώστε το main.jsx να τον εφαρμόζει ΚΕΝΤΡΙΚΑ
// (QueryCache/MutationCache onError) — ΚΑΘΕ authenticated request στην
// εφαρμογή αυτό-ανακάμπτει με τον ίδιο τρόπο πλέον, όχι μόνο ένα σημείο.
export function isBrokenSessionError(error) {
  return (
    // foreign key violation: το auth.users row αυτού του session δεν
    // υπάρχει πια (π.χ. ο λογαριασμός διαγράφηκε από άλλο subdomain/tab).
    error?.code === "23503" ||
    // not-null violation (π.χ. fans.id): σημαίνει ότι το auth.uid() γύρισε
    // null μέσα σε ένα SECURITY DEFINER function — το request έφτασε με
    // token που δεν αντιστοιχεί πια σε έγκυρο, ενεργό session.
    error?.code === "23502" ||
    // PostgREST's δικοί του κωδικοί για ληγμένο/άκυρο JWT — εμφανίζονται
    // σε ΟΠΟΙΟΔΗΠΟΤΕ request (SELECT, RPC, insert/update), όχι μόνο σε RPC.
    error?.code === "PGRST301" ||
    error?.code === "PGRST303"
  )
}

// Επιστρέφει true αν όντως έκανε recovery (χρήσιμο για caller που θέλει να
// ξέρει αν πρέπει να δείξει το κανονικό του error state ή όχι).
export function recoverFromBrokenSession(error) {
  if (isBrokenSessionError(error)) {
    supabase.auth.signOut({ scope: "local" })
    return true
  }
  return false
}
