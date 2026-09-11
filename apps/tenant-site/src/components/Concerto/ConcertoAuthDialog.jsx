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

// Γενικό, "Concerto"-branded login dialog — ανοίγει από το global
// ConcertoBar, όχι μέσα από συγκεκριμένο tenant, άρα δεν παίρνει
// tenant logo/cover/name όπως το παλιό AuthGateDialog.jsx (εκείνο
// παραμένει στον κώδικα, αλλά αποσυνδεδεμένο — βλ.
// concerto-react-router-brief.md).
export default function ConcertoAuthDialog({ open, onOpenChange }) {
  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <Card className="shadow-2xl">
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
            Ο λογαριασμός σου θα σε ακολουθεί σε κάθε καλλιτέχνη, venue ή festival που θα ανακαλύψεις στο Concerto.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
