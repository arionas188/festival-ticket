import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"
import { compressImage } from "../lib/compressImage"
import { getVideoDurationSeconds } from "../lib/checkVideoDuration"

const MAX_VIDEO_SECONDS = 20
const MAX_VIDEO_BYTES = 25 * 1024 * 1024 // ίδιο όριο με bucket file_size_limit, βλ. migration
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const VIDEO_EXTENSION_BY_TYPE = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" }

// Ανεβάζει ΕΙΤΕ φωτογραφία ΕΙΤΕ video στο bucket "tenant-posts" (ρητή
// απόφαση χρήστη — ποτέ και τα δύο μαζί στην ίδια ανάρτηση) και
// δημιουργεί τη γραμμή tenant_posts. Φωτογραφία: συμπιέζεται πρώτα
// (compressImage.js, canvas resize+JPEG) — ίδια λογική/λόγος με
// useUploadTenantImage.js αλλά με πραγματική αλλαγή μεγέθους, όχι μόνο
// έλεγχο τύπου/μεγέθους. Video: ΔΕΝ συμπιέζεται (δεν υπάρχει απλός
// client-side τρόπος) — μόνο έλεγχος διάρκειας ΠΡΙΝ το upload,
// απορρίπτεται αν υπερβαίνει τα 20" ΧΩΡΙΣ να ανέβει καθόλου.
//
// Path "<tenant_id>/<timestamp>.<ext>" — ίδια σύμβαση με
// useUploadTenantImage.js (Date.now(), όχι crypto.randomUUID· η storage
// RLS ελέγχει μόνο το πρώτο folder = tenant_id, βλ. migration).
export function useCreateTenantPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, file, mediaType, durationHours, caption }) => {
      let uploadFile = file

      if (mediaType === "photo") {
        if (!PHOTO_TYPES.includes(file.type)) {
          throw new Error("Επιτρέπονται μόνο εικόνες (JPG, PNG, WEBP).")
        }
        uploadFile = await compressImage(file)
      } else {
        if (!VIDEO_TYPES.includes(file.type)) {
          throw new Error("Επιτρέπονται μόνο video (MP4, MOV, WEBM).")
        }
        if (file.size > MAX_VIDEO_BYTES) {
          throw new Error("Το video δεν πρέπει να ξεπερνάει τα 25MB.")
        }
        const duration = await getVideoDurationSeconds(file)
        if (duration > MAX_VIDEO_SECONDS) {
          throw new Error(
            `Το video δεν πρέπει να ξεπερνάει τα ${MAX_VIDEO_SECONDS}". Το δικό σου είναι ${Math.round(duration)}".`
          )
        }
      }

      const ext = mediaType === "photo" ? "jpg" : VIDEO_EXTENSION_BY_TYPE[file.type]
      const path = `${tenantId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("tenant-posts")
        .upload(path, uploadFile, { contentType: uploadFile.type, upsert: false })
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("tenant-posts").getPublicUrl(path)

      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()

      const { error: insertError } = await supabase.from("tenant_posts").insert({
        tenant_id: tenantId,
        media_url: publicUrlData.publicUrl,
        media_path: path,
        media_type: mediaType,
        caption: caption || null,
        expires_at: expiresAt,
      })
      if (insertError) throw insertError
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant_posts", variables.tenantId] })
    },
  })
}
