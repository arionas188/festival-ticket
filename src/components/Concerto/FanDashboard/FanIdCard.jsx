import { CheckBadgeIcon } from "@heroicons/react/24/solid"

// TEST DATA (8/9) — demo component, για να δειχτεί σε συνεργάτη. Επίθετο/
// ημ. γέννησης/πόλη/display name/verified ΔΕΝ υπάρχουν ακόμα σαν πραγματικά
// πεδία στη βάση (fans table) — θα οριστούν σωστά σε επόμενο πέρασμα (ο
// χρήστης θα πει τότε τι ακριβώς θα έχει η φόρμα). Το όνομα, το avatar και
// ο αριθμός ταυτότητας (idNumber prop, βλ. useFanIdNumber.js) είναι ήδη
// πραγματικά δεδομένα του fan.
const TEST_LAST_NAME = "Γιαλαμάς"
const TEST_BIRTH_DATE = "14/03/1990"
const TEST_CITY = "Ιωάννινα"
const TEST_DISPLAY_NAME = "kgialamas"
const TEST_VERIFIED = true

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

// Το πραγματικό full_name είναι ένα ενιαίο πεδίο (βλ. syncFanFromAuth.js) —
// σπάει εδώ σε όνομα/επίθετο μόνο για την εμφάνιση της κάρτας. Αν δεν
// υπάρχει δεύτερη λέξη (π.χ. μόνο "Konstantinos"), πέφτει στο test επίθετο
// παραπάνω, μιας και δεν έχουμε ακόμα πραγματικό πεδίο επιθέτου.
function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: TEST_LAST_NAME }
  const [first, ...rest] = parts
  return {
    firstName: capitalize(first),
    lastName: rest.length > 0 ? capitalize(rest.join(" ")) : TEST_LAST_NAME,
  }
}

export default function FanIdCard({ fan, idNumber }) {
  const { firstName, lastName } = splitName(fan?.full_name)
  const idLabel = idNumber != null ? String(idNumber).padStart(5, "0") : "-----"

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
        <span className="text-xs font-bold tracking-wider text-white uppercase">
          Concerto ID
        </span>
        <span className="font-mono text-xs font-semibold text-white/80">No. {idLabel}</span>
      </div>

      <div className="flex gap-4 p-4">
        <img
          alt=""
          src={fan?.avatar_url}
          className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              Επώνυμο
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{lastName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              Όνομα
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{firstName || "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            Ημ. γέννησης
          </p>
          <p className="text-sm text-gray-900">{TEST_BIRTH_DATE}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Πόλη</p>
          <p className="text-sm text-gray-900">{TEST_CITY}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            Display name
          </p>
          <p className="truncate text-xs text-gray-600">@{TEST_DISPLAY_NAME}</p>
        </div>
        {TEST_VERIFIED && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600">
            <CheckBadgeIcon className="size-4" />
            Verified
          </span>
        )}
      </div>
    </div>
  )
}
