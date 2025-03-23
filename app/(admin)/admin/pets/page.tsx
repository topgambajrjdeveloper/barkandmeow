"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, PlusCircle, Filter } from "lucide-react"
import { toast } from "sonner"

interface Pet {
  id: string
  name: string
  type: string
  breed: string | null
  age: number | null
  image: string | null
  status: "active" | "hidden" | "reported"
  ownerId: string
  ownerName: string
  createdAt: string
  followersCount: number
}

export default function PetsPage() {
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a tu API
        // const response = await fetch(`/api/admin/pets?page=${currentPage}&search=${searchQuery}`);
        // const data = await response.json();

        // Datos de ejemplo
        const mockPets: Pet[] = [
          {
            id: "1",
            name: "Luna",
            type: "Perro",
            breed: "Golden Retriever",
            age: 3,
            image: null,
            status: "active",
            ownerId: "1",
            ownerName: "maria_garcia",
            createdAt: "2023-05-20T10:30:00Z",
            followersCount: 45,
          },
          {
            id: "2",
            name: "Milo",
            type: "Gato",
            breed: "Siamés",
            age: 2,
            image: null,
            status: "active",
            ownerId: "1",
            ownerName: "maria_garcia",
            createdAt: "2023-06-15T14:45:00Z",
            followersCount: 32,
          },
          {
            id: "3",
            name: "Rocky",
            type: "Perro",
            breed: "Bulldog",
            age: 4,
            image: null,
            status: "active",
            ownerId: "2",
            ownerName: "carlos_lopez",
            createdAt: "2023-07-10T09:15:00Z",
            followersCount: 28,
          },
          {
            id: "4",
            name: "Bella",
            type: "Gato",
            breed: "Persa",
            age: 1,
            image: null,
            status: "hidden",
            ownerId: "4",
            ownerName: "laura_martinez",
            createdAt: "2023-08-05T16:20:00Z",
            followersCount: 15,
          },
          {
            id: "5",
            name: "Max",
            type: "Perro",
            breed: "Pastor Alemán",
            age: 5,
            image: null,
            status: "reported",
            ownerId: "4",
            ownerName: "laura_martinez",
            createdAt: "2023-09-01T11:10:00Z",
            followersCount: 20,
          },
        ]

        setPets(mockPets)
        setTotalPages(3) // Simulando 3 páginas en total
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching pets:", error)
        toast.error("Error al cargar las mascotas")
        setIsLoading(false)
      }
    }

    fetchPets()
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Resetear a la primera página al buscar
  }

  const handleStatusChange = async (petId: string, newStatus: "active" | "hidden" | "reported") => {
    try {
      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pets/${petId}/status`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ status: newStatus })
      // });

      // Actualizar estado local
      setPets(pets.map((pet) => (pet.id === petId ? { ...pet, status: newStatus } : pet)))

      toast.success("Estado de la mascota actualizado")
    } catch (error) {
      console.error("Error updating pet status:", error)
      toast.error("Error al actualizar el estado de la mascota")
    }
  }

  const handleDeletePet = async (petId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pets/${petId}`, {
      //   method: "DELETE"
      // });

      // Actualizar estado local
      setPets(pets.filter((pet) => pet.id !== petId))

      toast.success("Mascota eliminada correctamente")
    } catch (error) {
      console.error("Error deleting pet:", error)
      toast.error("Error al eliminar la mascota")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activa</Badge>
      case "hidden":
        return <Badge variant="secondary">Oculta</Badge>
      case "reported":
        return <Badge variant="destructive">Reportada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Mascotas</h1>
        <Button onClick={() => router.push("/admin/pets/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Mascota
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Buscar por nombre, tipo o dueño..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSearchQuery("")}>Todos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("type:Perro")}>Perros</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("type:Gato")}>Gatos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("type:Otro")}>Otros</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSearchQuery("status:active")}>Activas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("status:hidden")}>Ocultas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("status:reported")}>Reportadas</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mascota</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Fecha de registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Cargando mascotas...
                </TableCell>
              </TableRow>
            ) : pets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No se encontraron mascotas
                </TableCell>
              </TableRow>
            ) : (
              pets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={pet.image || undefined} alt={pet.name} />
                        <AvatarFallback>{pet.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{pet.name}</div>
                        <div className="text-sm text-muted-foreground">{pet.breed || "Sin raza especificada"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{pet.type}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => router.push(`/admin/users/${pet.ownerId}`)}
                    >
                      {pet.ownerName}
                    </Button>
                  </TableCell>
                  <TableCell>{getStatusBadge(pet.status)}</TableCell>
                  <TableCell>{pet.followersCount}</TableCell>
                  <TableCell>{new Date(pet.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/pets/${pet.id}`)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/pets/${pet.id}/edit`)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(pet.id, "active")}
                          disabled={pet.status === "active"}
                        >
                          Activar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(pet.id, "hidden")}
                          disabled={pet.status === "hidden"}
                        >
                          Ocultar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(pet.id, "reported")}
                          disabled={pet.status === "reported"}
                        >
                          Marcar como reportada
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePet(pet.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

