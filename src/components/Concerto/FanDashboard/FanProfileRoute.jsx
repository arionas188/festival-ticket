import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { fanProfileSchema, FAN_MUSIC_GENRES, capitalizeFirst } from "@/lib/fanProfileSchema"
import { PHONE_COUNTRIES, DEFAULT_PHONE_COUNTRY } from "@/lib/phoneCountries"
import { useFanAccount } from "../../../queries/useFanAccount"
import { useFanIdNumber } from "../../../queries/useFanIdNumber"
import {
  useFanFullProfile,
  useUpdateFanFullProfile,
  checkDisplayNameAvailable,
} from "../../../queries/useFanFullProfile"
import { useFanTenants } from "../../../queries/useFanTenants"
import FanIdCard from "./FanIdCard"
import FavoriteTenantsPicker from "./FavoriteTenantsPicker"

// Σπάει το αποθηκευμένο, ενιαίο "+30691..." σε {phoneCountry, phoneNumber}
// για τη φόρμα — η βάση κρατάει ΜΙΑ τιμή (ήδη σε μορφή κλήσιμη, βλ.
// migration), η φόρμα δείχνει δύο ξεχωριστά inputs (χώρα + νούμερο).
function parsePhone(phone) {
  if (!phone) return { phoneCountry: DEFAULT_PHONE_COUNTRY.dial, phoneNumber: "" }
  const match = PHONE_COUNTRIES.find((c) => phone.startsWith(c.dial))
  if (match) return { phoneCountry: match.dial, phoneNumber: phone.slice(match.dial.length) }
  return { phoneCountry: DEFAULT_PHONE_COUNTRY.dial, phoneNumber: phone }
}

function combinePhone(phoneCountry, phoneNumber) {
  const digits = (phoneNumber || "").replace(/\D/g, "")
  return digits ? `${phoneCountry}${digits}` : ""
}

