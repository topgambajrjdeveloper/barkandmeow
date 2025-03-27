import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Pet {
  id: string
  name: string
  type: string
  image: string | null
}

interface User {
  id: string
  username: string
  profileImage: string | null
  bio?: string | null
  name?: string | null
}

interface UserProfileProps {
  user: User
  isCurrentUser: boolean
  pets: Pet[]
}

export default function UserProfile({ user, isCurrentUser, pets }: UserProfileProps) {
  return (
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
          <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
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

      {pets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Mascotas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pets.map((pet) => (
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
  )
}

