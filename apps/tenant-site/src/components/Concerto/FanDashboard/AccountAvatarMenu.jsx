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
import { useAuth } from "../../../hooks/useAuth"
import { useFanAccount } from "../../../queries/useFanAccount"
import { supabase } from "../../../lib/supabase"
import DeleteAccountDialog from "../DeleteAccountDialog"

// Μετακινήθηκε εδώ από το ConcertoBar.jsx (βλ. concerto-react-router-brief.md,
// "Sidebar v6 — pill στη θέση του ConcertoBar"). ΙΔΙΕΣ επιλογές
// (Προφίλ/Διαγραφή λογαριασμού/Αποσύνδεση), αλλά ξεχωριστό, μικρότερο
// component — σκόπιμα ΔΕΝ έγινε shared με το ConcertoBar.jsx, γιατί εδώ
// (μέσα στο ίδιο το Fan Dashboard) ο fan είναι ΠΑΝΤΑ ήδη συνδεδεμένος
// (βλ. guard στο FanDashboardLayout.jsx) — δεν χρειάζεται το "not logged
// in" branch/login button/ConcertoAuthDialog που έχει το ConcertoBar.jsx
// για τις tenant-branded σελίδες. Μικρή, ηθελημένη επανάληψη κώδικα αντί
// για πρόωρο shared abstraction — βλ. brief για το σκεπτικό.
export default function AccountAvatarMenu() {
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const { user } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url
  const { data: fanAccount } = useFanAccount(user?.id)
  const profileNeedsReview = fanAccount?.profile_customized !== true
  // Το avatar URL του Google μερικές φορές αποτυγχάνει να φορτώσει
  // (broken image) — onError πέφτει πίσω στο εικονίδιο αντί να αφήνει
  // σπασμένη εικόνα (12/9, βλ. concerto-brief.md). key={avatarUrl}
  // ώστε να ξαναδοκιμάζει από την αρχή αν αλλάξει ο χρήστης/URL.
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = !!avatarUrl && !imageFailed

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          title="Ο λογαριασμός μου"
          aria-label="Ο λογαριασμός μου"
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-hidden transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showImage ? (
            <img
              key={avatarUrl}
              alt="Το προφίλ σου"
              src={avatarUrl}
              className="size-8 rounded-full ring-1 ring-border"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <UserCircleIcon aria-hidden="true" className="size-6" />
          )}
          {profileNeedsReview && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              1
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ο λογαριασμός μου</DropdownMenuLabel>
            <DropdownMenuItem asChild variant={profileNeedsReview ? "destructive" : "default"}>
              <Link to="/account/profile">
                Προφίλ{profileNeedsReview ? " — συμπλήρωσέ το" : ""}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
            Διαγραφή λογαριασμού
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => supabase.auth.signOut()}>Αποσύνδεση</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAccountDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} />
    </>
  )
}
