// Custom storage adapter για το Supabase Auth client.
//
// Γιατί: το προεπιλεγμένο localStorage είναι απομονωμένο ανά subdomain/origin
// — αυτό ήταν η ρίζα του "zombie session" bug ανάμεσα σε tenant subdomains
// (βλ. concerto-react-router-brief.md). Αντί γι' αυτό, το session
// αποθηκεύεται σε cookie με Domain=.concerto.gr, οπότε μοιράζεται
// αυτόματα σε ΟΛΑ τα *.concerto.gr subdomains — "δωρεάν" SSO μέσα στην
// οικογένεια, όπως τεκμηριώθηκε στο concerto-business-venue-partnerships-brief.md
// (χωρίς bridge/redirect σύστημα· αυτό λύνει ΜΟΝΟ subdomains, όχι custom
// domains — το concertofamily.gr bridge παραμένει ξεχωριστό, αναβεβλημένο θέμα).
//
// Σε localhost / Netlify preview domains δεν μπαίνει Domain attribute —
// host-only cookie, ίδια συμπεριφορά με πριν, ώστε να μη σπάσει το dev.
//
// Το session JSON (access_token + refresh_token + user object) μπορεί να
// ξεπεράσει το όριο μεγέθους ενός cookie (~4KB), ειδικά με μεγάλο
// user_metadata από Google OAuth (και, στο Concerto, ελληνικά ονόματα στο
// `full_name`/`name`) — γι' αυτό γίνεται chunking σε πολλαπλά cookies
// (key.0, key.1, ...) όταν χρειάζεται, ίδιο threshold/μοτίβο με το επίσημο
// @supabase/ssr πακέτο για το ίδιο ακριβώς πρόβλημα.
//
// ⚠️ Σημαντικό: το CHUNK_SIZE μετριέται πάνω στο ΚΩΔΙΚΟΠΟΙΗΜΕΝΟ
// (encodeURIComponent) μήκος, όχι στο raw string.length — ένα ελληνικό
// (ή γενικά non-ASCII) χαρακτήρας γίνεται 6-9 χαρακτήρες μετά encoding, και
// σημεία στίξης JSON (", {, }, :, ,) γίνονται 3 ο καθένας. Ένα raw string
// "μικρό" σε μήκος μπορεί εύκολα να ξεπεράσει το πραγματικό όριο ενός
// cookie μετά την κωδικοποίηση, χωρίς προειδοποίηση, αν μετρηθεί λάθος.

const CHUNK_SIZE = 3180
const MAX_CHUNKS = 20

// Σπάει το raw value σε chunks έτσι ώστε το ΚΩΔΙΚΟΠΟΙΗΜΕΝΟ μήκος του κάθε
// chunk να μένει κάτω από maxEncodedLen — δουλεύει χαρακτήρα-χαρακτήρα (όχι
// πάνω στο ήδη-κωδικοποιημένο string) ώστε να μην κόβεται ποτέ στη μέση μια
// %XX ακολουθία πολυ-byte χαρακτήρα.
function chunkByEncodedLength(value, maxEncodedLen) {
  const chunks = []
  let current = ""
  let currentEncodedLen = 0

  for (const ch of value) {
    const chEncodedLen = encodeURIComponent(ch).length
    if (currentEncodedLen + chEncodedLen > maxEncodedLen && current.length > 0) {
      chunks.push(current)
      current = ""
      currentEncodedLen = 0
    }
    current += ch
    currentEncodedLen += chEncodedLen
  }
  if (current.length > 0) chunks.push(current)

  return chunks
}

function rootCookieDomain() {
  const host = window.location.hostname
  if (host === "concerto.gr" || host.endsWith(".concerto.gr")) {
    return ".concerto.gr"
  }
  return null
}

function escapeForRegex(name) {
  return name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")
}

function readCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + escapeForRegex(name) + "=([^;]*)")
  )
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name, value) {
  const domain = rootCookieDomain()
  const secure = window.location.protocol === "https:"
  let attrs = `; Path=/; Max-Age=${60 * 60 * 24 * 100}; SameSite=Lax`
  if (domain) attrs += `; Domain=${domain}`
  if (secure) attrs += "; Secure"
  document.cookie = `${name}=${encodeURIComponent(value)}${attrs}`
}

function deleteCookie(name) {
  const domain = rootCookieDomain()
  let attrs = "; Path=/; Max-Age=0; SameSite=Lax"
  if (domain) attrs += `; Domain=${domain}`
  document.cookie = `${name}=${attrs}`
}

export const cookieStorage = {
  getItem(key) {
    const direct = readCookie(key)
    if (direct !== null) return direct

    let value = ""
    for (let i = 0; i < MAX_CHUNKS; i++) {
      const chunk = readCookie(`${key}.${i}`)
      if (chunk === null) break
      value += chunk
    }
    return value.length > 0 ? value : null
  },

  setItem(key, value) {
    // καθάρισμα τυχόν παλιάς τιμής (bare key + chunks) πριν το ξαναγράψιμο —
    // αλλιώς μπορεί να μείνουν "ορφανά" chunks από προηγούμενη, μεγαλύτερη τιμή
    cookieStorage.removeItem(key)

    const chunks = chunkByEncodedLength(value, CHUNK_SIZE)

    if (chunks.length <= 1) {
      writeCookie(key, value)
      return
    }

    chunks.forEach((chunk, i) => writeCookie(`${key}.${i}`, chunk))
  },

  removeItem(key) {
    deleteCookie(key)
    for (let i = 0; i < MAX_CHUNKS; i++) {
      deleteCookie(`${key}.${i}`)
    }
  },
}
