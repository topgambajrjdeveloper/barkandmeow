"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Profile {
  id: string
  username: string
  profileImage: string | null
  petName: string
  petType: string
  isFollowing: boolean
}



export default function DiscoverPage() {
  const { user } = useUser()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesResponse] = await Promise.all([
          fetch("/api/discover/profiles"),
        ])

        if (profilesResponse.ok ) {
          const profilesData = await profilesResponse.json()
          setProfiles(profilesData)
        } else {
          toast.error("Error al cargar perfiles y mascotas")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar perfiles y mascotas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFollow = async (profileId: string) => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: profileId, type: "user" }),
      })

      if (response.ok) {
        setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === profileId ? { ...profile, isFollowing: !profile.isFollowing } : profile,
          ),
        )
        toast.success("Acción de seguir realizada con éxito")
      } else {
        toast.error("Error al realizar la acción de seguir")
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error)
      toast.error("Error al realizar la acción de seguir")
    }
  }

  if (isLoading) {
    return <div>Cargando perfiles y mascotas...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Descubre</h1>
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList>
          <TabsTrigger value="profiles">Perfiles</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={profile.profileImage || "/placeholder.svg?height=40&width=40"}
                        alt={profile.username}
                      />
                      <AvatarFallback>{profile.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{profile.username}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {profile.petName} • {profile.petType}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Link href={`/profile/${profile.id}`}>
                    <Button variant="outline">Ver perfil</Button>
                  </Link>
                  {user && user.id !== profile.id && (
                    <Button onClick={() => handleFollow(profile.id)}>
                      {profile.isFollowing ? "Dejar de seguir" : "Seguir"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>        
      </Tabs>
    </div>
  )
}