// Πλήρης φόρμα προφίλ (9/9, β' πέρασμα — UX βελτιώσεις μετά από ρητό
// feedback χρήστη): live preview στο FanIdCard καθώς πληκτρολογεί
// (watch() — το form state μένει ζωντανό ασχέτως αν είναι ανοιχτό το
// panel, βλ. reset() effect παρακάτω που το κρατάει synced με τη βάση),
// sticky ID card, auto-κλείσιμο φόρμας μετά το save, κεφαλαιοποίηση
// πρώτου γράμματος σε Όνομα/Επίθετο/Πόλη, live έλεγχος διαθεσιμότητας
// display name, τηλέφωνο με επιλογή χώρας (κλικάρεται ως tel: link),
// "Αγαπημένα tenants" ΠΟΛΛΑΠΛΗ επιλογή από ό,τι πραγματικά ακολουθεί ο fan
// (με search). Λεπτομέρειες/rationale: concerto-forms-and-encryption-brief.md,
// concerto-react-router-brief.md.
export default function FanProfileRoute() {
  const { fanId } = useOutletContext()
  const { data: fan, isLoading: fanLoading } = useFanAccount(fanId)
  const { data: idNumber } = useFanIdNumber(fanId)
  const { data: fullProfile, isLoading: profileLoading } = useFanFullProfile(fanId)
  const { data: followedTenants } = useFanTenants(fanId)
  const updateFullProfile = useUpdateFanFullProfile(fanId)
  const [editOpen, setEditOpen] = useState(false)
  // Αποτέλεσμα ελέγχου διαθεσιμότητας display name, ΚΛΕΙΔΩΜΕΝΟ σε ΣΥΓΚΕΚΡΙΜΕΝΗ
  // τιμή (name) — ώστε να μην δείχνουμε ποτέ "παλιό" αποτέλεσμα σαν να
  // αφορά το τρέχον, νέο πληκτρολογημένο κείμενο (βλ. displayNameStatus
  // παρακάτω, derived/synchronous, όχι state — μόνο το ΑΣΥΓΧΡΟΝΟ resolve
  // μπαίνει σε state, μέσα στο setTimeout callback, ποτέ συγχρονισμένα
  // πάνω στο effect body — αλλιώς σκάει το react-hooks/set-state-in-effect
  // lint rule, ίδιο πρόβλημα που είχαμε ξαναδεί, βλ. FanDashboard v1 notes).
  const [displayNameCheck, setDisplayNameCheck] = useState({ name: "", status: "idle" })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fanProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      phoneCountry: DEFAULT_PHONE_COUNTRY.dial,
      phoneNumber: "",
      dateOfBirth: "",
      city: "",
      favoriteGenres: [],
      favoriteTenantIds: [],
    },
  })

  // reset() (ΟΧΙ setState ανά πεδίο) μόλις έρθουν/ανανεωθούν τα δεδομένα
  // από τη βάση — κρατάει το form state ΠΑΝΤΑ synced με τη βάση, ό,τι κι
  // αν δείχνει το UI (ανοιχτό/κλειστό panel). Αυτό είναι ΚΑΙ ο λόγος που
  // το live preview στο FanIdCard δουλεύει σωστά χωρίς ξεχωριστό
  // "live vs saved" state: το watch() παρακάτω είναι πάντα η αλήθεια.
  useEffect(() => {
    if (!fullProfile) return
    const { phoneCountry, phoneNumber } = parsePhone(fullProfile.phone)
    reset({
      firstName: fullProfile.first_name || "",
      lastName: fullProfile.last_name || "",
      displayName: fullProfile.display_name || "",
      phoneCountry,
      phoneNumber,
      dateOfBirth: fullProfile.date_of_birth || "",
      city: fullProfile.city || "",
      favoriteGenres: fullProfile.favorite_genres || [],
      favoriteTenantIds: fullProfile.favorite_tenant_ids || [],
    })
  }, [fullProfile, reset])

  const liveValues = useWatch({ control })
  const trimmedDisplayName = (liveValues.displayName || "").trim()
  const originalDisplayName = (fullProfile?.display_name || "").trim()
  const needsDisplayNameCheck =
    editOpen && !!trimmedDisplayName && trimmedDisplayName.toLowerCase() !== originalDisplayName.toLowerCase()

  // Live, debounced έλεγχος διαθεσιμότητας display name — best-effort/UX
  // (η πραγματική εγγύηση είναι server-side, μέσα στο set_own_fan_full_profile,
  // βλ. migration 20260909130000). Το ΜΟΝΟ setState εδώ είναι ΜΕΣΑ στο
  // setTimeout callback (ασύγχρονο) — καμία συγχρονισμένη κλήση state
  // πάνω στο ίδιο το effect body.
  useEffect(() => {
    if (!needsDisplayNameCheck) return
    const timeout = setTimeout(async () => {
      try {
        const available = await checkDisplayNameAvailable(trimmedDisplayName)
        setDisplayNameCheck({ name: trimmedDisplayName, status: available ? "available" : "taken" })
      } catch {
        // αφήνουμε ως έχει· ξαναπροσπαθεί μόνο του στο επόμενο keystroke
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [needsDisplayNameCheck, trimmedDisplayName])

  // Derived, ΟΧΙ state: "checking" μέχρι να έρθει resolve ΓΙΑ ΑΥΤΗ ΑΚΡΙΒΩΣ
  // την τιμή (name === trimmedDisplayName) — αλλιώς θα δείχναμε στιγμιαία
  // ένα παλιό "available"/"taken" από προηγούμενο πληκτρολόγημα.
  const displayNameStatus = !needsDisplayNameCheck
    ? "idle"
    : displayNameCheck.name === trimmedDisplayName
      ? displayNameCheck.status
      : "checking"

  function onSubmit(values) {
    if (displayNameStatus === "taken") return
    updateFullProfile.mutate(
      {
        ...values,
        phone: combinePhone(values.phoneCountry, values.phoneNumber),
      },
      {
        onSuccess: () => setEditOpen(false),
        // Το display_name έχει πλέον πραγματικό unique index στη βάση
        // (βλ. migration 20260909130000) — το live check παραπάνω είναι
        // UX προειδοποίηση, ΟΧΙ εγγύηση· σε σπάνιο race (δύο ταυτόχρονα
        // saves με ίδιο display name) η ίδια η Postgres αρνείται το save
        // με unique_violation (code 23505), το πιάνουμε εδώ.
        onError: (error) => {
          if (error?.code === "23505") {
            setDisplayNameCheck({ name: values.displayName.trim(), status: "taken" })
          }
        },
      }
    )
  }

  const savedPhone = combinePhone(liveValues.phoneCountry, liveValues.phoneNumber)

  if (fanLoading) return <p className="text-sm text-gray-500">Φόρτωση...</p>

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold text-gray-900">Προφίλ</h1>

      {/* Ίδια λογική/χρώμα με το κόκκινο "Προφίλ" στο ConcertoBar — βλ.
          εκεί. Σβήνει μόνιμα μόλις ο fan αποθηκεύσει πραγματική αλλαγή
          (profile_customized=true, πλέον μέσω set_own_fan_full_profile). */}
      {!fan?.profile_customized && (
        <p className="mt-1 text-sm font-medium text-red-600">
          Τα στοιχεία ήρθαν αυτόματα από το Google — έλεγξέ τα.
        </p>
      )}

      {/* Sticky: μένει ορατή στο πάνω μέρος της οθόνης καθώς ο fan κάνει
          scroll στη (μεγάλη, μεγαλώνει κι άλλο) φόρμα από κάτω — ρητό
          αίτημα χρήστη. top-24 (ΟΧΙ top-4) στο mobile: υπάρχουν ΔΥΟ sticky
          headers από πάνω (TenantChip row + "Ο λογαριασμός μου" row, βλ.
          FanDashboardLayout.jsx, z-40) — χωρίς αρκετό offset το ID card
          "χώνεται" κάτω από αυτά καθώς κάνεις scroll (ρητά αναφέρθηκε από
          τον χρήστη με screenshot). Στο desktop (lg+) το mobile header
          είναι κρυφό, οπότε μικρότερο offset αρκεί εκεί. z-10 (κάτω από
          το 40 του header) ώστε το header να μένει πάντα από πάνω σε τυχόν
          επικάλυψη. Live: τα values έρχονται από watch(), αλλάζουν σε
          πραγματικό χρόνο καθώς πληκτρολογεί, ΟΧΙ μόνο μετά το save. */}
      <div className="sticky top-24 z-10 bg-white pb-4 lg:top-4">
        <FanIdCard
          fan={fan}
          idNumber={idNumber}
          dateOfBirth={liveValues.dateOfBirth}
          city={liveValues.city}
          firstName={liveValues.firstName}
          lastName={liveValues.lastName}
          displayName={liveValues.displayName}
        />
      </div>

      {/* Μόλις αποθηκευτεί επιτυχώς, η φόρμα κλείνει αυτόματα (setEditOpen(false)
          μέσα στο onSubmit) — μένει ορατό ΜΟΝΟ το ID card + αυτό το κουμπί,
          κεντραρισμένο από κάτω, ρητό αίτημα χρήστη. Τηλέφωνο ΔΕΝ
          εμφανίζεται πια εδώ (ρητό αίτημα) — παραμένει μόνο μέσα στη φόρμα
          επεξεργασίας. */}
      {!editOpen && (
        <div className="mt-2 flex justify-center">
          <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
            Επεξεργασία στοιχείων
          </Button>
        </div>
      )}

      {editOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4"
        >
          {profileLoading ? (
            <p className="text-sm text-gray-500">Φόρτωση...</p>
          ) : (
            <>
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="firstName">Όνομα</FieldLabel>
                <Input
                  id="firstName"
                  aria-invalid={!!errors.firstName}
                  {...register("firstName", {
                    onChange: (e) => {
                      e.target.value = capitalizeFirst(e.target.value)
                    },
                  })}
                />
                <FieldError errors={errors.firstName ? [errors.firstName] : undefined} />
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="lastName">Επίθετο</FieldLabel>
                <Input
                  id="lastName"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName", {
                    onChange: (e) => {
                      e.target.value = capitalizeFirst(e.target.value)
                    },
                  })}
                />
                <FieldError errors={errors.lastName ? [errors.lastName] : undefined} />
              </Field>

              <Field data-invalid={!!errors.displayName || displayNameStatus === "taken"}>
                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                <Input
                  id="displayName"
                  placeholder="π.χ. kgialamas"
                  aria-invalid={!!errors.displayName || displayNameStatus === "taken"}
                  className={cn(displayNameStatus === "taken" && "border-destructive")}
                  {...register("displayName")}
                />
                {displayNameStatus === "checking" && (
                  <p className="text-xs text-gray-400">Έλεγχος διαθεσιμότητας...</p>
                )}
                {displayNameStatus === "taken" && (
                  <p className="text-sm font-medium text-destructive">
                    Αυτό το display name το χρησιμοποιεί ήδη κάποιος άλλος.
                  </p>
                )}
                {displayNameStatus === "available" && (
                  <p className="text-sm font-medium text-green-600">Διαθέσιμο.</p>
                )}
                <FieldError errors={errors.displayName ? [errors.displayName] : undefined} />
              </Field>

              <Field data-invalid={!!errors.phoneNumber}>
                <FieldLabel htmlFor="phoneNumber">Τηλέφωνο</FieldLabel>
                <div className="flex gap-2">
                  <select
                    {...register("phoneCountry")}
                    className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {PHONE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.dial}>
                        {c.name} ({c.dial})
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="69XXXXXXXX"
                    aria-invalid={!!errors.phoneNumber}
                    {...register("phoneNumber")}
                  />
                </div>
                {savedPhone && (
                  <p className="text-xs text-gray-400">
                    Θα αποθηκευτεί ως{" "}
                    <a href={`tel:${savedPhone}`} className="underline">
                      {savedPhone}
                    </a>{" "}
                    (κλικάρεται για κλήση).
                  </p>
                )}
                <FieldError errors={errors.phoneNumber ? [errors.phoneNumber] : undefined} />
              </Field>

              <Field data-invalid={!!errors.dateOfBirth}>
                <FieldLabel htmlFor="dateOfBirth">Ημερομηνία γέννησης</FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  aria-invalid={!!errors.dateOfBirth}
                  {...register("dateOfBirth")}
                />
                <FieldError errors={errors.dateOfBirth ? [errors.dateOfBirth] : undefined} />
              </Field>

              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="city">Πόλη που ζεις τώρα</FieldLabel>
                <Input
                  id="city"
                  aria-invalid={!!errors.city}
                  {...register("city", {
                    onChange: (e) => {
                      e.target.value = capitalizeFirst(e.target.value)
                    },
                  })}
                />
                <FieldError errors={errors.city ? [errors.city] : undefined} />
              </Field>

              <Field>
                <FieldLabel>Αγαπημένα είδη μουσικής</FieldLabel>
                <Controller
                  name="favoriteGenres"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {FAN_MUSIC_GENRES.map((genre) => {
                        const selected = field.value?.includes(genre)
                        return (
                          <button
                            key={genre}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((g) => g !== genre)
                                  : [...(field.value || []), genre]
                              )
                            }
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-transparent text-gray-600 hover:bg-muted"
                            )}
                          >
                            {genre}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Αγαπημένα tenants</FieldLabel>
                <Controller
                  name="favoriteTenantIds"
                  control={control}
                  render={({ field }) => (
                    <FavoriteTenantsPicker
                      tenants={followedTenants}
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={updateFullProfile.isPending || displayNameStatus === "taken"}
                >
                  Αποθήκευση
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Ακύρωση
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
