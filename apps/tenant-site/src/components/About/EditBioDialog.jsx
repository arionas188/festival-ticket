import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PencilIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { tenantProfileSchema } from "../../lib/tenantProfileSchema"
import { plainTextToHtml } from "../../lib/richText"
import { useUpdateTenantSettings } from "../../queries/useUpdateTenantSettings"

const bioSchema = tenantProfileSchema.pick({ bio: true })

// Ίδιο μοτίβο με EditCoverImageDialog.jsx (12/9, inline admin-editing) —
// μολύβι δίπλα στο "Πληροφορίες", ορατό ΜΟΝΟ σε πραγματικούς admins αυτού
// του tenant (βλ. InfoRoute.jsx, isAdmin από το Outlet context).
//
// Rich-text editor (12/9, ρητό αίτημα χρήστη — "σαν μικρό Word"): το bio
// αποθηκεύεται πλέον ως HTML (βλ. ui/rich-text-editor.jsx). Το
// plainTextToHtml() εδώ μετατρέπει παλιό, ήδη αποθηκευμένο plain-text bio
// σε παραγράφους την ΠΡΩΤΗ φορά που ανοίγει ο editor πάνω του — δεν αλλάζει
// τίποτα στη βάση από μόνο του, μόνο πώς φορτώνεται μέσα στον editor.
export default function EditBioDialog({ tenantId, currentBio }) {
  const [open, setOpen] = useState(false)
  const updateSettings = useUpdateTenantSettings()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: plainTextToHtml(currentBio) },
  })

  function onOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (nextOpen) reset({ bio: plainTextToHtml(currentBio) })
  }

  function onSubmit(values) {
    updateSettings.mutate({ tenantId, values }, { onSuccess: () => setOpen(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        title="Άλλαξε το bio"
        aria-label="Άλλαξε το bio"
        className="ml-2 inline-flex size-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <PencilIcon aria-hidden="true" className="size-3.5" />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field data-invalid={!!errors.bio}>
            <FieldLabel htmlFor="bio">Κείμενο</FieldLabel>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
            <FieldError errors={errors.bio ? [errors.bio] : undefined} />
          </Field>
          {updateSettings.isError && (
            <p className="text-sm text-destructive">{updateSettings.error.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
