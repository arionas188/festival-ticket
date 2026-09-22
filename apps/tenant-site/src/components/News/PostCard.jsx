import { HeartIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { Card, CardContent } from "@/components/ui/card"
import { useToggleTenantPostLike } from "../../queries/useToggleTenantPostLike"

function formatRelativeTime(dateString) {
  const diffMinutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  if (diffMinutes < 1) return "μόλις τώρα"
  if (diffMinutes < 60) return `πριν ${diffMinutes} λεπτ${diffMinutes === 1 ? "ό" : "ά"}`
  const diffHours = Math.floor(diffMinutes / 60)
  return `πριν ${diffHours} ώρ${diffHours === 1 ? "α" : "ες"}`
}

// Μία ανάρτηση News (20/9, ρητό αίτημα χρήστη) -- φωτογραφία Ή video
// (ρητή απόφαση χρήστη, ποτέ και τα δύο μαζί), like-only interaction για
// fans (κανένα σχόλιο/απάντηση). tenant_post_likes(fan_id) έρχεται ήδη
// embedded από το useTenantPosts.js query -- like_count/isLiked
// υπολογίζονται εδώ, καμία ξεχωριστή κλήση.
export default function PostCard({ post, fanId, isLoggedIn, onRequireAuth }) {
  const likes = post.tenant_post_likes || []
  const isLiked = isLoggedIn && likes.some((like) => like.fan_id === fanId)
  const toggleLike = useToggleTenantPostLike(fanId, post.tenant_id)

  function handleToggleLike() {
    if (!isLoggedIn) {
      onRequireAuth()
      return
    }
    toggleLike.mutate({ postId: post.id, isLiked })
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-0">
        <div className="relative aspect-4/5 w-full bg-black">
          {post.media_type === "photo" ? (
            <img alt="" src={post.media_url} className="size-full object-cover" />
          ) : (
            <video src={post.media_url} controls playsInline className="size-full object-cover" />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            {post.caption && <p className="truncate text-sm text-gray-900">{post.caption}</p>}
            <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
          </div>

          <button
            type="button"
            onClick={handleToggleLike}
            disabled={toggleLike.isPending}
            aria-label={isLiked ? "Αφαίρεση like" : "Like"}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5"
          >
            {isLiked ? (
              <HeartIconSolid className="size-5 text-red-500" />
            ) : (
              <HeartIcon className="size-5 text-gray-700" />
            )}
            <span className="text-sm text-gray-700">{likes.length}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
