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

async function getPetById(id: string) {
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
  })

  return pet
}

async function getPetPosts(petId: string) {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { petId },
        {
          taggedPets: {
            some: {
              petId,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return posts
}

export default async function PetProfilePage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = params
  const pet = await getPetById(id)

  if (!pet) {
    notFound()
  }

  const posts = await getPetPosts(pet.id)
  const isOwner = pet.userId === session.user.id

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
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
            <Image
              src={pet.image || "/placeholder.svg?height=128&width=128"}
              alt={pet.name}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold">{pet.name}</h1>
          <p className="text-gray-500 capitalize">{pet.type}</p>

          {pet.breed && <p className="mt-1 text-sm text-gray-600">Raza: {pet.breed}</p>}

          {pet.age && (
            <p className="mt-1 text-sm text-gray-600">
              Edad: {pet.age} {pet.age === 1 ? "año" : "años"}
            </p>
          )}

          {pet?.bio && <p className="mt-4 text-center">{pet?.bio}</p>}

          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm">Dueño:</p>
            <Link href={`/user/${pet.user.username}`} className="flex items-center gap-2 hover:underline">
              <div className="relative h-6 w-6 rounded-full overflow-hidden">
                <Image
                  src={pet.user.profileImage || "/placeholder.svg?height=24&width=24"}
                  alt={pet.user.username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-medium">@{pet.user.username}</span>
            </Link>
          </div>

          {isOwner && (
            <div className="mt-6">
              <Button asChild>
                <Link href={`/pet/${pet.id}/edit`}>Editar mascota</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>

      <h2 className="text-xl font-semibold mt-8 mb-4">Publicaciones</h2>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay publicaciones de esta mascota</p>
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

