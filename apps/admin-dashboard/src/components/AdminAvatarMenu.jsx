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
import { supabase } from "../lib/supabase"

// Ίδιο μοτίβο με το AccountAvatarMenu.jsx του tenant-site (Fan Dashboard) —
// στρογγυλό κουμπί με avatar, dropdown με λίγες επιλογές. Εδώ, ΧΩΡΙΣ
// "Προφίλ"/"Διαγραφή λογαριασμού" (αυτά αφορούν fan accounts, όχι admins) —
// μόνο "Αποσύνδεση", σκόπιμα μικρότερο.
export default function AdminAvatarMenu({ user }) {
  const avatarUrl = user?.user_metadata?.avatar_url
  // Το avatar URL του Google μερικές φορές αποτυγχάνει να φορτώσει
  // (broken image) — onError πέφτει πίσω στο εικονίδιο αντί να αφήνει
  // σπασμένη εικόνα (12/9, βλ. concerto-brief.md). key={avatarUrl}
  // ώστε να ξαναδοκιμάζει από την αρχή αν αλλάξει ο χρήστης/URL.
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = !!avatarUrl && !imageFailed

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Ο λογαριασμός μου"
        aria-label="Ο λογαριασμός μου"
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-hidden transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {showImage ? (
          <img
            key={avatarUrl}
            alt=""
            src={avatarUrl}
            className="size-8 rounded-full ring-1 ring-border"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <UserCircleIcon aria-hidden="true" className="size-6" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => supabase.auth.signOut()}>Αποσύνδεση</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
