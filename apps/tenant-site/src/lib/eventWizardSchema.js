import { z } from "zod"

// Schema για τη φόρμα event (13/9, βλ. EventFormPage.jsx).
//
// time: text input με strict regex (ΟΧΙ native <input type="time">) — το
// native time picker εμφανίζει 12ωρο (ΠΜ/ΜΜ) ανάλογα με τις ρυθμίσεις
// περιοχής του browser/λειτουργικού· ο admin θέλει να γράφει "21:00"
// κατευθείαν, χωρίς αμφισημία ΠΜ/ΜΜ.
//
// tickets: κάθε γραμμή είναι μια "κατηγορία εισιτηρίου" — typeKey λέει
// ποιο preset είναι επιλεγμένο στο dropdown της ("free" = προεπιλογή,
// απενεργοποιημένα price/quantity), "early_bird"/"general"/"vip" ή
// "custom" (ελεύθερο όνομα). price/quantity ΧΩΡΙΣ δεκαδικά (ρητό αίτημα
// χρήστη — ακέραια ευρώ, ακέραιος αριθμός εισιτηρίων) — η μετατροπή/
// στρογγυλοποίηση γίνεται στο component (onBlur, parseInt), το z.coerce
// εδώ απλά επιβεβαιώνει ότι είναι πράγματι ακέραιος πριν το submit.
const ticketRowSchema = z.object({
  key: z.string(),
  typeKey: z.string(),
  label: z.string().trim().min(1, "Υποχρεωτικό."),
  price: z.coerce.number().int("Ακέραια ευρώ, χωρίς δεκαδικά.").min(0, "Η τιμή δεν μπορεί να είναι αρνητική."),
  quantity: z.coerce.number().int("Ακέραιος αριθμός.").min(1, "Τουλάχιστον 1."),
})

export const eventWizardSchema = z.object({
  title: z.string().trim().min(1, "Υποχρεωτικό.").max(200, "Έως 200 χαρακτήρες."),
  description: z.string().max(2000, "Έως 2000 χαρακτήρες.").optional(),
  date: z.string().min(1, "Υποχρεωτικό."),
  time: z
    .string()
    .min(1, "Υποχρεωτικό.")
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Μορφή 24ώρου, π.χ. 21:00."),
  location: z.string().max(300, "Έως 300 χαρακτήρες.").optional(),
  locationUrl: z.string().max(500).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  tickets: z
    .array(ticketRowSchema)
    .min(1, "Πρόσθεσε τουλάχιστον έναν τύπο εισιτηρίου."),
})
