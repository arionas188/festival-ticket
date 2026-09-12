import { useOutletContext } from "react-router-dom"
import { useFanCart } from "../../../queries/useFanCart"
import { crossTenantHref } from "../../../lib/tenantLink"
import { Skeleton } from "@/components/ui/skeleton"

// Πραγματική λειτουργικότητα πλέον (πριν ήταν placeholder) — δείχνει ό,τι
// έχει ήδη ο fan στο καλάθι του, ομαδοποιημένο ΑΝΑ tenant (βλ.
// useFanCart.js). Read-only: η μεταβολή ποσότητας/αφαίρεση γίνεται στο
// ίδιο το tenant (CartDialog.jsx εκεί) — εδώ μόνο link "πίσω στο tenant"
// ανά group, όχι διπλή υλοποίηση του ίδιου CRUD.
export default function FanCurrentCartRoute() {
  const { fanId } = useOutletContext()
  const { data: groups = [], isLoading } = useFanCart(fanId)

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Τρέχον καλάθι</h1>

      {isLoading ? (
        <div className="mt-6 flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {Array.from({ length: 2 }).map((__, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="size-12 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          Δεν έχεις τίποτα στο καλάθι σου αυτή τη στιγμή, σε κανένα tenant.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.tenantId} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    alt=""
                    src={group.tenantLogoUrl}
                    className="size-8 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {group.tenantName}
                  </span>
                </div>
                {group.domain && (
                  <a
                    href={crossTenantHref(group.domain, "/merch")}
                    className="text-xs font-medium text-gray-500 hover:underline"
                  >
                    Άνοιγμα καλαθιού →
                  </a>
                )}
              </div>

              <ul role="list" className="mt-3 divide-y divide-gray-100">
                {group.items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <img
                      src={product.image_urls?.[0]}
                      alt={product.name}
                      className="size-12 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {quantity} × {Number(product.price).toFixed(2)}€
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs font-medium text-gray-500">Σύνολο</span>
                <span className="text-sm font-semibold text-gray-900">
                  {group.subtotal.toFixed(2)}€
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
