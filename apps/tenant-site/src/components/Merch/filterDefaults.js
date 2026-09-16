// 16/9 — ξεχωριστό αρχείο, όχι named export μέσα στο ProductFilters.jsx:
// ένα αρχείο components πρέπει να εξάγει ΜΟΝΟ components (κανόνας
// react-refresh/only-export-components, βλ. σχόλιο eslint). Ένα σημείο
// αλήθειας για το "άδειο" σχήμα φίλτρων — MerchCategoryRoute.jsx το
// χρησιμοποιεί ως αρχική τιμή state, το ProductFilters.jsx το χρησιμοποιεί
// για το "Καθαρισμός".
export const DEFAULT_FILTERS = {
  sortBy: "newest",
  priceMin: "",
  priceMax: "",
  onlyAvailable: false,
  sizes: [],
}
