import { z } from "zod"
import { PHONE_COUNTRIES } from "./phoneCountries"

// Στατική λίστα v1 — μπορεί να επεκταθεί αργότερα χωρίς migration, είναι
// text[] στη βάση (όχι enum), οπότε νέες τιμές δεν σπάνε τίποτα παλιό.
export const FAN_MUSIC_GENRES = [
  "Rock",
  "Pop",
  "Hip-Hop / Rap",
  "Electronic",
  "Jazz",
  "Κλασική",
  "Metal",
  "Λαϊκά",
  "Έντεχνο",
  "Ρεμπέτικο",
  "Reggae",
  "R&B / Soul",
  "Punk",
  "Παραδοσιακά",
  "Indie",
]

// Επιτρέπει ελληνικά/λατινικά γράμματα, κενά, τελεία, απόστροφο, παύλα —
// αρκετά χαλαρό για ονόματα (σύνθετα ονόματα, τόνους κλπ), όχι ψηφία/σύμβολα.
const NAME_REGEX = /^[\p{L} .''-]+$/u
const VALID_DIAL_CODES = PHONE_COUNTRIES.map((c) => c.dial)

// Κεφαλαιοποιεί ΜΟΝΟ το πρώτο γράμμα (όχι κάθε λέξη) — ρητό αίτημα
// χρήστη, εφαρμόζεται LIVE (onChange) στο component, όχι μόνο εδώ στο
// submit-time validation, ώστε το live preview στο ID card να δείχνει
// ήδη το σωστό αποτέλεσμα καθώς πληκτρολογεί ο fan.
export function capitalizeFirst(value) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const optionalTrimmed = (max, extra) =>
  z
    .string()
    .trim()
    .max(max, `Μέχρι ${max} χαρακτήρες`)
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || !extra || extra.regex.test(val), extra?.message)

export const fanProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Το όνομα είναι υποχρεωτικό")
      .max(60, "Μέχρι 60 χαρακτήρες")
      .regex(NAME_REGEX, "Μόνο γράμματα επιτρέπονται"),
    lastName: z
      .string()
      .trim()
      .min(1, "Το επίθετο είναι υποχρεωτικό")
      .max(60, "Μέχρι 60 χαρακτήρες")
      .regex(NAME_REGEX, "Μόνο γράμματα επιτρέπονται"),
    // ΧΩΡΙΣ κεφαλαιοποίηση/μορφοποίηση — γράφεται ακριβώς όπως το θέλει ο
    // fan (ρητό αίτημα χρήστη). Η μοναδικότητα ελέγχεται ΞΕΧΩΡΙΣΤΑ, live,
    // μέσω RPC (βλ. FanProfileRoute.jsx) — όχι εδώ στο zod schema, γιατί
    // χρειάζεται async κλήση στη βάση.
    displayName: optionalTrimmed(30),
    phoneCountry: z.enum(VALID_DIAL_CODES).default("+30"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9 ]*$/, "Μόνο ψηφία")
      .max(15, "Πολύ μεγάλος αριθμός")
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || val.replace(/\s/g, "").length >= 6, "Πολύ μικρός αριθμός"),
    dateOfBirth: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || new Date(val) < new Date(), "Η ημερομηνία πρέπει να είναι στο παρελθόν"),
    city: optionalTrimmed(80),
    favoriteGenres: z.array(z.string()).default([]),
    favoriteTenantIds: z.array(z.string().uuid()).default([]),
  })
  // displayName validity (μήκος/κενό) ελέγχεται πάνω· η ΔΙΑΘΕΣΙΜΟΤΗΤΑ
  // (μοναδικότητα) μπαίνει manually μέσω setError("displayName", ...) στο
  // component, μετά το live RPC check — δεν χωράει σε synchronous zod refine.
  .transform((values) => ({
    ...values,
    firstName: capitalizeFirst(values.firstName),
    lastName: capitalizeFirst(values.lastName),
    city: capitalizeFirst(values.city),
  }))
