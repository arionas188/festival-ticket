import { useMutation } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

// Ανεβάζει εικόνα tenant (cover/logo) στο Supabase Storage bucket
// "tenant-images" και επιστρέφει το public URL. Ασφάλεια σε δύο επίπεδα
// (12/9, ρητό αίτημα χρήστη — βλ. concerto-brief.md):
// 1) client-side έλεγχος τύπου/μεγέθους ΕΔΩ, για γρήγορο feedback χωρίς
//    να χρειαστεί network round-trip.
// 2) το ΙΔΙΟ επιβάλλεται ΚΑΙ server-side, από το ίδιο το bucket
//    (allowed_mime_types/file_size_limit, βλ. migration
//    20260911170000_add_tenant_images_storage.sql) — δεν εμπιστευόμαστε
//    ΜΟΝΟ το frontend μας, ό,τι client και να χτυπήσει το API.
// ΠΟΙΟΣ επιτρέπεται να γράψει ΠΟΥ (path "<tenant_id>/...") αποφασίζεται
// από RLS policy πάνω στο storage.objects, βασισμένο στο tenant_admins —
// ίδιος μηχανισμός με το tenant_settings write policy.
export function useUploadTenantImage() {
  return useMutation({
    mutationFn: async ({ tenantId, file, prefix }) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Επιτρέπονται μόνο εικόνες (JPG, PNG, WEBP, GIF).")
      }
      if (file.size > MAX_FILE_BYTES) {
        throw new Error("Η εικόνα δεν πρέπει να ξεπερνάει τα 5MB.")
      }

      const ext = EXTENSION_BY_TYPE[file.type]
      const path = `${tenantId}/${prefix}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("tenant-images")
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("tenant-images").getPublicUrl(path)
      return data.publicUrl
    },
  })
}
