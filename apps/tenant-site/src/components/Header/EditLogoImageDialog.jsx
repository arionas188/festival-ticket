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

// Ίδιο μοτίβο με EditCoverImageDialog.jsx (12/9) — μολύβι πάνω στο
// στρογγυλό λογότυπο του tenant, ορατό ΜΟΝΟ σε πραγματικούς admins αυτού
// του tenant (βλ. Header.jsx, isAdmin). Ίδιο upload path (Storage
// bucket "tenant-images"), απλά prefix "logo" αντί για "cover" — ώστε
// τα δύο αρχεία να μην συγκρούονται μέσα στον ίδιο φάκελο tenant.
export default function EditLogoImageDialog({ tenantId, currentUrl }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const uploadImage = useUploadTenantImage()
  const updateSettings = useUpdateTenantSettings()
  const isSaving = uploadImage.isPending || updateSettings.isPending

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
      const publicUrl = await uploadImage.mutateAsync({ tenantId, file, prefix: "logo" })
      await updateSettings.mutateAsync({ tenantId, values: { logo_url: publicUrl } })
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
        title="Άλλαξε το λογότυπο"
        aria-label="Άλλαξε το λογότυπο"
        className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-black/60 text-white ring-2 ring-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        <PencilIcon aria-hidden="true" className="size-3.5" />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Λογότυπο</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <img
            alt=""
            src={previewUrl || currentUrl}
            className="size-24 rounded-full object-cover ring-4 ring-white"
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

          <DialogFooter className="w-full">
            <Button type="button" onClick={handleSave} disabled={isSaving || !file}>
              {isSaving ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
