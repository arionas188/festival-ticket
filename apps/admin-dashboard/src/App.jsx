import { NavLink, Navigate, Outlet } from "react-router-dom"
import { HomeIcon } from "@heroicons/react/24/outline"
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid"
import { useAdminAuth } from "./hooks/useAdminAuth"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import AdminAvatarMenu from "./components/AdminAvatarMenu"
import concertoLogo from "./assets/images/concerto-logo.jpg"

// Root layout — ένα μόνο "φρουρός": αν δεν είσαι συνδεδεμένος, πάς στο
// /login. Ό,τι ελέγχει "είσαι ΚΑΙ admin κάποιου tenant" γίνεται πιο μέσα
// (DashboardHomePage/useMyAdminTenants), όχι εδώ — εδώ ελέγχουμε μόνο
// authentication, όχι authorization (ίδια διάκριση που συζητήσαμε με τον
// χρήστη πριν χτίσουμε οτιδήποτε, βλ. concerto-brief.md).
//
// UI style (12/9, ρητό αίτημα χρήστη): ίδια φιλοσοφία με το Fan Dashboard
// του tenant-site (FanDashboardLayout.jsx) — fixed, στρογγυλεμένο "pill"
// menu πάνω-κέντρο, ημιδιάφανο με blur, με το λογότυπο Concerto αριστερά
// και avatar menu δεξιά. Εδώ πολύ πιο απλό (ένα μόνο nav item, "Αρχική")
// αφού το admin-dashboard δεν έχει ακόμα πολλές σελίδες.
export default function App() {
  const { isLoading, isLoggedIn, user } = useAdminAuth()

  if (isLoading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />

  return (
    <TooltipProvider>
      <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Πλοήγηση διαχείρισης"
          className="flex w-fit items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1.5 shadow-md backdrop-blur-lg"
        >
          <div
            title="Concerto — Tenant Admin"
            aria-label="Concerto — Tenant Admin"
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground"
          >
            <img src={concertoLogo} alt="" className="size-full object-cover" />
          </div>

          <NavLink
            to="/"
            end
            title="Αρχική"
            aria-label="Αρχική"
            className={({ isActive }) =>
              cn(
                "relative flex size-11 shrink-0 items-center justify-center rounded-full transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? HomeIconSolid : HomeIcon
              return <Icon className="size-6" aria-hidden="true" />
            }}
          </NavLink>

          <AdminAvatarMenu user={user} />
        </nav>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <Outlet context={{ user }} />
      </div>
    </TooltipProvider>
  )
}
