import { z } from "zod"

// v1, σκόπιμα απλό: μόνο τα πεδία που επεξεργαζόμαστε σήμερα (bio +
// URLs εικόνων, το ίδιο MVP που ζητήθηκε — "επεξεργασία bio/λογότυπο").
// Η μεταφόρτωση εικόνας (αντί για επικόλληση URL) είναι ξεχωριστό,
// μελλοντικό βήμα (χρειάζεται Storage write policies, βλ. concerto-brief.md).
export const tenantProfileSchema = z.object({
  bio: z.string().max(2000, "Το bio δεν μπορεί να ξεπερνάει τους 2000 χαρακτήρες.").optional(),
  logo_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
  cover_image_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
})
