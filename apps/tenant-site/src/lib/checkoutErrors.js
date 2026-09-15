// Μεταφράζει τα exception messages του create_order_from_cart RPC (βλ.
// migration 20260914150000_add_orders_checkout.sql) σε κάτι κατανοητό για
// τον fan. Κοινό σημείο αλήθειας — 15/9 εξήχθη από το CartDialog.jsx ώστε
// να το χρησιμοποιεί και το νέο κουμπί "Ολοκλήρωση παραγγελίας" στο
// ProductOverviewRoute.jsx (checkout απευθείας από τη σελίδα προϊόντος),
// χωρίς να ξαναγραφτεί η ίδια λογική σε δύο σημεία.
export function checkoutErrorMessage(error) {
  const raw = error?.message || ""
  if (raw.includes("insufficient_stock")) {
    const productName = raw.split(":").slice(1).join(":").trim()
    return productName
      ? `Δυστυχώς το "${productName}" μόλις εξαντλήθηκε — αφαίρεσέ το ή μείωσε την ποσότητα.`
      : "Κάποιο προϊόν στο καλάθι σου μόλις εξαντλήθηκε."
  }
  if (raw.includes("empty_cart")) {
    return "Το καλάθι σου είναι άδειο."
  }
  return "Κάτι πήγε στραβά με την ολοκλήρωση της παραγγελίας. Δοκίμασε ξανά."
}
