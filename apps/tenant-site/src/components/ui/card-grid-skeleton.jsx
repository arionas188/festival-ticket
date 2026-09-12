import { Skeleton } from "@/components/ui/skeleton"

// Γενικό grid από skeleton "κάρτες" (εικόνα + 2 γραμμές κειμένου) — για
// λίστες με εικόνες σε grid (events, προϊόντα). 12/9, ρητό αίτημα χρήστη
// για loading skeleton σε όλο το project, μέχρι να φορτώσουν τα πραγματικά
// components. Δεν είναι shadcn block — δικό μας, ασφαλές από CLI overwrites.
export default function CardGridSkeleton({
  count = 6,
  gridClassName = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
}) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      ))}
    </div>
  )
}
