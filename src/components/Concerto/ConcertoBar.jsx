import { useState } from "react"
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
import { useFollowAllTenants } from "../../queries/useFollowAllTenants"
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
  const { user, isLoggedIn } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url

  // "Για αρχή" (7/9): μόλις συνδεθεί ένας fan global, ακολουθεί αυτόματα
  // ΟΛΑ τα tenants — βλ. useFollowAllTenants.js για το γιατί/τι εκκρεμεί.
  useFollowAllTenants(isLoggedIn ? user : null)

  return (
    <header className="flex items-center justify-between bg-gray-900 px-4 py-2 sm:px-6">
      <span className="text-sm font-bold tracking-wide text-white">Concerto</span>

      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">
              {avatarUrl ? (
                <img
                  alt="Το προφίλ σου"
                  src={avatarUrl}
                  className="size-7 rounded-full ring-2 ring-white/20"
                />
              ) : (
                <UserCircleIcon aria-hidden="true" className="size-7 text-white/70" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Ο λογαριασμός μου</DropdownMenuLabel>
              <DropdownMenuItem disabled>Προφίλ (σύντομα)</DropdownMenuItem>
              <DropdownMenuItem disabled>Παραγγελίες μου (σύντομα)</DropdownMenuItem>
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
