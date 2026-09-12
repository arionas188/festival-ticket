import { useOutletContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useFanTenants, useUnfollowTenant } from "../../../queries/useFanTenants"
import { crossTenantHref } from "../../../lib/tenantLink"
import FanListSkeleton from "./FanListSkeleton"

export default function FanTenantsRoute() {
  const { fanId } = useOutletContext()
  const { data: tenants = [], isLoading } = useFanTenants(fanId)
  const unfollow = useUnfollowTenant(fanId)

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Αγαπημένα tenants</h1>

      {isLoading ? (
        <FanListSkeleton rounded="rounded-full" />
      ) : tenants.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Δεν ακολουθείς κανέναν ακόμα.</p>
      ) : (
        <ul role="list" className="mt-6 divide-y divide-gray-100">
          {tenants.map((tenant) => (
            <li key={tenant.tenantId} className="flex items-center gap-4 py-4">
              <img
                alt=""
                src={tenant.logoUrl}
                className="size-12 rounded-full object-cover ring-1 ring-gray-200"
              />
              <div className="flex-1">
                {tenant.domain ? (
                  // Πλήρες, cross-origin href (όχι React Router Link) —
                  // κάθε tenant ζει σε δικό του subdomain, δεν είναι
                  // client-side route μέσα σε αυτή την εφαρμογή.
                  <a
                    href={crossTenantHref(tenant.domain, "/about")}
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {tenant.name}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-gray-900">{tenant.name}</span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => unfollow.mutate(tenant.tenantId)}
                disabled={unfollow.isPending}
              >
                Unfollow
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
