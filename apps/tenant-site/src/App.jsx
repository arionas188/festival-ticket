import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTenant } from "./queries/useTenant";
import ConcertoBar from "./components/Concerto/ConcertoBar";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  const testDomain = window.location.hostname;
  const { data, isLoading, error } = useTenant(testDomain);
  // Lifted εδώ (όχι μέσα στο ConcertoBar) — το login dialog πρέπει να
  // ανοίγει από παντού: από το ίδιο το bar, αλλά και από "favorite σε
  // προϊόν" / "πρόσθεσε στο καλάθι" / "επίλεξε εισιτήριο" σε οποιοδήποτε
  // tenant, όταν ο fan δεν είναι συνδεδεμένος (μέσω Header → onRequireAuth
  // → Outlet context → child routes).
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  // Το Fan Dashboard (/account) έχει το ΔΙΚΟ του pill nav πλέον (βλ.
  // FanDashboardLayout.jsx, "Sidebar v6") — το global ConcertoBar κρύβεται
  // εκεί, ώστε να μην υπάρχουν δύο "μπάρες" ταυτόχρονα.
  const isAccountSection = location.pathname.startsWith("/account");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const { tenant, settings } = data;

  return (
    // TooltipProvider εδώ, στη ρίζα — official απαίτηση του shadcn Tooltip
    // (βλ. concerto-react-router-brief.md, "Sidebar component (shadcn)"):
    // ΟΠΟΙΟΔΗΠΟΤΕ <Tooltip> οπουδήποτε στο δέντρο (π.χ. SidebarMenuButton's
    // tooltip prop) χρειάζεται αυτό το context ancestor, αλλιώς πετάει
    // "Tooltip must be used within TooltipProvider" — ξεχάστηκε αρχικά στο
    // FanDashboardLayout.jsx, έσκαγε η σελίδα σε re-render (π.χ. όταν ο
    // χρήστης πατούσε το SidebarTrigger). Μπαίνει μία φορά εδώ, στη ρίζα,
    // ώστε να καλύπτει ΚΑΙ το μελλοντικό Tenant Admin Dashboard.
    <TooltipProvider>
      {/* Πάνω από ΟΛΑ τα child routes ΕΚΤΟΣ /account — global, όχι
          tenant-branded. Βλ. src/components/Concerto/ConcertoBar.jsx */}
      {!isAccountSection && (
        <ConcertoBar authOpen={authOpen} onAuthOpenChange={setAuthOpen} />
      )}
      {/* Ένα root Outlet, δύο layout clusters από κάτω (βλ. src/main.jsx):
          TenantLayout.jsx (tenant chrome — about/merch/events) και
          FanDashboardLayout.jsx (global, χωρίς tenant chrome — /account).
          Σημείωση: το /account περνάει ΚΙ ΑΥΤΟ από το useTenant() παραπάνω
          (χρειάζεται έγκυρο tenant subdomain για να φορτώσει καθόλου η
          εφαρμογή σήμερα, δεν υπάρχει ακόμα κεντρικό concerto.gr) — δεν
          χρησιμοποιεί tenant/settings, απλά περνάει από τον ίδιο guard. */}
      <Outlet context={{ tenant, settings, onRequireAuth: () => setAuthOpen(true) }} />
    </TooltipProvider>
  );
}

export default App;