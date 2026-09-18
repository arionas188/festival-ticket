// 18/9, ρητό αίτημα χρήστη: ξεχωριστό αρχείο (όχι inline στο CartRoute.jsx)
// — ένα σημείο αλήθειας για ΦΠΑ/έξοδα αποστολής, έτοιμο να το
// ξαναχρησιμοποιήσει και το OrderSummaryRoute.jsx όταν χτιστεί το
// πραγματικό checkout/Stripe flow (βλ. TODO handlePayment εκεί) — τότε το
// πραγματικό order.subtotal στη βάση θα πρέπει να ακολουθήσει την ΙΔΙΑ
// λογική.
//
// Οι τιμές προϊόντων στο project είναι ΗΔΗ ΦΠΑ-συμπεριλαμβανόμενες
// (συνηθισμένο στο λιανεμπόριο — επιβεβαιώθηκε ρητά από τον χρήστη πριν
// γίνει αυτή η αλλαγή). Άρα η "καθαρή αξία" εξάγεται ΑΝΑΔΡΟΜΙΚΑ
// διαιρώντας το ήδη-ΦΠΑ-συμπεριλαμβανόμενο σύνολο με (1 + ΦΠΑ) — ΔΕΝ
// προστίθεται ΦΠΑ πάνω στην τιμή, αλλιώς το "Σύνολο" θα αυξανόταν κατά
// 24% και ο fan θα πλήρωνε παραπάνω απ' όσο έδειχνε η κάρτα προϊόντος.
export const VAT_RATE = 0.24
export const SHIPPING_COST = 3

export function getOrderTotals(subtotal) {
  const net = subtotal / (1 + VAT_RATE)
  const vat = subtotal - net
  const grandTotal = subtotal + SHIPPING_COST
  return { net, vat, shipping: SHIPPING_COST, grandTotal }
}
