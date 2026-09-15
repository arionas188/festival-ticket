// 15/9, ρητή αναφορά χρήστη: υπήρχαν 3 ξεχωριστά, ελαφρώς ασύμφωνα
// αντίγραφα του "πώς λέγεται κάθε κατηγορία merch" —
// useMerchCategories.js έλεγε "CD & Βινύλια" για τη μουσική, ενώ
// ProductList.jsx και ProductOverviewRoute.jsx έλεγαν "Μουσική" στο ίδιο
// ακριβώς προϊόν. Ένα σημείο αλήθειας εδώ, όλα εισάγουν από εδώ πλέον —
// ίδιο μοτίβο με stockTiers.js/checkoutErrors.js.
export const CATEGORY_LABELS = {
  clothing: "Ρουχισμός",
  music: "CD & Βινύλια",
  various: "Διάφορα",
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? CATEGORY_LABELS.various
}
