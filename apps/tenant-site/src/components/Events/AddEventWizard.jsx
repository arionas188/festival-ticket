import { useEffect, useRef, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPinIcon, PencilIcon, PhotoIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { eventWizardSchema } from "../../lib/eventWizardSchema"
import { useUploadTenantImage } from "../../queries/useUploadTenantImage"
import { useCreateEvent } from "../../queries/useCreateEvent"
import { useUpdateEvent } from "../../queries/useUpdateEvent"
import LocationPickerDialog from "./LocationPickerDialog"

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif"

// Ποια πεδία επικυρώνονται πριν επιτραπεί το "Επόμενο" σε κάθε βήμα.
const STEP_FIELDS = {
  1: ["title", "description", "date", "time", "location"],
}

// Ονόματα ανά preset τύπο (13/9, ρητό αίτημα χρήστη — dropdown ανά
// "κατηγορία εισιτηρίου", ΟΧΙ checkboxes). "free" είναι η προεπιλογή κάθε
// νέας κατηγορίας — όσο μένει έτσι, τιμή/ποσότητα είναι κλειδωμένα
// (0€ / 100, μη επεξεργάσιμα). Ο admin μπορεί να ανοίξει το dropdown και
// να διαλέξει κάτι άλλο (ή "Άλλο" για δικό του όνομα), οπότε ξεκλειδώνουν
// τα δύο πεδία γι' αυτή τη γραμμή. Πολλές κατηγορίες ταυτόχρονα
// επιτρέπονται — "+ Πρόσθεσε άλλη κατηγορία" προσθέτει ακόμα μία, με τη
// δική της, ανεξάρτητη προεπιλογή "free".
const TYPE_LABELS = {
  free: "Ελεύθερη είσοδος",
  early_bird: "Early Bird",
  general: "Γενική είσοδος",
  vip: "VIP",
}

function makeTicketGroup(overrides = {}) {
  return {
    key: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    typeKey: "free",
    label: TYPE_LABELS.free,
    price: "0",
    quantity: "100",
    ...overrides,
  }
}

// Ακέραιο, χωρίς δεκαδικά, χωρίς αρνητικό/κενό — ρητό αίτημα χρήστη: αν
// γράψει "090" να γίνεται αυτόματα "90", αν γράψει "10,01" ή "10.01" να
// γίνεται "10" (parseInt κόβει στο πρώτο μη-ψηφίο, ήδη αγνοεί τα leading
// zeros). Εφαρμόζεται onBlur σε τιμή/ποσότητα, όχι onChange (να μην
// πειράζει τον χρήστη ενώ γράφει).
function sanitizeToInteger(raw, min) {
  const n = Number.parseInt(raw, 10)
  if (Number.isNaN(n) || n < min) return min
  return n
}

// Ανάστροφη αναζήτηση typeKey από το αποθηκευμένο όνομα ενός ticket (edit
// mode) — αν το όνομα ταιριάζει ακριβώς με κάποιο preset label, ξέρουμε
// ποιο dropdown option να δείξει επιλεγμένο· αλλιώς είναι "custom".
function inferTypeKey(name) {
  const entry = Object.entries(TYPE_LABELS).find(([, label]) => label === name)
  return entry ? entry[0] : "custom"
}

function ticketsFromEvent(event) {
  const rows = (event.tickets || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((t) => ({
      key: `existing-${t.id}`,
      typeKey: inferTypeKey(t.name),
      label: t.name,
      price: String(t.price),
      quantity: String(t.quantity),
    }))
  return rows.length > 0 ? rows : [makeTicketGroup()]
}

function dateTimeFromEvent(event) {
  if (!event?.date) return { date: "", time: "" }
  const d = new Date(event.date)
  const pad = (n) => String(n).padStart(2, "0")
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

// Χτίζει τις αρχικές τιμές της φόρμας — άδειες για δημιουργία, ή γεμάτες
// από το υπάρχον event σε edit mode (βλ. props.event παρακάτω).
function buildDefaultValues(event) {
  if (!event) {
    return {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      locationUrl: "",
      latitude: null,
      longitude: null,
      tickets: [makeTicketGroup()],
    }
  }
  const { date, time } = dateTimeFromEvent(event)
  return {
    title: event.title || "",
    description: event.description || "",
    date,
    time,
    location: event.location || "",
    locationUrl: event.location_url || "",
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    tickets: ticketsFromEvent(event),
  }
}

// Βήμα-βήμα δημιουργία/επεξεργασία event από τον tenant admin (13/9, ρητό
// αίτημα χρήστη) — ίδιο "Facebook Page admin" inline μοτίβο με το
// cover/logo/bio (βλ. concerto-brief.md): κουμπί ορατό ΜΟΝΟ σε πραγματικούς
// admins αυτού του tenant (context.isAdmin, βλ. EventsRoute.jsx).
//
// Δύο λειτουργίες στο ίδιο component αντί για ξεχωριστό "Edit" component
// (13/9, ρητό αίτημα χρήστη — μολύβι για επεξεργασία υπάρχοντος event):
// χωρίς prop `event` → "Προσθήκη event" (κουμπί), δημιουργεί νέο· με prop
// `event` → μολύβι, ανοίγει προσυμπληρωμένο, κάνει update αντί για insert.
// Επαναχρησιμοποιεί ΟΛΗ τη λογική του wizard (τοποθεσία, εικόνα,
// κατηγορίες εισιτηρίων, sanitizers) αντί να διπλασιαστεί σε νέο αρχείο —
// πολύ πιο ασφαλές από το να ξαναγραφτεί η ίδια πολύπλοκη λογική δύο φορές.
//
// 4 βήματα: 1) βασικά στοιχεία (ώρα ως 24ωρο κείμενο, ΟΧΙ native time
// picker· τοποθεσία μέσω πραγματικής αναζήτησης Google Maps,
// LocationPickerDialog.jsx — αποθηκεύει ΚΑΙ lat/lng για μελλοντικό
// feature "events κοντά μου"), 2) εικόνα (προαιρετική), 3) κατηγορίες
// εισιτηρίων (dropdown ανά κατηγορία, βλ. TYPE_LABELS, με ενδιάμεση οθόνη
// επιβεβαίωσης πριν προχωρήσει), 4) review + αποθήκευση.
export default function AddEventWizard({ tenantId, event = null }) {
  const isEditMode = !!event
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [confirmingTickets, setConfirmingTickets] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [ticketSelectionError, setTicketSelectionError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const inputRef = useRef(null)

  const uploadImage = useUploadTenantImage()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()

  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventWizardSchema),
    defaultValues: buildDefaultValues(event),
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: "tickets" })
  const ticketValues = watch("tickets") || []
  const pickedLocation = watch("location")

  // Το ίδιο register("time") props (name/onBlur/ref) αλλά με δικό μας
  // onChange από κάτω (βλ. handleTimeChange) — έτσι κρατάμε το πεδίο
  // registered στο react-hook-form χωρίς να το κάνουμε πλήρως controlled.
  const timeField = register("time")

  // Καθαρίζει το προσωρινό blob URL preview — ίδιο pattern με
  // EditCoverImageDialog/EditLogoImageDialog.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function onOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setStep(1)
      setConfirmingTickets(false)
      setFile(null)
      setPreviewUrl(null)
      setTicketSelectionError(null)
      setSubmitError(null)
      reset(buildDefaultValues(event))
    }
  }

  // Αυτόματη εισαγωγή ":" μετά τα 2 πρώτα ψηφία (12/9, ρητό αίτημα χρήστη
  // — live mobile test): σε κινητό το πληκτρολόγιο πάνω σε inputMode="numeric"
  // δεν έχει κουμπί ":", οπότε ο χρήστης δεν μπορούσε να ολοκληρώσει ποτέ
  // τη μορφή "21:00" μόνος του. Τώρα γράφει μόνο ψηφία ("2100") και το
  // πεδίο μόνο του σχηματίζει "21:00" καθώς πληκτρολογεί — το ίδιο μοτίβο
  // με τα πεδία λήξης καρτών. Το zod regex (^([01]\d|2[0-3]):[0-5]\d$)
  // παραμένει το τελικό safety net στο submit.
  function handleTimeChange(event_) {
    const digits = event_.target.value.replace(/\D/g, "").slice(0, 4)
    const formatted = digits.length >= 3 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
    event_.target.value = formatted
    timeField.onChange(event_)
  }

  function handleFileChange(event_) {
    const selected = event_.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  function handleLocationSelected({ location, locationUrl, latitude, longitude }) {
    setValue("location", location, { shouldValidate: true })
    setValue("locationUrl", locationUrl)
    setValue("latitude", latitude)
    setValue("longitude", longitude)
  }

  // Αλλαγή κατηγορίας μέσα σε ΜΙΑ γραμμή εισιτηρίου — "free" κλειδώνει
  // τιμή/ποσότητα (0€ / 100), "custom" αδειάζει το όνομα για να το γράψει
  // ο admin, οι υπόλοιπες βάζουν το σταθερό όνομά τους και ξεκλειδώνουν
  // τα πεδία με λογικές default τιμές (0€, ποσότητα 1 — ο admin τις
  // αλλάζει).
  //
  // Κανόνας επιχείρησης (ρητό αίτημα χρήστη, 13/9): η "Ελεύθερη είσοδος"
  // δεν συνυπάρχει με άλλη κατηγορία — μόλις ο admin επιλέξει οτιδήποτε
  // άλλο (early bird/γενική/vip/custom) σε ΟΠΟΙΑΔΗΠΟΤΕ γραμμή, κάθε ΑΛΛΗ
  // γραμμή που είναι ακόμα σε "free" αφαιρείται αυτόματα — replace() στο
  // field array αντί για remove() ανά index, ώστε να μη μπερδεύονται τα
  // indices μέσα στο ίδιο render.
  function handleTypeChange(index, typeKey) {
    if (typeKey === "free") {
      setValue(`tickets.${index}.typeKey`, "free")
      setValue(`tickets.${index}.label`, TYPE_LABELS.free)
      setValue(`tickets.${index}.price`, "0")
      setValue(`tickets.${index}.quantity`, "100")
      return
    }

    const current = getValues("tickets")
    const updated = current.map((row, i) =>
      i === index
        ? {
            ...row,
            typeKey,
            label: typeKey === "custom" ? "" : TYPE_LABELS[typeKey] || "",
            price: "0",
            quantity: "1",
          }
        : row,
    )
    const survivors = updated.filter((row, i) => i === index || row.typeKey !== "free")
    replace(survivors)
  }

  function handleQuantityBlur(index, event_) {
    const n = sanitizeToInteger(event_.target.value, 1)
    setValue(`tickets.${index}.quantity`, String(n), { shouldValidate: true })
  }

  function handlePriceBlur(index, event_) {
    const n = sanitizeToInteger(event_.target.value, 0)
    setValue(`tickets.${index}.price`, String(n), { shouldValidate: true })
  }

  async function goNext() {
    const fieldsToValidate = STEP_FIELDS[step]
    if (fieldsToValidate) {
      const valid = await trigger(fieldsToValidate)
      if (!valid) return
    }

    // Βήμα 3 (εισιτήρια): πριν προχωρήσει, δείχνει μια ενδιάμεση οθόνη
    // επιβεβαίωσης μέσα στο ίδιο dialog (ρητό αίτημα χρήστη — "να του
    // βγάζει τι έχει γράψει και αν είναι σίγουρος"). Δεν χρησιμοποιούμε
    // δεύτερο, ξεχωριστό Dialog πάνω σε αυτό — δύο φωλιασμένα Radix
    // Dialogs τσακώνονται στο focus trap.
    if (step === 3 && !confirmingTickets) {
      const valid = await trigger("tickets")
      if (!valid) {
        setTicketSelectionError("Έλεγξε τις κατηγορίες εισιτηρίων — λείπει όνομα, τιμή ή ποσότητα.")
        return
      }
      setTicketSelectionError(null)
      setConfirmingTickets(true)
      return
    }

    setStep((s) => s + 1)
  }

  function goBack() {
    if (confirmingTickets) {
      setConfirmingTickets(false)
      return
    }
    setStep((s) => s - 1)
  }

  async function onSubmit(values) {
    setSubmitError(null)
    try {
      let imageUrl = isEditMode ? event.image_url : null
      if (file) {
        imageUrl = await uploadImage.mutateAsync({ tenantId, file, prefix: "event" })
      }
      if (isEditMode) {
        await updateEvent.mutateAsync({ eventId: event.id, tenantId, values, imageUrl })
      } else {
        await createEvent.mutateAsync({ tenantId, values, imageUrl })
      }
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err.message)
    }
  }

  const isSaving = uploadImage.isPending || createEvent.isPending || updateEvent.isPending
  const capacity = ticketValues.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0)
  const currentImageUrl = previewUrl || (isEditMode ? event.image_url : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isEditMode ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          title="Επεξεργασία event"
          aria-label="Επεξεργασία event"
          className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
        >
          <PencilIcon aria-hidden="true" className="size-4" />
        </button>
      ) : (
        <Button type="button" onClick={() => onOpenChange(true)} className="rounded-full">
          <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
          Προσθήκη event
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {confirmingTickets
              ? "Επιβεβαίωση εισιτηρίων"
              : `${isEditMode ? "Επεξεργασία event" : "Νέο event"} — βήμα ${step} από 4`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor="title">Τίτλος</FieldLabel>
                <Input id="title" placeholder="π.χ. Live στο ΣΤΡΑΦΙ" {...register("title")} />
                <FieldError errors={errors.title ? [errors.title] : undefined} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Περιγραφή</FieldLabel>
                <Textarea id="description" rows={3} {...register("description")} />
                <FieldError errors={errors.description ? [errors.description] : undefined} />
              </Field>

              <div className="flex gap-2">
                <Field data-invalid={!!errors.date} className="flex-1">
                  <FieldLabel htmlFor="date">Ημερομηνία</FieldLabel>
                  <Input id="date" type="date" {...register("date")} />
                  <FieldError errors={errors.date ? [errors.date] : undefined} />
                </Field>

                <Field data-invalid={!!errors.time} className="w-28">
                  <FieldLabel htmlFor="time">Ώρα (24ωρο)</FieldLabel>
                  <Input
                    id="time"
                    type="text"
                    inputMode="numeric"
                    placeholder="--:--"
                    maxLength={5}
                    {...timeField}
                    onChange={handleTimeChange}
                  />
                  <FieldError errors={errors.time ? [errors.time] : undefined} />
                </Field>
              </div>

              <Field data-invalid={!!errors.location}>
                <FieldLabel>Τοποθεσία</FieldLabel>
                {pickedLocation ? (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 p-2.5">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-gray-400" />
                      {pickedLocation}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={() => setLocationPickerOpen(true)}>
                      Άλλαξε
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setLocationPickerOpen(true)}>
                    <MapPinIcon aria-hidden="true" className="mr-1.5 size-4" />
                    Αναζήτηση στο Google Maps
                  </Button>
                )}
                <FieldError errors={errors.location ? [errors.location] : undefined} />
              </Field>

              <LocationPickerDialog
                open={locationPickerOpen}
                onOpenChange={setLocationPickerOpen}
                onSelect={handleLocationSelected}
              />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Εικόνα event (προαιρετικό).</p>
              {currentImageUrl && (
                <img alt="" src={currentImageUrl} className="h-32 w-full rounded-lg object-cover" />
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                <PhotoIcon aria-hidden="true" className="mr-1.5 size-4" />
                {file ? file.name : isEditMode && event.image_url ? "Άλλαξε εικόνα" : "Επίλεξε εικόνα"}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ή GIF, έως 5MB.</p>
            </>
          )}

          {step === 3 && !confirmingTickets && (
            <>
              <p className="text-sm text-muted-foreground">
                Κατηγορίες εισιτηρίων — η προεπιλογή είναι ελεύθερη είσοδος. Άνοιξε το μενού
                για να διαλέξεις κάτι άλλο.
              </p>

              {fields.map((field, index) => {
                const typeKey = watch(`tickets.${index}.typeKey`)
                const isFree = typeKey === "free"
                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Select value={typeKey} onValueChange={(val) => handleTypeChange(index, val)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Ελεύθερη είσοδος</SelectItem>
                          <SelectItem value="early_bird">Early Bird</SelectItem>
                          <SelectItem value="general">Γενική είσοδος</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="custom">Άλλο (γράψε δικό σου όνομα)</SelectItem>
                        </SelectContent>
                      </Select>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          aria-label="Αφαίρεση κατηγορίας"
                        >
                          <TrashIcon aria-hidden="true" className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {typeKey === "custom" && (
                      <Field data-invalid={!!errors.tickets?.[index]?.label}>
                        <Input
                          placeholder="Όνομα εισιτηρίου, π.χ. Backstage"
                          {...register(`tickets.${index}.label`)}
                        />
                        <FieldError
                          errors={errors.tickets?.[index]?.label ? [errors.tickets[index].label] : undefined}
                        />
                      </Field>
                    )}

                    <div className="flex gap-2">
                      <Field className="flex-1">
                        <FieldLabel htmlFor={`tickets.${index}.quantity`}>Ποσότητα</FieldLabel>
                        <Input
                          id={`tickets.${index}.quantity`}
                          type="text"
                          inputMode="numeric"
                          disabled={isFree}
                          {...register(`tickets.${index}.quantity`)}
                          onBlur={(e) => handleQuantityBlur(index, e)}
                        />
                      </Field>
                      <Field className="flex-1">
                        <FieldLabel htmlFor={`tickets.${index}.price`}>Τιμή</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={`tickets.${index}.price`}
                            type="text"
                            inputMode="numeric"
                            disabled={isFree}
                            {...register(`tickets.${index}.price`)}
                            onBlur={(e) => handlePriceBlur(index, e)}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>€</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                    </div>
                  </div>
                )
              })}

              {ticketSelectionError && (
                <p className="text-sm text-destructive">{ticketSelectionError}</p>
              )}

              <Button type="button" variant="outline" onClick={() => append(makeTicketGroup())}>
                <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
                Πρόσθεσε άλλη κατηγορία εισιτηρίου
              </Button>
            </>
          )}

          {step === 3 && confirmingTickets && (
            <div className="flex flex-col gap-3 text-sm">
              <p className="text-muted-foreground">
                Αυτές είναι οι κατηγορίες εισιτηρίων που θα δημιουργηθούν — σίγουρος;
              </p>
              <ul className="flex flex-col gap-1.5">
                {ticketValues.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-2.5"
                  >
                    <span className="font-medium text-foreground">{t.label}</span>
                    <span className="text-muted-foreground">
                      {Number(t.price || 0)}€ × {t.quantity || 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-foreground">{watch("title")}</p>
              {watch("description") && (
                <p className="text-muted-foreground">{watch("description")}</p>
              )}
              {watch("date") && watch("time") && (
                <p className="text-muted-foreground">
                  {new Date(`${watch("date")}T${watch("time")}`).toLocaleString("el-GR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {watch("location") && (
                <p className="text-muted-foreground">{watch("location")}</p>
              )}
              <p className="text-muted-foreground">
                Χωρητικότητα (αυτόματο): {capacity} εισιτήρια
              </p>
              <ul className="list-inside list-disc text-muted-foreground">
                {ticketValues.map((t, i) => (
                  <li key={i}>
                    {t.label || "—"}: {Number(t.price || 0)}€ × {t.quantity || 0}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <DialogFooter className="flex justify-between sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={isSaving}>
                Πίσω
              </Button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <Button type="button" onClick={goNext}>
                {confirmingTickets ? "Ναι, συνέχεια" : "Επόμενο"}
              </Button>
            ) : (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Αποθήκευση..." : isEditMode ? "Αποθήκευση" : "Δημιουργία event"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
