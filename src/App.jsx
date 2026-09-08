import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTenant } from "./queries/useTenant";
import ConcertoBar from "./components/Concerto/ConcertoBar";

function App() {
  const testDomain = window.location.hostname;
  const { data, isLoading, error } = useTenant(testDomain);
  // Lifted εδώ (όχι μέσα στο ConcertoBar) — το login dialog πρέπει να
  // ανοίγει από παντού: από το ίδιο το bar, αλλά και από "favorite σε
  // προϊόν" / "πρόσθεσε στο καλάθι" / "επίλεξε εισιτήριο" σε οποιοδήποτε
  // tenant, όταν ο fan δεν είναι συνδεδεμένος (μέσω Header → onRequireAuth
  // → Outlet context → child routes).
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const { tenant, settings } = data;

  return (
    <>
      {/* Πάντα πάνω από ΟΛΑ τα child routes — global, όχι tenant-branded.
          Βλ. src/components/Concerto/ConcertoBar.jsx */}
      <ConcertoBar authOpen={authOpen} onAuthOpenChange={setAuthOpen} />
      {/* Ένα root Outlet, δύο layout clusters από κάτω (βλ. src/main.jsx):
          TenantLayout.jsx (tenant chrome — about/merch/events) και
          FanDashboardLayout.jsx (global, χωρίς tenant chrome — /account).
          Σημείωση: το /account περνάει ΚΙ ΑΥΤΟ από το useTenant() παραπάνω
          (χρειάζεται έγκυρο tenant subdomain για να φορτώσει καθόλου η
          εφαρμογή σήμερα, δεν υπάρχει ακόμα κεντρικό concerto.gr) — δεν
          χρησιμοποιεί tenant/settings, απλά περνάει από τον ίδιο guard. */}
      <Outlet context={{ tenant, settings, onRequireAuth: () => setAuthOpen(true) }} />
    </>
  );
}

export default App;