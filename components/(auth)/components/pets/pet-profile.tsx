import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface PetOwner {
  id: string
  username: string
  profileImage: string | null
}

interface Pet {
  id: string
  name: string
  type: string
  breed?: string | null
  age?: number | null
  bio?: string | null
  image: string | null
}

interface PetProfileProps {
  pet: Pet
  isOwner: boolean
  owner: PetOwner
}

export default function PetProfile({ pet, isOwner, owner }: PetProfileProps) {
  return (
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

        {pet.bio && <p className="mt-4 text-center">{pet.bio}</p>}

        <div className="mt-4 flex items-center gap-2">
          <p className="text-sm">Dueño:</p>
          <Link href={`/user/${owner.username}`} className="flex items-center gap-2 hover:underline">
            <div className="relative h-6 w-6 rounded-full overflow-hidden">
              <Image
                src={owner.profileImage || "/placeholder.svg?height=24&width=24"}
                alt={owner.username}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">@{owner.username}</span>
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
  )
}

