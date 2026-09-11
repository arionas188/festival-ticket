import { useOutletContext, Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { useMyAdminTenants } from "../queries/useMyAdminTenants"

// Λίστα των tenants που διαχειρίζεται ο συνδεδεμένος admin (πολλαπλά
// tenants ανά admin υποστηρίζονται φυσικά, βλ. tenant_admins). Κενή λίστα
// σημαίνει ότι ο λογαριασμός δεν έχει ακόμα admin δικαιώματα σε κανένα
// tenant (bootstrap γίνεται με SQL προς το παρόν, βλ. concerto-brief.md).
//
// Ο εξωτερικός container (mx-auto/max-w/padding) δίνεται πλέον από το
// App.jsx (ίδιο μοτίβο με το FanDashboardLayout.jsx) — εδώ μόνο το
// περιεχόμενο της σελίδας.
export default function DashboardHomePage() {
  const { user } = useOutletContext()
  const { data: tenants, isLoading } = useMyAdminTenants(user?.id)

  return (
    <div>
      <p className="mb-6 text-sm font-semibold text-foreground">Τα tenants μου</p>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Φόρτωση...</p>
        ) : tenants && tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Link key={tenant.id} to={`/tenant/${tenant.id}/profile`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 px-4">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted" />
                  )}
                  <span className="font-medium text-foreground">{tenant.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Δεν διαχειρίζεσαι κανένα tenant ακόμα.
          </p>
        )}
      </div>
    </div>
  )
}
