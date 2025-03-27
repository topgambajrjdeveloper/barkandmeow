import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPostById, hasUserLikedPost } from "@/lib/posts"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"
import PostCard from "@/components/(auth)/components/post/post-card"
import { notFound } from "next/navigation"
import CommentForm from "@/components/(auth)/components/post/comment-form"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = params
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  const hasLiked = await hasUserLikedPost(post.id, session.user.id)
  const postWithLike = {
    ...post,
    hasLiked,
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 pb-20 md:pb-0">
      <PostCard post={postWithLike} currentUserId={session.user.id} showActions={true} />

      <div className="mt-6">
        <CommentForm postId={post.id} />

        <h2 className="text-xl font-semibold mt-6 mb-4">Comentarios ({post.comments.length})</h2>

        {post.comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay comentarios todavía</p>
          </div>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Link href={`/user/${comment.user.username}`}>
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={comment.user.profileImage || "/placeholder.svg?height=32&width=32"}
                      alt={comment.user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/user/${comment.user.username}`} className="font-medium hover:underline">
                      @{comment.user.username}
                    </Link>

                    <span className="text-gray-500 text-xs ml-auto">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>

                  <p className="mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

