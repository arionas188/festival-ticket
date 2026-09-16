import { useState } from "react"
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { DEFAULT_FILTERS } from "./filterDefaults"

const SORT_OPTIONS = [
  { value: "newest", label: "Νεότερα πρώτα" },
  { value: "price_asc", label: "Τιμή: Χαμηλή → Υψηλή" },
  { value: "price_desc", label: "Τιμή: Υψηλή → Χαμηλή" },
]

const SIZE_OPTIONS = ["S", "M", "L", "XL"]

// 16/9, ρητό αίτημα χρήστη — πλήρης επανασχεδίαση, αντικαθιστά το παλιό
// ορατό "Ταξινόμηση" row (icon + κείμενο, Sheet από αριστερά):
//
//  - Το trigger είναι ένα κυκλικό, ημιδιάφανο κουμπί — στυλ βασισμένο στο
//    κουμπί "αγαπημένα" πάνω στην κάρτα προϊόντος (bg-white/80 +
//    backdrop-blur, βλ. ProductList.jsx), ρητό αίτημα χρήστη ("το εικονίδιο
//    σε κύκλο όπως..."). Το Radix Sheet trigger/content pattern δουλεύει
//    μέσω context, όχι θέσης στο DOM — το component μπορεί να ρεντεράρεται
//    οπουδήποτε.
//  - Το panel ανοίγει πλέον από ΠΑΝΩ (side="top"), "μέχρι τα μέσα της
//    οθόνης" — max-h-[70vh] + εσωτερικό scroll αν δεν χωράει, ΟΧΙ ολόκληρη
//    οθόνη.
//  - Η θέση του (2η, 3η, 4η δοκιμή αυθημερόν στις 16/9 — `position: fixed`
//    στο κέντρο της οθόνης → ίδια γραμμή με το pill → ΤΕΛΙΚΑ δική του
//    γραμμή ΚΑΤΩ από το pill, τέρμα αριστερά) καθορίζεται εξ ολοκλήρου
//    από το MerchBreadcrumb (`action` prop) — βλ. αναλυτικό σχόλιο εκεί.
//    Το ίδιο το trigger δεν χρειάζεται να ξέρει τίποτα για τη θέση του,
//    μόνο το δικό του visual στυλ.
//  - Στυλ "liquid glass" (ρητό αίτημα χρήστη — και τα δύο, breadcrumb pill
//    ΚΑΙ κουμπί, πιο blur): πιο δυνατό backdrop-blur (blur-2xl αντί για
//    md) + πιο διάφανο φόντο (bg-white/25 αντί για /80) + λευκό ring
//    (ring-white/40 αντί για ring-gray-900/5) ώστε να μοιάζει με θολωμένο
//    γυαλί, όχι συμπαγές λευκό.
//  - Νέα φίλτρα πέρα από ταξινόμηση, ρητό αίτημα χρήστη ("ό,τι φίλτρα
//    χρειάζεται ένα σύγχρονο eshop"): εύρος τιμής, "μόνο διαθέσιμα",
//    μέγεθος (μόνο όταν η κατηγορία περιέχει ρούχα — showSizeFilter prop,
//    δεν επινοούμε μεγέθη σε κατηγορίες χωρίς ρούχα).
//  - "Προσχέδιο" (draft) state: οι επιλογές ΔΕΝ εφαρμόζονται ζωντανά — μόνο
//    όταν πατηθεί "Εφαρμογή" (ρητό αίτημα χρήστη). Το draft συγχρονίζεται
//    ξανά με τα ήδη-εφαρμοσμένα φίλτρα ΚΑΘΕ ΦΟΡΑ ΠΟΥ ΑΝΟΙΓΕΙ το panel — όχι
//    με useEffect (eslint react-hooks/set-state-in-effect: setState μέσα σε
//    effect προκαλεί ένα επιπλέον cascading render), αλλά στο ΙΔΙΟ το
//    onOpenChange handler, τη στιγμή που ανοίγει, ώστε ένα
//    "άνοιξα/άλλαξα κάτι/έκλεισα χωρίς Εφαρμογή" να ΜΗΝ αφήνει μισές
//    αλλαγές στην επόμενη φορά που ανοίγει.
export default function ProductFilters({ filters, showSizeFilter, onApply }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(filters)

  function handleOpenChange(next) {
    if (next) setDraft(filters)
    setOpen(next)
  }

  const hasActiveFilters =
    filters.priceMin !== "" ||
    filters.priceMax !== "" ||
    filters.onlyAvailable ||
    filters.sizes.length > 0

  function handleApply() {
    onApply(draft)
    setOpen(false)
  }

  function handleReset() {
    setDraft(DEFAULT_FILTERS)
  }

  function toggleSize(size) {
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(size) ? d.sizes.filter((s) => s !== size) : [...d.sizes, size],
    }))
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Φίλτρα"
          className="relative rounded-full bg-white/25 p-2 shadow-lg ring-1 ring-white/40 backdrop-blur-2xl transition-colors hover:bg-white/35"
        >
          <AdjustmentsHorizontalIcon className="size-5 text-gray-700" />
          {/* Πράσινη κουκκίδα ΜΟΝΟ όταν υπάρχουν πραγματικά ενεργά φίλτρα
              (όχι απλά αλλαγμένη ταξινόμηση — αυτή δεν μειώνει τα
              αποτελέσματα, δεν μετράει ως "φίλτρο" εδώ). */}
          {hasActiveFilters && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-green-600 ring-2 ring-white" />
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="top" className="max-h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Φίλτρα</SheetTitle>
          <SheetDescription>Επίλεξε τα φίλτρα σου και πάτησε «Εφαρμογή».</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Ταξινόμηση</p>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, sortBy: option.value }))}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-left text-sm font-medium",
                    draft.sortBy === option.value
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Τιμή</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Από €"
                value={draft.priceMin}
                onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value }))}
              />
              <span className="shrink-0 text-gray-400">—</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Έως €"
                value={draft.priceMax}
                onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={draft.onlyAvailable}
              onChange={(e) => setDraft((d) => ({ ...d, onlyAvailable: e.target.checked }))}
              className="size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            Μόνο διαθέσιμα προϊόντα
          </label>

          {showSizeFilter && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Μέγεθος</p>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md border text-sm font-medium",
                      draft.sizes.includes(size)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleReset}>
            Καθαρισμός
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Εφαρμογή
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
