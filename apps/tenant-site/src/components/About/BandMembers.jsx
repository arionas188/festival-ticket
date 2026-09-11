// UI βασισμένο ΠΙΣΤΑ στο Tailwind Plus reference component που έστειλε ο
// χρήστης ("Meet our leadership" grid) — ίδια δομή/Tailwind classes, μόνο τα
// δεδομένα άλλαξαν από hardcoded array σε πραγματικό `members` prop (rows
// από τον νέο πίνακα `band_members`). Εμφανίζεται μόνο όταν υπάρχουν
// πραγματικά μέλη στη βάση για το tenant — βλ. έλεγχο στο InfoRoute.jsx.
export default function BandMembers({ members }) {
  if (!members || members.length === 0) return null

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl">
            Τα μέλη μας
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            Γνωρίστε τους ανθρώπους πίσω από τη μουσική.
          </p>
        </div>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {members.map((member) => (
            <li key={member.id}>
              <div className="flex items-center gap-x-6">
                <img
                  alt=""
                  src={member.image_url}
                  className="size-16 rounded-full outline-1 -outline-offset-1 outline-black/5"
                />
                <div>
                  <h3 className="text-base/7 font-semibold tracking-tight text-gray-900">{member.name}</h3>
                  <p className="text-sm/6 font-semibold text-indigo-600">{member.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
