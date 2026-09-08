import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFanAccount, useUpdateFanProfile } from "../../../queries/useFanAccount"
import { useFanIdNumber } from "../../../queries/useFanIdNumber"
import FanIdCard from "./FanIdCard"

export default function FanProfileRoute() {
  const { fanId } = useOutletContext()
  const { data: fan, isLoading } = useFanAccount(fanId)
  const { data: idNumber } = useFanIdNumber(fanId)
  const updateProfile = useUpdateFanProfile(fanId)
  const [editOpen, setEditOpen] = useState(false)

  // Uncontrolled input (defaultValue) αντί για useState+useEffect: το
  // form renders μόνο αφού έχει έρθει το fan (βλ. isLoading guard
  // παρακάτω), οπότε το defaultValue είναι ήδη σωστό στο πρώτο render —
  // δεν χρειάζεται sync effect (και το eslint react-hooks rule το
  // απαγορεύει ούτως ή άλλως: "setState synchronously within an effect").
  function handleSubmit(event) {
    event.preventDefault()
    const fullName = new FormData(event.currentTarget).get("fullName")
    updateProfile.mutate({ fullName })
  }

  if (isLoading) return <p className="text-sm text-gray-500">Φόρτωση...</p>

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold text-gray-900">Προφίλ</h1>

      {/* Ίδια λογική/χρώμα με το κόκκινο "Προφίλ" στο ConcertoBar — βλ.
          εκεί. Σβήνει μόνιμα μόλις ο fan αποθηκεύσει πραγματική αλλαγή
          (profile_customized=true), βλ. useFanAccount.js. */}
      {!fan?.profile_customized && (
        <p className="mt-1 text-sm font-medium text-red-600">
          Τα στοιχεία ήρθαν αυτόματα από το Google — έλεγξέ τα.
        </p>
      )}

      {/* Test/demo (8/9) — προεπισκόπηση "ταυτότητας" fan, βλ. FanIdCard.jsx
          για ποια πεδία είναι πραγματικά δεδομένα και ποια test data. */}
      <div className="mt-6">
        <FanIdCard fan={fan} idNumber={idNumber} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field>
          <FieldLabel htmlFor="fullName">Όνομα</FieldLabel>
          <Input id="fullName" name="fullName" defaultValue={fan?.full_name || ""} />
        </Field>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={updateProfile.isPending}>
            Αποθήκευση
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditOpen((open) => !open)}>
            Επεξεργασία
          </Button>
        </div>

        {updateProfile.isSuccess && (
          <p className="text-sm font-medium text-green-600">Αποθηκεύτηκε.</p>
        )}

        {/* Test/demo (8/9): stub πλήρους φόρμας προφίλ — τα πεδία της θα
            οριστούν σε επόμενο πέρασμα (θα προστεθούν πραγματικές στήλες
            στο fans table τότε). Προς το παρόν μόνο preview, disabled —
            δεν αποθηκεύει τίποτα ακόμα. */}
        {editOpen && (
          <div className="space-y-4 rounded-lg border border-dashed border-gray-300 p-4">
            <p className="text-xs text-gray-500">
              Πλήρης φόρμα προφίλ — προεπισκόπηση. Τα πεδία θα οριστούν σε επόμενο πέρασμα.
            </p>

            <Field>
              <FieldLabel htmlFor="lastName">Επίθετο</FieldLabel>
              <Input id="lastName" name="lastName" defaultValue="Γιαλαμάς" disabled />
            </Field>

            <Field>
              <FieldLabel htmlFor="birthDate">Ημερομηνία γέννησης</FieldLabel>
              <Input id="birthDate" name="birthDate" defaultValue="14/03/1990" disabled />
            </Field>

            <Field>
              <FieldLabel htmlFor="city">Πόλη</FieldLabel>
              <Input id="city" name="city" defaultValue="Ιωάννινα" disabled />
            </Field>

            <Field>
              <FieldLabel htmlFor="displayName">Display name</FieldLabel>
              <Input id="displayName" name="displayName" defaultValue="kgialamas" disabled />
            </Field>

            <p className="text-xs text-gray-400">
              Θα ενεργοποιηθεί μόλις οριστούν τα πεδία στη βάση.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
