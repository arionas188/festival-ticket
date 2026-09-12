"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// Δικό μας Combobox πάνω σε Popover (Radix) + Command (cmdk) — 12/9,
// αντικατέστησε το Base UI-based "combobox" block του shadcn CLI. Το Radix
// δεν έχει ποτέ είχε δικό του native Combobox primitive, οπότε το επίσημο
// shadcn block (ό,τι style/project και να έχεις) πέφτει πάντα σε Base UI.
// Για να μείνουμε αποκλειστικά σε Radix σε όλο το project, φτιάξαμε το δικό
// μας wrapper με το κλασικό Popover+Command pattern — ίδιο αποτέλεσμα για
// τον χρήστη (searchable dropdown), μηδέν δεύτερη primitives βιβλιοθήκη.
//
// Απλό, single-select API: options=[{value,label}], value, onValueChange.
function Combobox({
  options = [],
  value,
  onValueChange,
  placeholder = "Επιλογή...",
  searchPlaceholder = "Αναζήτηση...",
  emptyText = "Δεν βρέθηκε αποτέλεσμα.",
  disabled = false,
  clearable = false,
  className,
  triggerClassName,
}) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            triggerClassName
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-(--radix-popover-trigger-width) p-0", className)}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={option.value === value}
                  disabled={option.disabled}
                  onSelect={() => {
                    const isSame = option.value === value
                    onValueChange?.(clearable && isSame ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
