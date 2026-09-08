import { useState } from "react"
import { NavLink, Outlet, useOutletContext } from "react-router-dom"
import {
  UserCircleIcon,
  HeartIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline"
import { useAuth } from "../../../hooks/useAuth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Fan Dashboard shell — δομή βασισμένη σε reference component (Tailwind
// Plus dashboard) που έδωσε ο χρήστης, αναπαραγμένη με τα δικά μας
// Radix/shadcn primitives (Sheet) αντί για headlessui, όπως πάντα σε αυτό
// το project. Επίτηδες ΔΕΝ αντιγράφηκαν από το reference: το δικό του
// topbar profile dropdown ("Your profile"/"Sign out") — θα διπλασίαζε το
// ήδη υπάρχον global ConcertoBar avatar menu, κάτι που ρητά αποφύγαμε όταν
// φτιάξαμε το ConcertoBar (μία μόνο θέση για account actions)· και το
// search bar / notification bell — δεν έχουμε notifications ή global
// αναζήτηση ακόμα, θα προστεθούν όταν/αν χρειαστούν.
//
// Πλήρως ξεχωριστό layout από το TenantLayout.jsx — καμία tenant chrome
// (cover/logo/tabs), γιατί το Fan Dashboard είναι global, ίδιο ανεξάρτητα
// από ποιο tenant subdomain το άνοιξες. Βλ. src/main.jsx για routing,
// concerto-react-router-brief.md για το πλήρες σκεπτικό.
const NAV_ITEMS = [
  { name: "Προφίλ", to: "/account/profile", icon: UserCircleIcon },
  { name: "Αγαπημένα tenants", to: "/account/tenants", icon: HeartIcon },
  { name: "Αγαπημένα merch", to: "/account/merch", icon: ShoppingBagIcon },
  { name: "Αγαπημένα events", to: "/account/events", icon: CalendarIcon },
  { name: "Παραγγελίες", to: "/account/orders", icon: ClipboardDocumentListIcon },
]

function NavList({ onNavigate }) {
  return (
    <ul role="list" className="flex flex-col items-center space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.name}>
          <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-x-3 rounded-md p-3 text-sm/6 font-semibold",
                isActive
                  ? "bg-white/5 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <item.icon aria-hidden="true" className="size-6 shrink-0" />
            {/* Ορατό label στο mobile Sheet (κάτω από lg), sr-only στο
                μόνιμο desktop icon-rail (lg+) — ίδιο NavList, δύο
                συμπεριφορές, όπως ακριβώς και στο reference. */}
            <span className="lg:sr-only">{item.name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

// "Πού βρίσκομαι" chip — δείχνει το tenant subdomain που άνοιξες το Fan
// Dashboard από, click = πίσω στο /about του. Ίδιο origin πάντα σήμερα
// (δεν υπάρχει ακόμα κεντρικό concerto.gr/concertofamily.gr — βλ.
// App.jsx), οπότε είναι απλή, γρήγορη client-side πλοήγηση, όχι reload.
// tenant/settings έρχονται από το ROOT Outlet context (App.jsx) — το ίδιο
// context που παίρνει και το TenantLayout.jsx.
function TenantChip({ tenant, settings, className }) {
  if (!tenant) return null
  const name = settings?.display_name || tenant.name

  return (
    <NavLink to="/about" title={`Πίσω στο ${name}`} className={className}>
      <img
        alt=""
        src={settings?.logo_url}
        className="size-6 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
      />
      {/* Ίδιο lg:sr-only pattern με το NavList — ορατό στο mobile chip row,
          κρυφό στο στενό (80px) desktop rail, όπου μένει μόνο το λογότυπο
          + tooltip (title attribute παραπάνω). */}
      <span className="truncate lg:sr-only">{name}</span>
    </NavLink>
  )
}

export default function FanDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { tenant, settings } = useOutletContext()

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white lg:hidden">
        <TenantChip
          tenant={tenant}
          settings={settings}
          className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        />
        <div className="flex h-14 items-center gap-x-4 px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button type="button" className="-m-2.5 p-2.5 text-gray-700">
                <span className="sr-only">Άνοιγμα μενού</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="border-0 bg-gray-900 p-0">
              <SheetHeader>
                <SheetTitle className="text-white">Ο λογαριασμός μου</SheetTitle>
              </SheetHeader>
              <nav className="px-2 pb-4">
                <NavList onNavigate={() => setSidebarOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold text-gray-900">Ο λογαριασμός μου</span>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
        <TenantChip
          tenant={tenant}
          settings={settings}
          className="mt-4 flex justify-center"
        />
        <nav className="mt-6">
          <NavList />
        </nav>
      </div>

      <main className="lg:pl-20">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet context={{ fanId: user?.id }} />
        </div>
      </main>
    </div>
  )
}
