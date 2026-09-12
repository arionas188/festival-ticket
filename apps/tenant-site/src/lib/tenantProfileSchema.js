import { z } from "zod"
import { htmlToPlainTextLength } from "./richText"

// Ίδιο schema με apps/admin-dashboard/src/lib/tenantProfileSchema.js —
// ηθελημένη, μικρή επανάληψη (όχι πρόωρο shared abstraction, ίδια λογική
// με το AccountAvatarMenu.jsx/AdminAvatarMenu.jsx, βλ. concerto-brief.md).
// v1, σκόπιμα απλό: μόνο τα πεδία που επεξεργαζόμαστε σήμερα (bio + URLs
// εικόνων). Η μεταφόρτωση εικόνας (αντί για επικόλληση URL) είναι
// ξεχωριστό, μελλοντικό βήμα.
//
// ΣΗΜΕΙΩΣΗ 12/9: το bio εδώ (tenant-site, EditBioDialog.jsx) είναι πλέον
// HTML από το Tiptap rich-text editor, όχι plain text — το admin-dashboard
// ΔΕΝ έχει ακόμα το ίδιο editor (ακόμα plain Textarea εκεί), οπότε τα δύο
// schema ΔΕΝ είναι πια πανομοιότυπα σε αυτό το σημείο, ρητή, γνωστή
// ασυνέπεια μέχρι να αναβαθμιστεί και το admin-dashboard. Το raw-HTML max
// είναι γενναιόδωρο όριο ασφαλείας (αποτρέπει εξωφρενικά μεγάλο markup) —
// το πραγματικό, ορατό στον χρήστη όριο είναι το refine παρακάτω, πάνω
// στο ΚΑΘΑΡΟ κείμενο (χωρίς τα html tags).
export const tenantProfileSchema = z.object({
  bio: z
    .string()
    .max(20000, "Το bio είναι πολύ μεγάλο.")
    .optional()
    .refine(
      (val) => !val || htmlToPlainTextLength(val) <= 2000,
      "Το bio δεν μπορεί να ξεπερνάει τους 2000 χαρακτήρες."
    ),
  logo_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
  cover_image_url: z.union([z.literal(""), z.string().url("Μη έγκυρο URL.")]).optional(),
})
