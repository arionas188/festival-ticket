import { useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom"
import {
  UserCircleIcon,
  HeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import {
  UserCircleIcon as UserCircleIconSolid,
  HeartIcon as HeartIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
} from "@heroicons/react/24/solid"
import { useAuth } from "../../../hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AccountAvatarMenu from "./AccountAvatarMenu"
import concertoLogo from "@/assets/images/concerto-logo.jpg"

// Fan Dashboard shell — v6 (βλ. concerto-react-router-brief.md, "Sidebar
// v6 — pill στη θέση του ConcertoBar"): το pill nav (v5) ανέβηκε στη θέση
// του global ConcertoBar (που κρύβεται πλέον μέσα στο /account, βλ.
// App.jsx) — sticky, με κενό από πάνω, οριζόντια κεντραρισμένο, ημιδιάφανο
// με blur ώστε να μην καλύπτει το περιεχόμενο πίσω του καθώς κάνει scroll
// ο χρήστης μαζί του.
//
// Δύο νέα items μέσα στο pill:
// - Το πραγματικό λογότυπο Concerto (αντί για το προσωρινό "C") — ΧΩΡΙΣ
//   link προς το παρόν (δεν υπάρχει ακόμα το concertofamily.gr, βλ.
//   σχόλιο παρακάτω στο ίδιο το JSX).
// - AccountAvatarMenu — το ΙΔΙΟ dropdown (Προφίλ/Διαγραφή/Αποσύνδεση) που
//   είχε το ConcertoBar, μετακομισμένο εδώ (own component, βλ. εκεί).
//
// Το reactive guard "μη συνδεδεμένος fan → πίσω στο /about" μετακομίζει
// ΕΔΩ από το ConcertoBar.jsx — πιο φυσική θέση, δίπλα στο route που
// προστατεύει. Δεν χρειάζεται πια το location.pathname.startsWith
// ("/account") check που είχε εκεί: αυτό το layout ΕΙΝΑΙ το /account.
const NAV_ITEMS = [
  {
    title: "Προφίλ",
    to: "/account/profile",
    icon: UserCircleIcon,
    activeIcon: UserCircleIconSolid,
  },
  {
    title: "Αγαπημένα",
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
    items: [
      { title: "Αγαπημένα tenants", to: "/account/tenants" },
      { title: "Αγαπημένα merch", to: "/account/merch" },
      // Μόνο επερχόμενα events — βλ. brief, business rule προς
      // υλοποίηση στο query όταν χτιστεί το πραγματικό data layer.
      { title: "Αγαπημένα events", to: "/account/events" },
    ],
  },
  {
    title: "Καλάθι",
    icon: ShoppingCartIcon,
    activeIcon: ShoppingCartIconSolid,
    items: [
      {
        title: "Ολοκληρωμένες παραγγελίες",
        to: "/account/orders",
        icon: CheckCircleIcon,
      },
      { title: "Τρέχον καλάθι", to: "/account/cart" },
    ],
  },
]

function isPathActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

// Στρογγυλό εικονίδιο-κουμπί μέσα στο pill — ήσυχο γκρι φόντο (bg-muted)
// πίσω από το επιλεγμένο, χωρίς μεμονωμένο border (το pill container έχει
// το δικό του περίγραμμα) — στυλ Instagram bottom bar.
function iconButtonClass(active) {
  return cn(
    "relative flex size-11 shrink-0 items-center justify-center rounded-full transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  )
}

export default function FanDashboardLayout() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const { tenant, settings } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()
  const tenantName = settings?.display_name || tenant?.name

  // Bug (8/9, μετακομισμένο 10/9 από το ConcertoBar.jsx — βλ. brief): μετά
  // από sign out (απλή αποσύνδεση Ή διαγραφή λογαριασμού) ενώ ο fan ήταν
  // μέσα στο /account, η σελίδα έμενε "κολλημένη" εκεί χωρίς session.
  // authLoading: κρίσιμο — χωρίς αυτόν τον έλεγχο, ένας ΗΔΗ συνδεδεμένος
  // fan θα έκανε redirect στο /about πριν προλάβει να επιβεβαιωθεί το
  // session του (false positive, live-confirmed bug τότε).
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/about")
    }
  }, [authLoading, isLoggedIn, navigate])

  return (
    <div>
      {/* fixed αντί για sticky (10/9, βλ. brief) — το sticky δεν έμενε
          ορατό κατά το scroll (πιθανό ancestor/stacking ζήτημα). Το fixed
          είναι πάντα σχετικό με το viewport, ανεξάρτητο από τον γονέα
          του, οπότε "κατεβαίνει μαζί" με τον χρήστη χωρίς αμφιβολία.
          bg-background/70 + backdrop-blur-lg για πιο έντονο "θολό γυαλί"
          — να φαίνονται τα χρώματα του περιεχομένου από κάτω καθώς
          κάνει scroll. */}
      <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Πλοήγηση λογαριασμού"
          className="flex w-fit items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1.5 shadow-md backdrop-blur-lg"
        >
            {/* Concerto — ΕΠΙΤΗΔΕΣ χωρίς link προς το παρόν (10/9, ρητό
                αίτημα χρήστη): δεν υπάρχει ακόμα σελίδα στο
                concertofamily.gr, οπότε δεν πρέπει να κάνει τίποτα όταν
                το πατάει κάποιος — μόνο εικόνα. Θα ξαναγίνει link
                (href="https://concertofamily.gr") όταν υπάρξει
                πραγματικός προορισμός. */}
            <div
              title="Concerto"
              aria-label="Concerto"
              className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground"
            >
              <img src={concertoLogo} alt="" className="size-full object-cover" />
            </div>

            <AccountAvatarMenu />

            {NAV_ITEMS.map((item) => {
              // Leaf item ("Προφίλ") — απλός σύνδεσμος, χωρίς dropdown.
              if (!item.items) {
                const active = isPathActive(location.pathname, item.to)
                const Icon = active ? item.activeIcon : item.icon
                return (
                  <NavLink
                    key={item.title}
                    to={item.to}
                    title={item.title}
                    aria-label={item.title}
                    className={iconButtonClass(active)}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </NavLink>
                )
              }

              // Group item ("Αγαπημένα", "Καλάθι") — DropdownMenu με τις
              // υποκατηγορίες, ανοίγει κάτω από το εικονίδιο.
              const groupActive = item.items.some((subItem) =>
                isPathActive(location.pathname, subItem.to)
              )
              const GroupIcon = groupActive ? item.activeIcon : item.icon

              return (
                <DropdownMenu key={item.title} modal={false}>
                  <DropdownMenuTrigger
                    title={item.title}
                    aria-label={item.title}
                    className={iconButtonClass(groupActive)}
                  >
                    <GroupIcon className="size-6" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {item.items.map((subItem) => {
                      const subActive = isPathActive(location.pathname, subItem.to)
                      return (
                        <DropdownMenuItem key={subItem.title} asChild>
                          <NavLink
                            to={subItem.to}
                            className={cn(
                              "flex items-center gap-2",
                              subActive && "bg-accent font-medium text-accent-foreground"
                            )}
                          >
                            {subItem.icon && (
                              <subItem.icon
                                className="size-4 text-green-600"
                                aria-hidden="true"
                              />
                            )}
                            <span>{subItem.title}</span>
                          </NavLink>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}

            {/* Tenant avatar — πίσω στο /about του tenant που άνοιξε το
                Fan Dashboard (ίδια λειτουργικότητα με το παλιό
                TenantChip). */}
            {tenant && (
              <NavLink
                to="/about"
                title={`Πίσω στο ${tenantName}`}
                aria-label={`Πίσω στο ${tenantName}`}
                className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
              >
                <img
                  alt=""
                  src={settings?.logo_url}
                  className="size-full object-cover"
                />
              </NavLink>
            )}
        </nav>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm font-semibold text-foreground">Ο λογαριασμός μου</p>
        <Outlet context={{ fanId: user?.id }} />
      </div>
    </div>
  )
}
