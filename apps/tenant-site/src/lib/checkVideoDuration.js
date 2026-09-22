// Έλεγχος διάρκειας video ΠΡΙΝ το upload (20/9, "New" tab — ρητό αίτημα
// χρήστη: "ena video pou mporeis na travikseis mexri 20sec"). Σε αντίθεση
// με τη φωτογραφία, το video ΔΕΝ συμπιέζεται εύκολα client-side — δεν
// υπάρχει απλός, ελαφρύς τρόπος σαν το canvas resize της φωτογραφίας
// (βλ. compressImage.js). Άρα ο μόνος έλεγχος που κάνουμε εδώ είναι να
// ΑΠΟΡΡΙΨΟΥΜΕ ένα video πάνω από 20" ΠΡΙΝ καν ξεκινήσει το upload —
// ΔΕΝ ανεβαίνει καθόλου αν είναι πάνω από το όριο.
export function getVideoDurationSeconds(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    const objectUrl = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Δεν ήταν δυνατή η ανάγνωση του video."))
    }

    video.src = objectUrl
  })
}
