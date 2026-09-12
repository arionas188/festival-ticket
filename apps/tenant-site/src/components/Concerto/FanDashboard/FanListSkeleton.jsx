import { Skeleton } from "@/components/ui/skeleton"

// Κοινό skeleton-placeholder για τις απλές λίστες του Fan Dashboard
// (αγαπημένα merch/events, ακολουθούμενα tenants) — ίδιο σχήμα με τις
// πραγματικές γραμμές (<li className="flex items-center gap-4 py-4">).
// 12/9, ρητό αίτημα χρήστη για loading skeleton σε όλο το project.
export default function FanListSkeleton({ rows = 3, rounded = "rounded-md" }) {
  return (
    <ul className="mt-6 divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 py-4">
          <Skeleton className={`size-14 shrink-0 ${rounded}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </li>
      ))}
    </ul>
  )
}
