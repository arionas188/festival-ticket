import { Navigate } from "react-router-dom"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { supabase } from "../lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import concertoLogo from "../assets/images/concerto-logo.jpg"

// Η μοναδική δημόσια σελίδα του dashboard. Ίδιο sign-in flow με το
// ConcertoAuthDialog.jsx του tenant-site (redirect flow, Google OAuth) —
// ίδιο Supabase project, όχι ξεχωριστό login σύστημα. Το ΑΝ ο χρήστης
// που θα συνδεθεί είναι πράγματι admin κάποιου tenant ελέγχεται ΜΕΤΑ το
// login, στο DashboardHomePage (μέσω useMyAdminTenants) — όχι εδώ.
export default function LoginPage() {
  const { isLoading, isLoggedIn } = useAdminAuth()

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    })
  }

  if (isLoading) return null
  if (isLoggedIn) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center overflow-hidden rounded-full bg-foreground">
            <img src={concertoLogo} alt="" className="size-full object-cover" />
          </div>
          <CardTitle>Concerto — Tenant Admin</CardTitle>
          <CardDescription>Σύνδεση για διαχειριστές tenant.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            Σύνδεση με Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
