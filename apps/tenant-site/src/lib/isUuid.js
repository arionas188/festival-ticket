const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Ξεχωρίζει ένα παλιό, UUID-based route param (π.χ. κοινοποιημένο link
// από πριν το slug migration) από ένα νέο, slug-based param, ώστε το ίδιο
// route να δέχεται και τα δύο χωρίς ξεχωριστό legacy route.
export function isUuid(value) {
  return UUID_RE.test(value)
}
