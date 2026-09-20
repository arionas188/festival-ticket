import { z } from "zod"

// Schema για τη φόρμα προϊόντος (20/9, βλ. ProductFormPage.jsx) — ίδιο
// μοτίβο validation με το eventWizardSchema.js.
//
// variants: μόνο για category="clothing" — κάθε γραμμή είναι ΕΝΑ μέγεθος
// (S/M/L/XL, ίδια CHECK constraint με τη βάση, βλ. migration
// 20260915120000_add_product_variants.sql) + το δικό του απόθεμα. Δύο
// γραμμές με το ίδιο μέγεθος δεν επιτρέπονται (unique constraint στη
// βάση ούτως ή άλλως, αλλά ελέγχουμε ΚΑΙ εδώ για άμεσο μήνυμα).
const variantRowSchema = z.object({
  key: z.string(),
  size: z.enum(["S", "M", "L", "XL"]),
  stock_quantity: z.coerce.number().int("Ακέραιος αριθμός.").min(0, "Δεν μπορεί να είναι αρνητικό."),
})

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Υποχρεωτικό.").max(200, "Έως 200 χαρακτήρες."),
    description: z.string().max(2000, "Έως 2000 χαρακτήρες.").optional(),
    category: z.enum(["clothing", "music", "various"]),
    price: z.coerce.number().min(0, "Η τιμή δεν μπορεί να είναι αρνητική."),
    // Απλό απόθεμα — μόνο για category ΕΚΤΟΣ clothing (βλ. variants παραπάνω).
    stock_quantity: z.coerce.number().int("Ακέραιος αριθμός.").min(0, "Δεν μπορεί να είναι αρνητικό.").optional(),
    variants: z.array(variantRowSchema).optional(),
    // 20/9, ρητό αίτημα χρήστη — δύο ανεξάρτητες, προαιρετικές επιλογές:
    // is_new_arrival: χειροκίνητο "βάλε το και στα New Arrivals" (βλ.
    // hooks/useMerchCategories.js). available_date/available_time: κενά
    // = διαθέσιμο αμέσως, όπως σήμερα — η μετατροπή σε πραγματικό
    // timestamp/null γίνεται στο ProductFormPage.jsx πριν το mutate (βλ.
    // εκεί), όχι εδώ. Ξεχωριστά πεδία (ΟΧΙ ένα datetime-local) — δεύτερος
    // γύρος, ρητό αίτημα χρήστη: το native datetime-local έδειχνε ΠΜ/ΜΜ
    // αντί για 24ωρο· το time εδώ είναι ΚΕΙΜΕΝΟ με δικό μας 24ωρο regex,
    // ίδιο ΑΚΡΙΒΩΣ με το "time" στο eventWizardSchema.js.
    is_new_arrival: z.boolean().optional(),
    available_date: z.string().optional(),
    available_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Μορφή 24ώρου, π.χ. 21:00.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    // Ημερομηνία/ώρα προγραμματισμένης διαθεσιμότητας: είτε ΚΑΙ τα δύο
    // κενά (διαθέσιμο αμέσως) είτε ΚΑΙ τα δύο συμπληρωμένα — ποτέ μόνο
    // το ένα (θα ήταν διφορούμενο ποια ώρα/ημέρα να χρησιμοποιηθεί).
    const hasDate = !!values.available_date
    const hasTime = !!values.available_time
    if (hasDate !== hasTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasDate ? ["available_time"] : ["available_date"],
        message: hasDate ? "Πρόσθεσε και ώρα." : "Πρόσθεσε και ημερομηνία.",
      })
    }

    if (values.category === "clothing") {
      const sizes = (values.variants || []).map((v) => v.size)
      if (sizes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Πρόσθεσε τουλάχιστον ένα μέγεθος με απόθεμα.",
        })
      }
      if (new Set(sizes).size !== sizes.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Κάθε μέγεθος μπορεί να εμφανίζεται μόνο μία φορά.",
        })
      }
    }
  })
