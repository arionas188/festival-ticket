import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
export default function ConcertoBar({ authOpen, onAuthOpenChange }) {
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url
  const location = useLocation()
  const navigate = useNavigate()

  // Bug (8/9): μετά από sign out (απλή αποσύνδεση Ή διαγραφή λογαριασμού —
  // useDeleteAccount.js καταλήγει κι αυτή σε signOut) ενώ ο fan ήταν μέσα
  // στο /account, η σελίδα έμενε "κολλημένη" εκεί χωρίς session (το Fan
  // Dashboard χρειάζεται fan session, δεν έχει tenant chrome να πέσει πίσω).
  // Λύση, "για αρχή" μέχρι να υπάρχει πραγματικό κεντρικό
  // concerto.gr/concertofamily.gr όπου θα ανήκουν όλα τα tenants (τότε θα
  // γίνει redirect εκεί αντί για /about): reactive guard σε ΚΑΘΕ μονοπάτι
  // που καταλήγει σε sign out, όχι μόνο στο κουμπί "Αποσύνδεση" — γυρνάει
  // στο /about του tenant subdomain που ήδη είσαι.
  //
  // authLoading: κρίσιμο — το useAuth() ξεκινάει με session=undefined
  // (isLoggedIn=false) μέχρι να επιβεβαιωθεί το πραγματικό session. Χωρίς
  // αυτόν τον έλεγχο, ένας ΗΔΗ συνδεδεμένος fan που ανοίγει απευθείας
  // /account/... θα έκανε redirect στο /about πριν προλάβει να επιβεβαιωθεί
  // το session του — false positive, live-confirmed bug.
  useEffect(() => {
    if (!authLoading && !isLoggedIn && location.pathname.startsWith("/account")) {
      navigate("/about")
    }
  }, [authLoading, isLoggedIn, location.pathname, navigate])

  // Οδηγεί το κόκκινο badge "1" στο avatar + το κόκκινο "Προφίλ" στο
  // dropdown παρακάτω — βλ. useFanAccount.js/FanProfileRoute.jsx για το
  // γιατί (profile_customized).
  const { data: fanAccount } = useFanAccount(isLoggedIn ? user?.id : null)
  const profileNeedsReview = isLoggedIn && fanAccount?.profile_customized !== true

  return (
    <header className="flex items-center justify-between bg-gray-900 px-4 py-2 sm:px-6">
      <span className="text-sm font-bold tracking-wide text-white">Concerto</span>

      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="relative">
              {avatarUrl ? (
                <img
                  alt="Το προφίλ σου"
                  src={avatarUrl}
                  className="size-7 rounded-full ring-2 ring-white/20"
                />
              ) : (
                <UserCircleIcon aria-hidden="true" className="size-7 text-white/70" />
              )}
              {/* Ίδιο pattern με τα badges αγαπημένων/καλαθιού στο
                  TenantTopBar.jsx — εδώ δεν είναι πραγματικό count, είναι
                  "έχεις κάτι να κάνεις" (συμπλήρωσε το προφίλ σου). */}
              {profileNeedsReview && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  1
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-100"
        >
          Σύνδεση
        </Button>
      )}

      <ConcertoAuthDialog open={authOpen} onOpenChange={onAuthOpenChange} />
      <DeleteAccountDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} />
    </header>
  )
}
