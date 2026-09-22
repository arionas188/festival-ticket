import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateTenantPost } from "../../queries/useCreateTenantPost"

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp"
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm"
const DURATION_OPTIONS = [
  { value: "3", label: "3 ώρες" },
  { value: "6", label: "6 ώρες" },
  { value: "12", label: "12 ώρες" },
  { value: "24", label: "24 ώρες" },
  { value: "48", label: "48 ώρες" },
]

// Admin-only φόρμα ανάρτησης News (20/9, ρητό αίτημα χρήστη). ΕΙΤΕ
// φωτογραφία ΕΙΤΕ video (ToggleGroup type="single", ρητή απόφαση χρήστη
// -- ποτέ και τα δύο μαζί), ο admin διαλέγει επίσης πόσες ώρες θα μείνει
// ανεβασμένη (3/6/12/24/48) πριν ΜΟΝΙΜΑ διαγραφεί (βλ. migration
// 20260920100000_add_tenant_posts.sql). Ίδιο dialog-μοτίβο με
// EditCoverImageDialog.jsx (useState αντί για react-hook-form/zod -- ίδιο
// επίπεδο πολυπλοκότητας με εκείνο, δεν χρειάζεται παραπάνω εδώ).
export default function NewPostDialog({ tenantId, open, onOpenChange }) {
  const [mediaType, setMediaType] = useState("photo")
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [durationHours, setDurationHours] = useState("24")
  const [caption, setCaption] = useState("")
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const createPost = useCreateTenantPost()

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function resetForm() {
    setFile(null)
    setPreviewUrl(null)
    setCaption("")
    setDurationHours("24")
    setError(null)
  }

  function handleOpenChange(nextOpen) {
    onOpenChange(nextOpen)
    if (!nextOpen) resetForm()
  }

  // Αλλαγή τύπου καθαρίζει το ήδη επιλεγμένο αρχείο -- ένα video δεν
  // πρέπει να μείνει "κολλημένο" αν ο admin αλλάξει γνώμη σε φωτογραφία
  // (και το accept του file input πρέπει να ταιριάζει με τον τύπο).
  function handleMediaTypeChange(nextType) {
    if (!nextType) return // ToggleGroup type="single" επιτρέπει deselect -- το αγνοούμε
    setMediaType(nextType)
    setFile(null)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setError(null)
    if (!selected) return
    setFile(selected)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function handleSubmit() {
    if (!file) {
      setError("Επίλεξε αρχείο.")
      return
    }
    setError(null)
    try {
      await createPost.mutateAsync({
        tenantId,
        file,
        mediaType,
        durationHours: Number(durationHours),
        caption: caption.trim(),
      })
      handleOpenChange(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Νέα ανάρτηση</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <ToggleGroup
            type="single"
            variant="outline"
            value={mediaType}
            onValueChange={handleMediaTypeChange}
            className="w-full"
          >
            <ToggleGroupItem value="photo" className="flex-1">
              Φωτογραφία
            </ToggleGroupItem>
            <ToggleGroupItem value="video" className="flex-1">
              Video
            </ToggleGroupItem>
          </ToggleGroup>

          {previewUrl &&
            (mediaType === "photo" ? (
              <img alt="" src={previewUrl} className="h-40 w-full rounded-lg object-cover" />
            ) : (
              <video src={previewUrl} controls className="h-40 w-full rounded-lg object-cover" />
            ))}

          <input
            ref={inputRef}
            type="file"
            accept={mediaType === "photo" ? PHOTO_ACCEPT : VIDEO_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            {file ? file.name : mediaType === "photo" ? "Επίλεξε φωτογραφία" : "Επίλεξε video"}
          </Button>

          <p className="text-xs text-muted-foreground">
            {mediaType === "photo"
              ? "JPG, PNG ή WEBP -- συμπιέζεται αυτόματα πριν το ανέβασμα."
              : "MP4, MOV ή WEBM, έως 20 δευτερόλεπτα και 25MB."}
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-900">Διάρκεια</label>
            <Select value={durationHours} onValueChange={setDurationHours}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Η ανάρτηση διαγράφεται ΜΟΝΙΜΑ αυτόματα μόλις περάσει η διάρκεια.
            </p>
          </div>

          <Input
            placeholder="Λεζάντα (προαιρετικό)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={createPost.isPending || !file}>
              {createPost.isPending ? "Ανέβασμα..." : "Δημοσίευση"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
