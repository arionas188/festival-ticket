import { useState } from "react"
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

const SORT_OPTIONS = [
  { value: "newest", label: "Νεότερα πρώτα" },
  { value: "price_asc", label: "Τιμή: Χαμηλή → Υψηλή" },
  { value: "price_desc", label: "Τιμή: Υψηλή → Χαμηλή" },
]

export default function ProductFilters({ sortBy, onSortChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between border-t border-gray-200 py-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <AdjustmentsHorizontalIcon className="size-5" />
            Ταξινόμηση
          </button>
        </SheetTrigger>

        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Ταξινόμηση</SheetTitle>
            <SheetDescription>Επίλεξε πώς θέλεις να ταξινομηθούν τα προϊόντα.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-1 px-4">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSortChange(option.value)
                  setOpen(false)
                }}
                className={`rounded-md px-3 py-2.5 text-left text-sm font-medium ${
                  sortBy === option.value
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Κλείσιμο</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}