import { CheckBadgeIcon } from "@heroicons/react/24/solid"

// Ενημέρωση (9/9, β' πέρασμα): αντί για την ημ. γέννησης, εμφανίζεται
// ΜΟΝΟ η υπολογισμένη ηλικία — υπολογίζεται ΖΩΝΤΑΝΑ σε κάθε render από
// το πραγματικό dateOfBirth (ΔΕΝ αποθηκεύεται σαν ξεχωριστός αριθμός
// πουθενά), οπότε αυξάνεται μόνη της κάθε χρόνο, αυτόματα — ρητό αίτημα
// χρήστη. Verified badge έγινε πράσινο (ήταν μπλε) — ίδιο, ρητό αίτημα.
const TEST_VERIFIED = true

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

// Fallback ΜΟΝΟ — όταν δεν υπάρχουν ακόμα πραγματικά firstName/lastName
// από τη νέα φόρμα προφίλ, σπάει το (auto-synced από Google) full_name σε
// όνομα/επίθετο για να μην είναι κενή η κάρτα.
function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  const [first, ...rest] = parts
  return {
    firstName: capitalize(first),
    lastName: rest.length > 0 ? capitalize(rest.join(" ")) : "",
  }
}

export default function FanIdCard({ fan, idNumber, dateOfBirth, city, firstName, lastName, displayName }) {
  const fallback = splitName(fan?.full_name)
  const resolvedFirstName = firstName || fallback.firstName
  const resolvedLastName = lastName || fallback.lastName
  const idLabel = idNumber != null ? String(idNumber).padStart(5, "0") : "-----"
  const age = calculateAge(dateOfBirth)

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
          className="size-14 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              Επώνυμο
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{resolvedLastName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
              Όνομα
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{resolvedFirstName || "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Ηλικία</p>
          <p className="text-sm text-gray-900">{age != null ? `${age} ετών` : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Πόλη</p>
          <p className="text-sm text-gray-900">{city || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            Display name
          </p>
          <p className="truncate text-xs text-gray-600">{displayName ? `@${displayName}` : "—"}</p>
        </div>
        {TEST_VERIFIED && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
            <CheckBadgeIcon className="size-4" />
            Verified
          </span>
        )}
      </div>
    </div>
  )
}
