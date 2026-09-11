import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { tenantProfileSchema } from "../lib/tenantProfileSchema"
import { useTenantProfile } from "../queries/useTenantProfile"
import { useUpdateTenantProfile } from "../queries/useUpdateTenantProfile"

// Σελίδα επεξεργασίας προφίλ ενός tenant (bio/logo/cover) — γράφει στο
// tenant_settings μέσω useUpdateTenantProfile, το οποίο βασίζεται στο
// RLS write policy "tenant admins can update their own tenant settings"
// (μόνο admin του συγκεκριμένου tenant μπορεί να αλλάξει τιμές — βλ.
// tenant_admins migration). Ίδιο μοτίβο φόρμας με το FanProfileRoute.jsx
// του tenant-site: react-hook-form + zodResolver + shadcn Field/FieldLabel/
// FieldError.
//
// Ο εξωτερικός container δίνεται από το App.jsx· η επιστροφή στην αρχική
// γίνεται πλέον από το λογότυπο/"Αρχική" στο πάνω pill menu, όχι από
// ξεχωριστό "← Πίσω" link εδώ (ίδια λογική με το Fan Dashboard).
export default function TenantProfilePage() {
  const { tenantId } = useParams()
  const { data: profile, isLoading } = useTenantProfile(tenantId)
  const updateProfile = useUpdateTenantProfile()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tenantProfileSchema),
    defaultValues: { bio: "", logo_url: "", cover_image_url: "" },
  })

  // Συγχρονίζει τη φόρμα με τη βάση κάθε φορά που έρχονται/ανανεώνονται
  // τα δεδομένα (ίδιο μοτίβο με FanProfileRoute — reset(), όχι setState
  // ανά πεδίο).
  useEffect(() => {
    if (!profile) return
    reset({
      bio: profile.bio || "",
      logo_url: profile.logo_url || "",
      cover_image_url: profile.cover_image_url || "",
    })
  }, [profile, reset])

  function onSubmit(values) {
    setSaved(false)
    updateProfile.mutate(
      { tenantId, values },
      { onSuccess: () => setSaved(true) },
    )
  }

  if (isLoading) return null

  return (
    <div>
      <p className="mb-6 text-sm font-semibold text-foreground">Προφίλ tenant</p>

      <Card>
        <CardHeader>
          <CardTitle>Bio &amp; εικόνες</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Field data-invalid={!!errors.bio}>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea id="bio" rows={5} {...register("bio")} />
              <FieldError errors={errors.bio ? [errors.bio] : undefined} />
            </Field>

            <Field data-invalid={!!errors.logo_url}>
              <FieldLabel htmlFor="logo_url">Logo URL</FieldLabel>
              <Input id="logo_url" type="url" placeholder="https://..." {...register("logo_url")} />
              <FieldError errors={errors.logo_url ? [errors.logo_url] : undefined} />
            </Field>

            <Field data-invalid={!!errors.cover_image_url}>
              <FieldLabel htmlFor="cover_image_url">Cover image URL</FieldLabel>
              <Input
                id="cover_image_url"
                type="url"
                placeholder="https://..."
                {...register("cover_image_url")}
              />
              <FieldError errors={errors.cover_image_url ? [errors.cover_image_url] : undefined} />
            </Field>

            {updateProfile.isError ? (
              <p className="text-sm text-destructive">{updateProfile.error.message}</p>
            ) : null}
            {saved ? <p className="text-sm text-emerald-600">Αποθηκεύτηκε.</p> : null}

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
