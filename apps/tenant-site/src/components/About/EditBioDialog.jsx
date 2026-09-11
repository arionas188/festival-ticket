import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { tenantProfileSchema } from "../../lib/tenantProfileSchema"
import { useUpdateTenantSettings } from "../../queries/useUpdateTenantSettings"

const bioSchema = tenantProfileSchema.pick({ bio: true })

// Ίδιο μοτίβο με EditCoverImageDialog.jsx (12/9, inline admin-editing) —
// μολύβι δίπλα στο "Πληροφορίες", ορατό ΜΟΝΟ σε πραγματικούς admins αυτού
// του tenant (βλ. InfoRoute.jsx, isAdmin από το Outlet context).
export default function EditBioDialog({ tenantId, currentBio }) {
  const [open, setOpen] = useState(false)
  const updateSettings = useUpdateTenantSettings()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: currentBio || "" },
  })

  function onOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (nextOpen) reset({ bio: currentBio || "" })
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
            <Textarea id="bio" rows={5} {...register("bio")} />
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
