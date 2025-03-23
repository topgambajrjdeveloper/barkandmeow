"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, UserCheck, UserX, PawPrint, FileText, Heart } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  email: string
  profileImage: string | null
  role: string
  isEmailConfirmed: boolean
  createdAt: string
  updatedAt: string
  _count: {
    pets: number
    posts: number
    followers: number
    following: number
  }
  pets?: any[]
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log(`Fetching user with ID: ${params.id}`)
        const response = await fetch(`/api/admin/users/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `Error: ${response.status}`
          console.error(`API error: ${errorMessage}`)
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        const userData = await response.json()
        console.log("User data received:", userData)
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user:", error)
        toast.error("Error al cargar los datos del usuario")
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const handleStatusChange = async (newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus ? "active" : "suspended" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      // Actualizar el usuario localmente
      if (user) {
        setUser({
          ...user,
          isEmailConfirmed: newStatus,
        })
      }

      toast.success(`Usuario ${newStatus ? "activado" : "suspendido"} correctamente`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Error al actualizar el estado del usuario")
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Error: ${response.status}`
        console.error("Error details:", errorData)
        throw new Error(errorMessage)
      }

      toast.success("Usuario eliminado correctamente")
      router.push("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(`Error al eliminar el usuario: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos del usuario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar el usuario</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/users")}>Volver a la lista de usuarios</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Usuario no encontrado</CardTitle>
            <CardDescription>El usuario solicitado no existe o ha sido eliminado</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/users")}>Volver a la lista de usuarios</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Usuario</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/users/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {user.isEmailConfirmed ? (
            <Button variant="outline" onClick={() => handleStatusChange(false)}>
              <UserX className="mr-2 h-4 w-4" />
              Suspender
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleStatusChange(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activar
            </Button>
          )}
          <Button variant="destructive" onClick={handleDeleteUser}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>Datos básicos del usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImage || undefined} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.username}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                  <Badge variant={user.isEmailConfirmed ? "success" : "secondary"}>
                    {user.isEmailConfirmed ? "Activo" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de registro:</span>
                <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Última actualización:</span>
                <span className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Actividad del usuario en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                <PawPrint className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{user._count?.pets || 0}</span>
                <span className="text-sm text-muted-foreground">Mascotas</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{user._count?.posts || 0}</span>
                <span className="text-sm text-muted-foreground">Publicaciones</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                <Heart className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{user._count?.followers || 0}</span>
                <span className="text-sm text-muted-foreground">Seguidores</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                <Heart className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{user._count?.following || 0}</span>
                <span className="text-sm text-muted-foreground">Siguiendo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pets">
        <TabsList>
          <TabsTrigger value="pets">Mascotas</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
        </TabsList>
        <TabsContent value="pets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mascotas del Usuario</CardTitle>
              <CardDescription>Mascotas registradas por este usuario</CardDescription>
            </CardHeader>
            <CardContent>
              {user.pets && user.pets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user.pets.map((pet) => (
                    <Card key={pet.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={pet.image || undefined} alt={pet.name} />
                            <AvatarFallback>{pet.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{pet.name}</CardTitle>
                            <CardDescription>
                              {pet.type} - {pet.breed || "Sin raza"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => router.push(`/admin/pets/${pet.id}`)}
                        >
                          Ver detalles
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Este usuario no tiene mascotas registradas</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Publicaciones del Usuario</CardTitle>
              <CardDescription>Publicaciones realizadas por este usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Funcionalidad en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas por este usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Funcionalidad en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

