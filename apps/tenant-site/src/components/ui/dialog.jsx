"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

// Mobile-keyboard fix (12/9, ρητό αίτημα χρήστη — bug που βρέθηκε σε live
// mobile test): πριν, το modal δεν είχε κανένα όριο ύψους, οπότε σε κινητό
// όταν ανοίγει το πληκτρολόγιο και καλύπτει τη μισή οθόνη, ο χρήστης δεν
// μπορούσε να κάνει scroll μέσα στο modal για να φτάσει τα υπόλοιπα πεδία —
// ήταν παγιδευμένος. Δοκιμάστηκαν με τη σειρά: (1) max-height + overflow
// scroll μόνο, (2) top-anchoring σε mobile αντί για centered, (3) το
// παρακάτω hook — καθαρό CSS δεν αρκεί γιατί το iOS Safari δεν συρρικνώνει
// καθόλου το static viewport όταν ανοίγει το πληκτρολόγιο (το Chrome
// Android το κάνει, αλλά ασυνεπώς), οπότε χρειαζόμαστε το πραγματικό,
// live μέγεθος από το visualViewport API. Ισχύει για ΚΑΘΕ Dialog στο
// project, όχι μόνο το event wizard, γιατί είναι το κοινό ui/dialog.jsx.
function useVisualViewportMaxHeight() {
  const [maxHeight, setMaxHeight] = React.useState(null)
  React.useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    function update() {
      const keyboardOpen = viewport.height < window.innerHeight - 40
      setMaxHeight(keyboardOpen ? viewport.height - 32 : null)
    }
    update()
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    return () => {
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
    }
  }, [])
  return maxHeight
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  style,
  ...props
}) {
  const keyboardMaxHeight = useVisualViewportMaxHeight()
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-4 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 gap-4 overflow-y-auto overscroll-contain rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:top-1/2 sm:max-h-[85vh] sm:-translate-y-1/2 sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        style={keyboardMaxHeight != null ? { ...style, maxHeight: `${keyboardMaxHeight}px` } : style}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
