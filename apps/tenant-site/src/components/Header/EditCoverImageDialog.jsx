import { useEffect, useRef, useState } from "react"
import { PencilIcon, PhotoIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUpdateTenantSettings } from "../../queries/useUpdateTenantSettings"
import { useUploadTenantImage } from "../../queries/useUploadTenantImage"

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif"

// Inline admin-editing πάνω στο ίδιο το δημόσιο site (12/9, ρητό αίτημα
// χρήστη — μοτίβο "Facebook Page admin"): το μολύβι εμφανίζεται ΜΟΝΟ σε
// πραγματικούς admins αυτού του tenant (βλ. Header.jsx, isAdmin μέσω
// useIsTenantAdmin) — ποτέ σε fans.
//
// v2 (12/9, ρητό αίτημα χρήστη): πραγματικό upload εικόνας από τον
// υπολογιστή του admin (αντί για paste URL, βλ. v1) — μέσω
// useUploadTenantImage (Supabase Storage, δύο επίπεδα ασφάλειας, βλ.
// concerto-brief.md). Το αρχείο ανεβαίνει πρώτα (Storage), μετά το
// public URL του γράφεται στο tenant_settings.cover_image_url — ίδιο
// τελικό write με πριν.
export default function EditCoverImageDialog({ tenantId, currentUrl }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const uploadImage = useUploadTenantImage()
  const updateSettings = useUpdateTenantSettings()
  const isSaving = uploadImage.isPending || updateSettings.isPending

  // Καθαρίζει το προσωρινό blob URL preview όταν αλλάζει/φεύγει —
  // αλλιώς διαρρέει μνήμη (ένα ObjectURL ανά επιλεγμένο αρχείο).
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function onOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFile(null)
      setPreviewUrl(null)
      setError(null)
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setError(null)
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function handleSave() {
    if (!file) {
      setOpen(false)
      return
    }
    setError(null)
    try {
      const publicUrl = await uploadImage.mutateAsync({ tenantId, file, prefix: "cover" })
      await updateSettings.mutateAsync({ tenantId, values: { cover_image_url: publicUrl } })
      setOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        title="Άλλαξε το cover image"
        aria-label="Άλλαξε το cover image"
        className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        <PencilIcon aria-hidden="true" className="size-4" />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cover image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <img
            alt=""
            src={previewUrl || currentUrl}
            className="h-32 w-full rounded-lg object-cover"
          />

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <PhotoIcon aria-hidden="true" className="mr-1.5 size-4" />
            {file ? file.name : "Επίλεξε εικόνα"}
          </Button>

          <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ή GIF, έως 5MB.</p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" onClick={handleSave} disabled={isSaving || !file}>
              {isSaving ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
