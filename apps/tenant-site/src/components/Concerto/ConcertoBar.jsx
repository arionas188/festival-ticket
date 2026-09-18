import { useState } from "react"
import { Link } from "react-router-dom"
import { UserCircleIcon } from "@heroicons/react/24/solid"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../hooks/useAuth"
import { useFanAccount } from "../../queries/useFanAccount"
import { supabase } from "../../lib/supabase"
import ConcertoAuthDialog from "./ConcertoAuthDialog"
import DeleteAccountDialog from "./DeleteAccountDialog"
import ConcertoLogo from "./ConcertoLogo"

// Global bar — πάνω από το header ΚΑΘΕ tenant, σε κάθε subdomain (βλ.
// concerto-brief.md TODO #13 "ConcertoGlobalBar (Phase 2)"). Μοναδικό
// σημείο login — και, από 7/9, μοναδικό σημείο διαχείρισης λογαριασμού
// (αποσύνδεση/διαγραφή): το παλιό per-tenant dropdown στο TenantTopBar
// αφαιρέθηκε, έμεινε εκεί μόνο σκέτο avatar. Βλ. concerto-react-router-brief.md.
//
// authOpen/onAuthOpenChange έρχονται lifted από το App.jsx — πρέπει να
// ανοίγουν το ΙΔΙΟ dialog όχι μόνο από το κουμπί εδώ, αλλά και από
// "favorite σε προϊόν" / "καλάθι" / "εισιτήριο" σε οποιοδήποτε tenant
// (μέσω Header → Outlet context → child routes).
//
// 18/9, ρητό αίτημα χρήστη — pivot: ΔΕΝ είναι πια συμπαγής navy μπάρα.
// "liquid glass" pill (fixed, ημιδιάφανο, backdrop-blur) πάνω-αριστερά,
// ΠΑΝΩ από το cover image του tenant (Header.jsx) αντί για δική του
// γραμμή από πάνω — position:fixed βγάζει το bar από το normal flow,
// οπότε το cover image ανεβαίνει και γεμίζει τον χώρο, και το pill
// επιπλέει πάνω του (z-40). ΙΔΙΟ οπτικό στυλ ("θολό γυαλί") με το pill
// nav του Fan Dashboard (FanDashboardLayout.jsx, "Sidebar v6") — fixed
// αντί για sticky ΕΠΙΤΗΔΕΣ, ίδιος λόγος όπως εκεί (sticky είχε bug,
// δεν έμενε ορατό σε scroll). w-fit στο pill = μεγαλώνει μόνο του όταν
// προστεθούν κι άλλα εικονίδια αργότερα, καμία επιπλέον δουλειά.
//
// Το εξωτερικό div (w-full ... sm:w-2/3 sm:mx-auto) αντιγράφει ΕΠΙΤΗΔΕΣ
// τις ακριβείς responsive κλάσεις του ίδιου του cover image στο
// Header.jsx — ώστε η αριστερή άκρη να πέφτει ΠΑΝΤΑ πάνω στην πραγματική
// αριστερή άκρη της φωτογραφίας, σε κάθε πλάτος οθόνης (στο sm: και πάνω
// το cover ΔΕΝ είναι πια πλήρους πλάτους, είναι κεντραρισμένο στο 2/3 —
// χωρίς αυτό το matching, θα έπεφτε έξω από τη φωτογραφία σε desktop).
//
// 18/9, ΔΕΥΤΕΡΟ ρητό αίτημα χρήστη (μετά το πρώτο demo screenshot): ΔΕΝ
// είναι πια ένα ενιαίο "pill" που ενώνει logo+avatar — ρητά ζήτησε να
// ΜΗΝ είναι ενωμένα. Τώρα είναι δύο ΞΕΧΩΡΙΣΤΑ στοιχεία με κενό (gap-3)
// μεταξύ τους: το ConcertoLogo χωρίς δικό του πλαίσιο/φόντο (μόνο του,
// το ήδη κυκλικό bg-foreground badge του), και ΜΟΝΟ το avatar έχει το
// "liquid glass" πλαίσιο (border/bg-background/70/backdrop-blur/shadow)
// γύρω του — ρητό αίτημα "μόνο στο avatar να έχει αυτό το πλαίσιο".
// Avatar τέρμα δεξιά (justify-between στο row, ΟΧΙ πλέον δίπλα-δίπλα με
// το logo — τρίτο ρητό αίτημα χρήστη), με κενό από τη δεξιά άκρη
// (pr-4 πάντα, ενώ το pl-4 μηδενίζεται μόνο σε sm: για να συνεχίσει να
// ταιριάζει με το cover). size-8 (32px) — ρητά ΜΙΚΡΟΤΕΡΟ από το logo
// (48px) αριστερά.
export default function ConcertoBar({ authOpen, onAuthOpenChange }) {
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const { user, isLoggedIn } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url

  // Το ConcertoBar πλέον ΔΕΝ ρεντεράρεται καθόλου μέσα στο Fan Dashboard
  // (/account) — βλ. App.jsx. Το reactive guard "μη συνδεδεμένος fan στο
  // /account → πίσω στο /about" που ζούσε εδώ μετακινήθηκε στο ίδιο το
  // FanDashboardLayout.jsx (πιο φυσική θέση — ζει δίπλα στο route που
  // προστατεύει, βλ. concerto-react-router-brief.md, "Sidebar v6").

  // Οδηγεί το κόκκινο badge "1" στο avatar + το κόκκινο "Προφίλ" στο
  // dropdown παρακάτω — βλ. useFanAccount.js/FanProfileRoute.jsx για το
  // γιατί (profile_customized).
  const { data: fanAccount } = useFanAccount(isLoggedIn ? user?.id : null)
  const profileNeedsReview = isLoggedIn && fanAccount?.profile_customized !== true

  return (
    <header className="fixed inset-x-0 top-4 z-40">
      <div className="w-full px-4 sm:mx-auto sm:w-2/3 sm:pl-0">
        <div className="flex w-full items-center justify-between">
          <ConcertoLogo size={48} />

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background/70 shadow-md backdrop-blur-lg"
                >
                  {avatarUrl ? (
                    <img
                      alt="Το προφίλ σου"
                      src={avatarUrl}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                  )}
                  {/* Ίδιο pattern με τα badges αγαπημένων/καλαθιού στο
                      TenantTopBar.jsx — εδώ δεν είναι πραγματικό count, είναι
                      "έχεις κάτι να κάνεις" (συμπλήρωσε το προφίλ σου). */}
                  {profileNeedsReview && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">
                      1
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Ο λογαριασμός μου</DropdownMenuLabel>
                  {/* Ένα μόνο entry point πλέον προς όλο το Fan Dashboard (Προφίλ/
                      Tenants που ακολουθώ/Παραγγελίες — βλ.
                      FanDashboardLayout.jsx) αντί για δύο ξεχωριστά, μόνιμα
                      disabled items όπως πριν. variant="destructive" εδώ είναι
                      το ήδη καθιερωμένο "κόκκινο" pattern αυτού του μενού (βλ.
                      "Διαγραφή λογαριασμού" παρακάτω). */}
                  <DropdownMenuItem asChild variant={profileNeedsReview ? "destructive" : "default"}>
                    <Link to="/account/profile">
                      Προφίλ{profileNeedsReview ? " — συμπλήρωσέ το" : ""}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/* "Για αρχή" εδώ (7/9, μετακομισμένο από το παλιό per-tenant
                    TenantTopBar) — μετακινείται σε δικό της θέση αργότερα. */}
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
                  Διαγραφή λογαριασμού
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>Αποσύνδεση</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              onClick={() => onAuthOpenChange(true)}
              className="shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-lg hover:bg-background/90"
            >
              Σύνδεση
            </Button>
          )}
        </div>
      </div>

      <ConcertoAuthDialog open={authOpen} onOpenChange={onAuthOpenChange} />
      <DeleteAccountDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} />
    </header>
  )
}
