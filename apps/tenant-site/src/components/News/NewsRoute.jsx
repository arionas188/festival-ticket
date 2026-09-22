import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { PlusIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import CardGridSkeleton from "@/components/ui/card-grid-skeleton"
import PostCard from "./PostCard"
import NewPostDialog from "./NewPostDialog"
import { useTenantPosts } from "../../queries/useTenantPosts"

// "New" tab (20/9, ρητό αίτημα χρήστη) -- instagram-stories στυλ feed,
// δίπλα σε Πληροφορίες/Εκδηλώσεις/Merch Store (βλ. Header.jsx/main.jsx).
// Ίδιο layout μοτίβο με EventsRoute.jsx (γκρι πλαίσιο, admin action πάνω
// δεξιά, πάντα ορατό όταν context.isAdmin -- ΚΑΙ στην κενή λίστα).
export default function NewsRoute() {
  const context = useOutletContext()
  const { data: posts, isLoading, error } = useTenantPosts(context.tenantId)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
      {context.isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
            Νέα ανάρτηση
          </Button>
          <NewPostDialog tenantId={context.tenantId} open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
      )}

      {isLoading && (
        <CardGridSkeleton count={4} gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2" />
      )}
      {error && <p className="p-8 text-sm text-red-600">Σφάλμα φόρτωσης.</p>}
      {!isLoading && !error && (!posts || posts.length === 0) && (
        <p className="p-8 text-sm text-gray-500">Δεν υπάρχουν αναρτήσεις αυτή τη στιγμή.</p>
      )}
      {!isLoading && !error && posts && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              fanId={context.fanId}
              isLoggedIn={context.isLoggedIn}
              onRequireAuth={context.onRequireAuth}
            />
          ))}
        </div>
      )}
    </div>
  )
}
