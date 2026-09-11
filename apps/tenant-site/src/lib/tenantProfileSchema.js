import { z } from "zod"

// Ίδιο schema με apps/admin-dashboard/src/lib/tenantProfileSchema.js —
// ηθελημένη, μικρή επανάληψη (όχι πρόωρο shared abstraction, ίδια λογική
// με το AccountAvatarMenu.jsx/AdminAvatarMenu.jsx, βλ. concerto-brief.md).
// v1, σκόπιμα απλό: μόνο τα πεδία που επεξεργαζόμαστε σήμερα (bio + URLs
// εικόνων). Η μεταφόρτωση εικόνας (αντί για επικόλληση URL) είναι
// ξεχωριστό, μελλοντικό βήμα.
export const tenantProfileSchema = z.object({
  bio: z.string().max(2000, "Το bio δεν μπορεί να ξεπερνάει τους 2000 χαρακτήρες.").optional(),
  logo_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
  cover_image_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
})
