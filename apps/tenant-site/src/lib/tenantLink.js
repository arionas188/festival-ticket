// Cross-tenant links (π.χ. Fan Dashboard → "Αγαπημένα tenants/merch/events")
// φτιάχνονται από το ΚΑΘΑΡΟ domain που είναι αποθηκευμένο στη βάση
// (tenant_domains.domain) — σωστό για production, όπου δεν υπάρχει port.
//
// Σε τοπικό dev (`npm run dev`) όμως, ο Vite server "ακούει" πάντα σε
// συγκεκριμένη πόρτα (5173) — χωρίς αυτήν, τα ίδια αυτά links δεν
// φορτώνουν τίποτα τοπικά (φαίνονται σαν "χαλασμένα", ενώ δεν είναι).
//
// import.meta.env.DEV: επίσημο Vite flag — true ΜΟΝΟ σε `npm run dev`,
// false αυτόματα σε production build (`npm run build`). Δεν χρειάζεται
// ΚΑΜΙΑ χειροκίνητη αλλαγή όταν πάμε live· το build το κλείνει μόνο του.
export function crossTenantHref(domain, path) {
  const port = import.meta.env.DEV ? ":5173" : ""
  return `//${domain}${port}${path}`
}
