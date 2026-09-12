import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

// Μικρό, γενικό "loading" Dialog — δείχνεται ενώ ένα route ψάχνει το
// event/προϊόν του μέσα στα ήδη cached δεδομένα (π.χ. πρώτο hard-refresh
// πάνω σε κοινοποιημένο link). 12/9, ρητό αίτημα χρήστη για loading
// skeleton σε όλο το project — πριν, αυτές οι στιγμές έδειχναν απλά λευκή
// οθόνη (return null).
export default function LoadingDialog({ onOpenChange, className = "sm:max-w-sm" }) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <Skeleton className="h-5 w-2/3" />
        </DialogHeader>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
