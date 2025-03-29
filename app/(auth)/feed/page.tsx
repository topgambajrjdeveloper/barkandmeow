/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prismadb"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { getFeedPosts } from "@/lib/posts"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"
import CreatePost from "@/components/(auth)/components/post/create-post"
import PostCard from "@/components/(auth)/components/post/post-card"
import { EventsCard } from "@/components/(auth)/components/events/events-card"


async function getPopularPets() {
  const pets = await prisma.pet.findMany({
    include: {
      _count: {
        select: { followers: true },
      },
    },
  })

  // Sort pets by follower count and take the top 5
  const popularPets = pets.sort((a, b) => b._count.followers - a._count.followers).slice(0, 5)

  return popularPets
}

async function getUserWithPets(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profileImage: true,
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

export default async function Feed() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userId = session?.user?.id

  // Add a check to ensure userId is defined
  if (!userId) {
    redirect("/login") // Redirect if userId is undefined
  }

  const popularPets = await getPopularPets()
  const { posts } = await getFeedPosts(10)
  // Now TypeScript knows userId is definitely a string
  const user = await getUserWithPets(userId)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-screen-sm mx-auto md:max-w-none md:mx-0 pb-20 md:pb-0">
      <div className="md:col-span-2 space-y-6">
        {/* Ocultar CreatePost en dispositivos móviles */}
        <div className="hidden md:block">
          <CreatePost user={user!} userPets={user?.pets || []} />
        </div>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={userId} />
        ))}
      </div>
      <div className="hidden md:block space-y-6">
        <PopularPetsCard pets={popularPets} />
        <EventsCard />
        <PagesCard />
      </div>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

function PopularPetsCard({ pets }: { pets: any[] }) {
  return (
    <Card className="border-background/1 border-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Mascotas populares</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {pets.map((pet) => (
          <PetSuggestion
            key={pet.id}
            name={pet.name}
            type={pet.type}
            image={pet.image || "/placeholder.svg?height=40&width=40"}
            followers={pet._count.followers}
          />
        ))}
      </CardContent>
      <CardFooter>
        <Link href="/explore" className="text-sm text-primary">
          Ver más mascotas
        </Link>
      </CardFooter>
    </Card>
  )
}

function PagesCard() {
  return (
    <Card className="border-background/1 border-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Páginas Importantes</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Link href={"/contact"} className="text-sm text-primary">
            <h4 className="font-medium">Contactar</h4>
          </Link>
        </div>
        <div>
          <Link href={"/about"} className="text-sm text-primary">
            <h4 className="font-medium">Sobre Nosotros</h4>
          </Link>
        </div>
        <div>
          <Link href={"/privacy"} className="text-sm text-primary">
            <h4 className="font-medium">Política de Privacidad</h4>
          </Link>
        </div>
        <div>
          <Link href={"/cookies"} className="text-sm text-primary">
            <h4 className="font-medium">Cookies</h4>
          </Link>
        </div>
        <div>
          <Link href={"/terms"} className="text-sm text-primary">
            <h4 className="font-medium">Términos y Condiciones</h4>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function PetSuggestion({
  name,
  type,
  image,
  followers,
}: {
  name: string
  type: string
  image: string
  followers: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Seguir
      </Button>
    </div>
  )
}

