import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prismadb"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"
import PostCard from "@/components/(auth)/components/post/post-card"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { hasUserLikedPost } from "@/lib/posts"

async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      pets: {
        select: {
          id: true,
          name: true,
          type: true,
          image: true,
        },
      },
    },
  })

  return user
}

async function getUserPostsByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  if (!user) return { posts: [], nextCursor: null }

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
      pet: {
        select: {
          id: true,
          name: true,
          type: true,
          image: true,
        },
      },
      hashtags: true,
      taggedUsers: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      taggedPets: {
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  return { posts, nextCursor: null }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const user = await getUserByUsername(decodedUsername)

  if (!user) {
    notFound()
  }

  const { posts } = await getUserPostsByUsername(decodedUsername)
  const isCurrentUser = user.id === session.user.id

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
      <Card className="p-6 mt-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden">
            <Image
              src={user.profileImage || "/placeholder.svg?height=80&width=80"}
              alt={user.username}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.username || user.username}</h1>
            <p className="text-gray-500">@{user.username}</p>
            {user.bio && <p className="mt-2">{user.bio}</p>}
          </div>
          {isCurrentUser ? (
            <Button asChild>
              <Link href="/profile/edit">Editar perfil</Link>
            </Button>
          ) : (
            <Button>Seguir</Button>
          )}
        </div>

        {user.pets.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Mascotas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.pets.map((pet) => (
                <Link href={`/pet/${pet.id}`} key={pet.id}>
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="relative h-24 w-full rounded-md overflow-hidden mb-2">
                      <Image
                        src={pet.image || "/placeholder.svg?height=96&width=96"}
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-center">{pet.name}</p>
                    <p className="text-xs text-gray-500 text-center capitalize">{pet.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      <h2 className="text-xl font-semibold mt-8 mb-4">Publicaciones</h2>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay publicaciones</p>
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

