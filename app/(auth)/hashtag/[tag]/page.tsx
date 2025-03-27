import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPostsByHashtag, hasUserLikedPost, validateHashtag } from "@/lib/posts"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"
import PostCard from "@/components/(auth)/components/post/post-card"

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Esperar a que se resuelva la promesa de params antes de acceder a sus propiedades
  const { tag } = await params

  // Verificar si el tag es válido (solo alfanuméricos)
  if (!tag || typeof tag !== "string") {
    redirect("/hashtag")
  }

  // Decodificar la URL
  const decodedTag = decodeURIComponent(tag)

  // Verificar si contiene caracteres especiales o múltiples hashtags
  if (!validateHashtag(decodedTag)) {
    redirect("/hashtag")
  }

  // Buscar posts con el hashtag limpio
  const { posts } = await getPostsByHashtag(decodedTag, 20)

  // Añadir información de si el usuario ha dado like a cada post
  const postsWithLikes = await Promise.all(
    posts.map(async (post) => {
      const hasLiked = await hasUserLikedPost(post.id, session.user.id)
      return {
        ...post,
        hasLiked,
      }
    }),
  )

  return (
    <div className="max-w-screen-sm mx-auto px-4 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold my-4">#{decodedTag}</h1>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay publicaciones con este hashtag</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postsWithLikes.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={session.user.id} showActions={true} />
          ))}
        </div>
      )}

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

