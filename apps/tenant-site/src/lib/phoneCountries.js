// Στατική λίστα v1 — Ελλάδα πρώτη/default (ο περισσότερος fanbase είναι
// εκεί), μετά τα πιο συνηθισμένα. Μπορεί να επεκταθεί αργότερα χωρίς
// migration (δεν αγγίζει τη βάση, μόνο UI/validation).
export const PHONE_COUNTRIES = [
  { code: "GR", name: "Ελλάδα", dial: "+30" },
  { code: "CY", name: "Κύπρος", dial: "+357" },
  { code: "GB", name: "Ηνωμένο Βασίλειο", dial: "+44" },
  { code: "DE", name: "Γερμανία", dial: "+49" },
  { code: "FR", name: "Γαλλία", dial: "+33" },
  { code: "IT", name: "Ιταλία", dial: "+39" },
  { code: "ES", name: "Ισπανία", dial: "+34" },
  { code: "NL", name: "Ολλανδία", dial: "+31" },
  { code: "BE", name: "Βέλγιο", dial: "+32" },
  { code: "PT", name: "Πορτογαλία", dial: "+351" },
  { code: "AT", name: "Αυστρία", dial: "+43" },
  { code: "CH", name: "Ελβετία", dial: "+41" },
  { code: "SE", name: "Σουηδία", dial: "+46" },
  { code: "IE", name: "Ιρλανδία", dial: "+353" },
  { code: "PL", name: "Πολωνία", dial: "+48" },
  { code: "BG", name: "Βουλγαρία", dial: "+359" },
  { code: "RO", name: "Ρουμανία", dial: "+40" },
  { code: "TR", name: "Τουρκία", dial: "+90" },
  { code: "AL", name: "Αλβανία", dial: "+355" },
  { code: "US", name: "ΗΠΑ / Καναδάς", dial: "+1" },
  { code: "AU", name: "Αυστραλία", dial: "+61" },
]

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0]
