import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import CreatePost from "@/components/(auth)/components/post/create-post"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"

const prisma = new PrismaClient()

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

export default async function CreatePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userId = session?.user?.id
  const user = await getUserWithPets(userId)

  return (
    <div className="max-w-screen-sm mx-auto px-4 pb-20 md:pb-0">
     <CreatePost user={user!} userPets={user?.pets || []} />

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

