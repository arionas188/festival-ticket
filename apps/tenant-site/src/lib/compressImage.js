// Συμπίεση/αλλαγή μεγέθους φωτογραφίας ΣΤΟΝ BROWSER πριν το upload (20/9,
// "New" tab — βλ. concerto-brief.md). Μια σύγχρονη φωτογραφία κινητού
// είναι συχνά 4000×3000px και αρκετά MB· χωρίς αυτό το βήμα, θα ανέβαινε
// ωμή. Χρησιμοποιεί μόνο native browser APIs (canvas) — καμία νέα
// βιβλιοθήκη. ΜΟΝΟ για φωτογραφίες — video ΔΕΝ συμπιέζεται εύκολα
// client-side, βλ. checkVideoDuration.js/useCreateTenantPost.js.
const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.82

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Η επεξεργασία της εικόνας απέτυχε."))
            return
          }
          // Πάντα .jpg μετά τη συμπίεση, ανεξάρτητα από τον αρχικό τύπο
          // (PNG/WEBP κ.λπ.) — ίδιο compressed format για όλες τις
          // αναρτήσεις φωτογραφίας, προβλέψιμο μέγεθος αρχείου.
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, "") + ".jpg",
            { type: "image/jpeg" }
          )
          resolve(compressedFile)
        },
        "image/jpeg",
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Δεν ήταν δυνατή η ανάγνωση της εικόνας."))
    }

    img.src = objectUrl
  })
}
