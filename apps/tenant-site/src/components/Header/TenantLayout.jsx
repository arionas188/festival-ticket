import { useOutletContext } from "react-router-dom"
import Header from "./Header"

// Λεπτό wrapper — περνάει tenant/settings/onRequireAuth από το root Outlet
// context (App.jsx) στο Header.jsx, χωρίς να αλλάζει τίποτα μέσα στο ίδιο
// το Header. Χρειάστηκε (8/9) γιατί το routing χωρίστηκε σε δύο clusters
// κάτω από το App: tenant-branded σελίδες (about/merch/events — εδώ) και
// global fan-scoped σελίδες (/account — FanDashboard/FanDashboardLayout.jsx,
// sibling, ΟΧΙ μέσα σε αυτό το layout, ώστε το Fan Dashboard να μην κληρονομεί
// cover/logo/tabs συγκεκριμένου tenant). Βλ. concerto-react-router-brief.md.
export default function TenantLayout() {
  const { tenant, settings, onRequireAuth } = useOutletContext()

  return (
    <div
      style={{
        backgroundColor: settings?.primary_color || "#ffffff",
        minHeight: "100vh",
      }}
    >
      <Header tenant={tenant} settings={settings} onRequireAuth={onRequireAuth} />
    </div>
  )
}
