import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { supabase } from "../../lib/supabase"

export default function AuthGateDialog({ open, onOpenChange, tenantName, tenantLogo, tenantCover }) {
  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pt-10 sm:max-w-sm">
        <Card className="relative z-10 shadow-2xl">
          <img
            src={tenantCover}
            alt=""
            className="h-20 w-full object-cover"
          />

          <div className="-mt-8 flex justify-center">
            <img
              src={tenantLogo}
              alt={tenantName}
              className="size-16 rounded-full object-cover ring-4 ring-white"
            />
          </div>

          <CardHeader className="items-center text-center">
            <CardTitle>Σύνδεση</CardTitle>
            <CardDescription>Γίνε μέλος της οικογένειας Concerto</CardDescription>
          </CardHeader>

          <CardContent>
            <Button type="button" className="w-full" onClick={handleGoogleSignIn}>
              Συνέχεια με Google
            </Button>
          </CardContent>
        </Card>

        <div className="px-4 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Ο λογαριασμός σου θα σε ακολουθεί σε κάθε artist που θα ανακαλύψεις στο Concerto.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}