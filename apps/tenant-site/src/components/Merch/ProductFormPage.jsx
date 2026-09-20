import { useEffect, useRef, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { PhotoIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import { productFormSchema } from "../../lib/productFormSchema"
import { CATEGORY_LABELS } from "../../lib/merchCategories"
import { useUploadTenantImage } from "../../queries/useUploadTenantImage"
import { useCreateProduct } from "../../queries/useCreateProduct"
import { useUpdateProduct } from "../../queries/useUpdateProduct"

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif"
const ALL_SIZES = ["S", "M", "L", "XL"]

const CATEGORY_OPTIONS = [
  { value: "clothing", label: CATEGORY_LABELS.clothing },
  { value: "music", label: CATEGORY_LABELS.music },
  { value: "various", label: CATEGORY_LABELS.various },
]

function makeVariantRow(size) {
  return { key: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, size, stock_quantity: "0" }
}

function firstUnusedSize(usedSizes) {
  return ALL_SIZES.find((s) => !usedSizes.includes(s)) || ALL_SIZES[0]
}

// Χτίζει τις αρχικές τιμές της φόρμας — άδειες για δημιουργία, ή γεμάτες
// από το υπάρχον προϊόν σε edit mode (βλ. props.product παρακάτω). Ίδιο
// pattern με EventFormPage.jsx/buildDefaultValues.
function buildDefaultValues(product) {
  if (!product) {
    return {
      name: "",
      description: "",
      category: "clothing",
      price: "",
      stock_quantity: "0",
      variants: [makeVariantRow("S")],
      is_new_arrival: false,
      available_date: "",
      available_time: "",
    }
  }
  return {
    name: product.name || "",
    description: product.description || "",
    category: product.category,
    price: String(product.price ?? ""),
    stock_quantity: String(product.stock_quantity ?? 0),
    variants: (product.product_variants || [])
      .slice()
      .sort((a, b) => ALL_SIZES.indexOf(a.size) - ALL_SIZES.indexOf(b.size))
      .map((v) => ({ key: `existing-${v.id}`, size: v.size, stock_quantity: String(v.stock_quantity) })),
    is_new_arrival: product.is_new_arrival ?? false,
    ...dateTimeFromIso(product.available_from),
  }
}

// 20/9, δεύτερος γύρος (ρητό αίτημα χρήστη -- live test: το native
// datetime-local έδειχνε ΠΜ/ΜΜ αντί για 24ωρο). Ίδιο ΑΚΡΙΒΩΣ μοτίβο με
// dateTimeFromEvent()/handleTimeChange() στο EventFormPage.jsx -- ξεχωριστό
// date (native <input type="date">, ασφαλές, δεν έχει 12/24ωρο ζήτημα) +
// time ως ΚΕΙΜΕΝΟ με δικό μας έλεγχο 24ωρου (βλ. handleTimeChange
// παρακάτω), ΟΧΙ native <input type="time">.
function dateTimeFromIso(isoString) {
  if (!isoString) return { available_date: "", available_time: "" }
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, "0")
  return {
    available_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    available_time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function buildInitialImages(product) {
  return (product?.image_urls || []).map((url, i) => ({
    key: `existing-${i}-${url}`,
    url,
    file: null,
    previewUrl: null,
  }))
}

// Δημιουργία/επεξεργασία merch προϊόντος από τον tenant admin (20/9, ρητό
// αίτημα χρήστη — "widget πρόσθεσε product ... όλα τα βήματα ώστε να
// μπορεί να βάλει όποιο product θέλει σε όποια κατηγορία θέλει, manual,
// αντί να το κάνει μέσα από το Supabase table editor· να μπορεί και να το
// διαγράψει"). ΙΔΙΟ ΑΚΡΙΒΩΣ ρόλο/δομή με EventFormPage.jsx (13/9,
// πραγματική σελίδα αντί για modal — ίδιοι λόγοι, φόρμα με εικόνα/
// δυναμικές γραμμές σε πραγματικό scroll σελίδας), απλά ΧΩΡΙΣ τα
// multi-step/τοποθεσία/επιβεβαίωση κομμάτια του — το προϊόν έχει πολύ
// λιγότερα, πιο απλά πεδία, χωράει άνετα σε ΕΝΑ βήμα. Ίδιο "στυλ σελίδας
// προϊόντος" (ρητό αίτημα χρήστη) — γκρι πλαίσιο (rounded-2xl bg-gray-50)
// γύρω από μια λευκή bordered κάρτα, ίδιο με ProductOverviewRoute.jsx/
// EventFormPage.jsx.
//
// Δύο λειτουργίες στο ίδιο component (χωρίς prop `product` → δημιουργία,
// με prop `product` → επεξεργασία, προσυμπληρωμένη) — καλείται από το
// ProductFormRoute.jsx (routing/data fetching), βλ. εκεί.
export default function ProductFormPage({ tenantId, product = null }) {
  const isEditMode = !!product
  const navigate = useNavigate()
  const [images, setImages] = useState(() => buildInitialImages(product))
  const [imagesError, setImagesError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const inputRef = useRef(null)

  const uploadImage = useUploadTenantImage()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: buildDefaultValues(product),
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: "variants" })
  const category = watch("category")
  const isClothing = category === "clothing"
  const usedSizes = (watch("variants") || []).map((v) => v.size)

  // Ίδιο ΑΚΡΙΒΩΣ "αυτόματο :" pattern με EventFormPage.jsx/handleTimeChange
  // -- ο admin γράφει μόνο ψηφία ("2100"), το πεδίο μόνο του σχηματίζει
  // "21:00". Το register("time") props (name/onBlur/ref) μένουν, με δικό
  // μας onChange από κάτω.
  const availableTimeField = register("available_time")
  function handleAvailableTimeChange(event_) {
    const digits = event_.target.value.replace(/\D/g, "").slice(0, 4)
    const formatted = digits.length >= 3 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
    event_.target.value = formatted
    availableTimeField.onChange(event_)
  }

  // Καθαρίζει τα προσωρινά blob URL previews κατά το unmount — ίδιο
  // pattern με EditLogoImageDialog.jsx/EventFormPage.jsx.
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Εναλλαγή κατηγορίας: μόνο η "clothing" έχει μεγέθη (βλ.
  // lib/merchCategories.js) — φεύγοντας από αυτήν αδειάζουμε τις γραμμές
  // μεγέθους (δεν έχει νόημα να κρατάμε "Small: 5" σε ένα CD), μπαίνοντας
  // σε αυτήν ξεκινάμε με μία άδεια γραμμή αν δεν υπάρχει ήδη καμία.
  function handleCategoryChange(nextCategory) {
    setValue("category", nextCategory, { shouldValidate: true })
    if (nextCategory === "clothing") {
      if (fields.length === 0) append(makeVariantRow("S"))
    } else {
      replace([])
    }
  }

  function handleAddVariant() {
    if (usedSizes.length >= ALL_SIZES.length) return
    append(makeVariantRow(firstUnusedSize(usedSizes)))
  }

  function handleFilesSelected(event_) {
    const selected = Array.from(event_.target.files || [])
    if (selected.length === 0) return
    setImagesError(null)
    const newEntries = selected.map((file) => ({
      key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: null,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newEntries])
    event_.target.value = ""
  }

  function handleRemoveImage(key) {
    setImages((prev) => {
      const target = prev.find((img) => img.key === key)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.key !== key)
    })
  }

  function handleCancel() {
    navigate("/merch")
  }

  async function onSubmit(rawValues) {
    setSubmitError(null)
    if (images.length === 0) {
      setImagesError("Πρόσθεσε τουλάχιστον μία φωτογραφία.")
      return
    }
    setImagesError(null)

    // Κενά date+time -> null = διαθέσιμο αμέσως, ίδια συμπεριφορά με σήμερα.
    // Και τα δύο συμπληρωμένα -> πραγματικό timestamp (ΤΟΠΙΚΗ ώρα του admin
    // -> ISO/UTC), ΙΔΙΟ ΑΚΡΙΒΩΣ μοτίβο με το date+time -> ISO του
    // EventFormPage.jsx/useCreateEvent.js.
    const availableFromIso =
      rawValues.available_date && rawValues.available_time
        ? new Date(`${rawValues.available_date}T${rawValues.available_time}`).toISOString()
        : null
    const values = { ...rawValues, available_from: availableFromIso }

    try {
      // Ανεβάζει ΜΟΝΟ τις καινούριες εικόνες (χωρίς ήδη αποθηκευμένο url) —
      // path "<tenant_id>/products/...", ίδιο bucket "tenant-images" με
      // cover/logo/event (βλ. migration 20260920080000, κανένα νέο bucket).
      const imageUrls = []
      for (const img of images) {
        if (img.url) {
          imageUrls.push(img.url)
        } else {
          const publicUrl = await uploadImage.mutateAsync({
            tenantId,
            file: img.file,
            prefix: "products/product",
          })
          imageUrls.push(publicUrl)
        }
      }

      if (isEditMode) {
        await updateProduct.mutateAsync({ productId: product.id, tenantId, values, imageUrls })
        toast.success("Το προϊόν ενημερώθηκε.")
      } else {
        await createProduct.mutateAsync({ tenantId, values, imageUrls })
        toast.success("Το προϊόν καταχωρήθηκε.")
      }
      navigate("/merch")
    } catch (err) {
      setSubmitError(err.message)
    }
  }

  const isSaving = uploadImage.isPending || createProduct.isPending || updateProduct.isPending

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl bg-gray-50 p-4 pb-24 sm:p-6">
      <h1 className="text-center text-xl font-bold tracking-tight text-gray-900">
        {isEditMode ? "Επεξεργασία προϊόντος" : "Πρόσθεσε προϊόν"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Όνομα</FieldLabel>
            <Input id="name" placeholder="π.χ. T-Shirt Roosters" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Περιγραφή</FieldLabel>
            <Textarea id="description" rows={3} {...register("description")} />
            <FieldError errors={errors.description ? [errors.description] : undefined} />
          </Field>

          <Field data-invalid={!!errors.category}>
            <FieldLabel htmlFor="category">Κατηγορία</FieldLabel>
            <Combobox
              options={CATEGORY_OPTIONS}
              value={category}
              onValueChange={handleCategoryChange}
              triggerClassName="w-full"
            />
            <FieldError errors={errors.category ? [errors.category] : undefined} />
          </Field>

          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor="price">Τιμή (€)</FieldLabel>
            <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
            <FieldError errors={errors.price ? [errors.price] : undefined} />
          </Field>

          {/* Απόθεμα: ΑΠΛΟ πεδίο για ό,τι ΔΕΝ έχει μεγέθη (music/various),
              ή γραμμές-ανά-μέγεθος για ρούχα — ποτέ και τα δύο μαζί, ίδια
              διάκριση με ProductOverviewRoute.jsx/SizeSelector.jsx. */}
          {!isClothing && (
            <Field data-invalid={!!errors.stock_quantity}>
              <FieldLabel htmlFor="stock_quantity">Απόθεμα</FieldLabel>
              <Input id="stock_quantity" type="number" step="1" min="0" {...register("stock_quantity")} />
              <FieldError errors={errors.stock_quantity ? [errors.stock_quantity] : undefined} />
            </Field>
          )}

          {isClothing && (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-gray-900">Μεγέθη &amp; απόθεμα</div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Combobox
                    options={ALL_SIZES.map((s) => ({
                      value: s,
                      label: s,
                      disabled: usedSizes.includes(s) && usedSizes[index] !== s,
                    }))}
                    value={watch(`variants.${index}.size`)}
                    onValueChange={(val) => setValue(`variants.${index}.size`, val, { shouldValidate: true })}
                    triggerClassName="w-24"
                  />
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Απόθεμα"
                    className="flex-1"
                    {...register(`variants.${index}.stock_quantity`)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Αφαίρεση μεγέθους"
                    className="flex size-9 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50"
                  >
                    <TrashIcon aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
              {(errors.variants?.message || errors.variants?.root?.message) && (
                <p className="text-sm text-destructive">
                  {errors.variants.message || errors.variants.root.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                disabled={usedSizes.length >= ALL_SIZES.length}
                className="self-start"
              >
                <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
                Πρόσθεσε μέγεθος
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-gray-900">Φωτογραφίες</div>
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.key} className="relative size-20 overflow-hidden rounded-lg ring-1 ring-gray-200">
                  <img
                    src={img.previewUrl || img.url}
                    alt=""
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.key)}
                    aria-label="Αφαίρεση φωτογραφίας"
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <XMarkIcon aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
              >
                <PhotoIcon aria-hidden="true" className="size-5" />
                <span className="text-[11px]">Πρόσθεσε</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ή GIF, έως 5MB η καθεμία.</p>
            {imagesError && <p className="text-sm text-destructive">{imagesError}</p>}
          </div>

          {/* 20/9, ρητό αίτημα χρήστη: δύο ανεξάρτητες επιλογές --
              "βάλε το και στα New Arrivals" (χειροκίνητο, ανεξάρτητο από
              το πότε καταχωρήθηκε πραγματικά -- βλ. hooks/useMerchCategories.js)
              και προγραμματισμένη διαθεσιμότητα ("θα είναι διαθέσιμο από
              τότε" -- το προϊόν φαίνεται ΚΑΝΟΝΙΚΑ στο κατάστημα από τώρα,
              απλά δεν μπαίνει στο καλάθι μέχρι αυτή την ημερομηνία/ώρα,
              βλ. lib/stockTiers.js/isScheduledUnavailable). Κενό πεδίο
              ημερομηνίας = διαθέσιμο αμέσως, η ίδια συμπεριφορά με σήμερα. */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              {...register("is_new_arrival")}
              className="size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            Να εμφανίζεται και στα New Arrivals
          </label>

          <Field data-invalid={!!errors.available_date || !!errors.available_time}>
            <FieldLabel htmlFor="available_date">
              Προγραμματισμένη διαθεσιμότητα (προαιρετικό)
            </FieldLabel>
            <div className="flex gap-2">
              <Input id="available_date" type="date" className="flex-1" {...register("available_date")} />
              {/* 24ωρο κείμενο, ΟΧΙ native type="time" -- το native δείχνει
                  ΠΜ/ΜΜ ανάλογα με τις ρυθμίσεις περιοχής browser/
                  λειτουργικού, ίδιο ζήτημα/ίδιο fix με το EventFormPage.jsx. */}
              <Input
                id="available_time"
                type="text"
                inputMode="numeric"
                placeholder="--:--"
                maxLength={5}
                className="w-24"
                {...availableTimeField}
                onChange={handleAvailableTimeChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Άσ' τα κενά για άμεση διαθεσιμότητα. Αν βάλεις ημερομηνία και ώρα
              (24ωρο, π.χ. 21:00), το προϊόν φαίνεται κανονικά στο κατάστημα από
              τώρα, αλλά δεν μπορεί να μπει στο καλάθι μέχρι τότε — αλλάζει
              αυτόματα, χωρίς να χρειάζεται να ξανασχοληθείς.
            </p>
            <FieldError
              errors={
                errors.available_date || errors.available_time
                  ? [errors.available_date, errors.available_time].filter(Boolean)
                  : undefined
              }
            />
          </Field>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleCancel} disabled={isSaving}>
            Ακύρωση
          </Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </div>
      </form>
    </div>
  )
}
