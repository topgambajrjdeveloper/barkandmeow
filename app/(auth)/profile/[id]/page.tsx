"use client"

import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { LogOut, Edit } from "lucide-react"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import { formatNumber } from "@/lib/followerNumber"
import { useParams, useRouter } from "next/navigation"
import type { Follower, Pet, PostCardProps, UserProfile } from "@/types"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserBadges } from "@/components/(auth)/components/profile/user-badges"
import { PremiumBadge } from "@/components/(auth)/components/profile/premium-badge"
import PostCard from "@/components/(auth)/components/post/post-card" // Importar tu componente PostCard existente
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const { user, loading } = useUser()
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [posts, setPosts] = useState<PostCardProps[]>([]) // Estado para almacenar las publicaciones
  const [isLoadingPosts, setIsLoadingPosts] = useState(false) // Estado para controlar la carga de publicaciones

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = params.id || "me"
        console.log("Intentando cargar perfil para:", userId)

        // Intentar primero con la ruta actualizada
        let response = await fetch(`/api/profile/${userId}`)

        // Si la ruta actualizada falla, intentar con la ruta original
        if (!response.ok) {
          console.log("La ruta actualizada falló, intentando con la ruta original")
          response = await fetch(`/api/user/profile/${userId}`)
        }

        if (response.ok) {
          const data = await response.json()
          console.log("Profile data:", data)
          setProfile(data)
          setIsFollowing(data.isFollowing)
        } else {
          const errorText = await response.text()
          console.error("Failed to fetch profile. Status:", response.status, "Error:", errorText)
          toast.error("Error al cargar el perfil")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Error al cargar el perfil")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchProfile()
    }
  }, [params.id, loading])

  // Función para cargar las publicaciones del usuario
  const fetchUserPosts = async () => {
    if (!profile) return

    setIsLoadingPosts(true)
    try {
      const response = await fetch(`/api/posts/user/${profile.id}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Posts data:", data)
        setPosts(data)
      } else {
        const errorText = await response.text()
        console.error("Error fetching posts:", errorText)
        toast.error("Error al cargar las publicaciones")
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Error al cargar las publicaciones")
    } finally {
      setIsLoadingPosts(false)
    }
  }

  // Cargar las publicaciones cuando cambie la pestaña a "posts"
  const handleTabChange = (value: string) => {
    if (value === "posts" && posts.length === 0 && !isLoadingPosts) {
      fetchUserPosts()
    }
  }

  const handleFollow = async () => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: profile?.id, type: "user" }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
                isFollowing: !isFollowing,
              }
            : null,
        )
        toast.success(isFollowing ? "Usuario dejado de seguir" : "Usuario seguido")
      } else {
        toast.error("Error al realizar la acción de seguir")
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error)
      toast.error("Error al realizar la acción de seguir")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast.success("Sesión cerrada correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  // Función para manejar la eliminación de una publicación
  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  if (loading || isLoading) {
    return <div>Cargando perfil...</div>
  }

  if (!profile) {
    return <div>No se pudo cargar el perfil.</div>
  }

  const isOwnProfile = user?.id === profile.id

  // Verificar si hay mascotas disponibles (ya sea en el array pets o como campos directos)
  const hasPets = (profile.pets && profile.pets.length > 0) || profile.petName

  // Si hay una mascota directa en el perfil pero no en el array, crearla como objeto Pet
  const petsToDisplay = [...(profile.pets || [])]

  // Añadir la mascota directa al array si existe y no está ya incluida
  if (profile.petName && !petsToDisplay.some((p) => p.name === profile.petName)) {
    petsToDisplay.push({
      id: "direct-pet", // ID temporal
      name: profile.petName,
      type: profile.petType || "No especificado",
      breed: "No especificado",
      image: profile.petImage || null,
      age: null,
      userId: profile.id,
      description: null,
      createdAt: "",
      user: {
        id: "",
        username: "",
        email: "",
        profileImage: null,
      },
      _count: {
        followers: 0,
      },
    })
  }

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <section className="flex-1">
        <div className="container py-8">
          {/* Encabezado del perfil de usuario */}
          <div className="mb-8 flex flex-col items-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.profileImage || "/placeholder.svg?height=128&width=128"} alt="Foto de perfil" />
              <AvatarFallback>{profile.username[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {/* Mostrar insignia premium si el usuario es premium */}
                {profile.isPremium && <PremiumBadge />}
              </div>

              {/* Mostrar todas las insignias del usuario */}
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex justify-center sm:justify-start">
                  <UserBadges badges={profile.badges} />
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                <div>
                  <p className="text-lg font-semibold">{formatNumber(profile.postsCount)}</p>
                  <p className="text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(profile.followersCount)}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatNumber(profile.followingCount)}</p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {profile?.bio} {profile?.petName && `- ${profile.petName}`}
              </p>
              <div className="flex justify-center gap-2 sm:justify-start">
                {isOwnProfile ? (
                  <>
                    <Link href={`/profile/edit`}>
                      <Button>Editar perfil</Button>
                    </Link>
                    <Link href="/pets/add">
                      <Button variant="outline">Añadir otra mascota</Button>
                    </Link>
                    {/* Botón de cerrar sesión solo visible en móvil y cuando es el propio perfil */}
                    {isMobile && (
                      <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Salir</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button onClick={handleFollow}>{isFollowing ? "Dejar de seguir" : "Seguir"}</Button>
                    {profile.isFollowedBy && (
                      <span className="text-sm text-muted-foreground items-center">Te sigue</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <Tabs defaultValue="pets" className="w-full" onValueChange={handleTabChange}>
            <div className="overflow-x-auto pb-3 mb-3 scrollbar-hide">
              <TabsList className="lg:w-full md:w-max inline-flex">
                <TabsTrigger value="pets">Mis mascotas</TabsTrigger>
                <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                <TabsTrigger value="followers">Seguidores</TabsTrigger>
                <TabsTrigger value="following">Siguiendo</TabsTrigger>
              </TabsList>
            </div>

            {/* Pets Tab */}
            <TabsContent value="pets" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {petsToDisplay.length > 0 ? (
                  petsToDisplay.map((pet) => <PetCard key={pet.id} pet={pet} isOwnProfile={isOwnProfile} />)
                ) : (
                  <p>No hay mascotas para mostrar.</p>
                )}
                {isOwnProfile && (
                  <Card className="flex items-center justify-center p-6">
                    <Link href="/pets/add">
                      <Button>Añadir otra mascota</Button>
                    </Link>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {isLoadingPosts ? (
                  <div className="col-span-full text-center py-8">
                    <p>Cargando publicaciones...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      showActions={true}
                      onDelete={() => handlePostDelete(post.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No hay publicaciones para mostrar.</p>
                    {isOwnProfile && (
                      <Button className="mt-4" asChild>
                        <Link href="/create">Crear publicación</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Followers Tab */}
            <TabsContent value="followers" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.followers && profile.followers.length > 0 ? (
                  profile.followers.map((follower) => <FollowerCard key={follower.id} follower={follower} />)
                ) : (
                  <p>No hay seguidores para mostrar.</p>
                )}
              </div>
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.following && profile.following.length > 0 ? (
                  profile.following.map((following) => <FollowerCard key={following.id} follower={following} />)
                ) : (
                  <p>No estás siguiendo a nadie aún.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

function PetCard({ pet, isOwnProfile }: { pet: Pet; isOwnProfile: boolean }) {
  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            priority
            src={pet.image || "/placeholder.svg?height=300&width=300"}
            alt={pet.name}
            fill
            className="rounded-t-lg object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle>{pet.name}</CardTitle>
        <CardDescription>
          {pet.type} {pet.breed && `• ${pet.breed}`} {pet.age && `• ${pet.age} años`}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {pet.id !== "direct-pet" ? (
          <Link href={`/pets/${pet.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Ver perfil
            </Button>
          </Link>
        ) : isOwnProfile ? (
          <Link href="/pets/complete-profile" className="w-full">
            <Button variant="default" className="w-full flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Completar perfil de mascota
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Mascota básica
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function FollowerCard({ follower }: { follower: Follower }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={follower.profileImage || "/placeholder.svg?height=48&width=48"} alt={follower.username} />
            <AvatarFallback>{follower.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{follower.username}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Link href={`/profile/${follower.id}`}>
          <Button variant="outline" className="w-full">
            Ver perfil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

