import { useMemo, useState } from "react"
import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Πολλαπλή επιλογή "Αγαπημένα tenants" (9/9, β' πέρασμα) — πηγή δεδομένων
// είναι ΟΣΑ πραγματικά ακολουθεί ο fan (useFanTenants), ΟΧΙ όλα τα tenants
// της πλατφόρμας (ρητή διόρθωση χρήστη). Search bar εμφανίζεται ΠΑΝΤΑ στη
// θέση του "— Κανένα —" όταν ανοίγει η λίστα — ρητό αίτημα χρήστη, ώστε
// να μη γίνεται δυσκίνητο scroll αν κάποιος ακολουθεί πολλά (π.χ. 30+)
// tenants. Custom component (όχι shadcn Command/combobox) γιατί
// `npx shadcn add` δεν δουλεύει σε αυτό το sandboxed shell — βλ.
// concerto-forms-and-encryption-brief.md.
export default function FavoriteTenantsPicker({ tenants, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const list = tenants || []
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter((t) => t.name?.toLowerCase().includes(q))
  }, [tenants, search])

  function toggle(tenantId) {
    if (value.includes(tenantId)) {
      onChange(value.filter((id) => id !== tenantId))
    } else {
      onChange([...value, tenantId])
    }
  }

  const selectedNames = (tenants || []).filter((t) => value.includes(t.tenantId)).map((t) => t.name)

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start font-normal"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">
          {selectedNames.length > 0 ? selectedNames.join(", ") : "— Κανένα —"}
        </span>
      </Button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
          {!tenants || tenants.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">Δεν ακολουθείς ακόμα κανένα tenant.</p>
          ) : (
            <>
              {/* Search bar ΑΚΡΙΒΩΣ στη θέση του "— Κανένα —", πάντα ορατό
                  μόλις ανοίξει — όχι μόνο όταν η λίστα είναι μεγάλη, απλό
                  και προβλέψιμο. */}
              <div className="border-b border-border p-2">
                <Input
                  autoFocus
                  placeholder="Αναζήτηση..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <p className="p-2 text-sm text-gray-500">Καμία αντιστοιχία.</p>
                ) : (
                  filtered.map((tenant) => {
                    const checked = value.includes(tenant.tenantId)
                    return (
                      <button
                        key={tenant.tenantId}
                        type="button"
                        onClick={() => toggle(tenant.tenantId)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded border",
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input"
                          )}
                        >
                          {checked && <CheckIcon className="size-3" />}
                        </span>
                        <span className="truncate">{tenant.name}</span>
                      </button>
                    )
                  })
                )}
              </div>
              <div className="border-t border-border p-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  Κλείσιμο
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
