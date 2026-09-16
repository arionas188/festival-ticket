import { toast } from "sonner"

// 16/9, ρητό αίτημα χρήστη: κοινή λογική κοινοποίησης ("share icon σε κάθε
// product για Instagram και παντού") — μέχρι τώρα υπήρχε ΜΟΝΟ μέσα στο
// ProductOverviewRoute.jsx (14/9, "product overview για να μπορεί να το
// κάνει share το link"). Εξάγεται εδώ ώστε το ΙΔΙΟ κουμπί κοινοποίησης να
// μπορεί να μπει και στις κάρτες προϊόντων (ProductList.jsx) με ΑΚΡΙΒΩΣ την
// ίδια συμπεριφορά, ένα σημείο αλήθειας — αντί να διπλασιαστεί ο κώδικας.
//
// Σειρά προτεραιότητας:
//  1. `navigator.share` (native OS share sheet) — υπάρχει σε κινητά
//     browsers (και μερικά desktop): εκεί ο χρήστης βλέπει ΟΛΕΣ τις
//     εγκατεστημένες εφαρμογές (Instagram, WhatsApp, Messages, κ.λπ.) και
//     διαλέγει. Ο χρήστης μπορεί να ακυρώσει το sheet — δεν είναι σφάλμα.
//  2. `navigator.clipboard.writeText` — desktop browsers χωρίς Web Share
//     API: αντιγράφει τον σύνδεσμο, toast επιβεβαίωσης.
//  3. Legacy `document.execCommand("copy")` — fallback όταν το
//     navigator.clipboard δεν υπάρχει (μόνο σε "secure context", https ή
//     localhost· σε plain http, π.χ. τοπικό dev server, είναι undefined).
export function shareLink({ url, title }) {
  if (typeof navigator.share === "function") {
    navigator.share({ title, url }).catch(() => {})
    return
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Ο σύνδεσμος αντιγράφηκε."))
      .catch(() => toast.error("Δεν ήταν δυνατή η αντιγραφή του συνδέσμου."))
    return
  }

  if (legacyCopy(url)) {
    toast.success("Ο σύνδεσμος αντιγράφηκε.")
  } else {
    toast.error("Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.")
  }
}

function legacyCopy(text) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  let ok
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  return ok
}
