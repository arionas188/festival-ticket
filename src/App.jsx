import { useState } from "react";
import { useTenant } from "./queries/useTenant";
import Header from "./components/Header/Header";
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
      {/* Πάντα πάνω από το header ΚΑΘΕ tenant — global, όχι tenant-branded.
          Βλ. src/components/Concerto/ConcertoBar.jsx */}
      <ConcertoBar authOpen={authOpen} onAuthOpenChange={setAuthOpen} />
      <div
        style={{
          backgroundColor: settings?.primary_color || "#ffffff",
          minHeight: "100vh",
        }}
      >
        <Header tenant={tenant} settings={settings} onRequireAuth={() => setAuthOpen(true)} />
      </div>
    </>
  );
}

export default App;