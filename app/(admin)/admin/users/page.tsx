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
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, UserPlus, Filter } from "lucide-react"
import { toast } from "sonner"

// Actualizar la interfaz User para que coincida con los datos que devuelve la API
interface User {
  id: string
  username: string
  email: string
  profileImage: string | null
  role: string
  isEmailConfirmed: boolean
  createdAt: string
  _count: {
    pets: number
  }
  status?: "active" | "suspended" | "pending" // Mantenemos este campo para la UI
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Actualizar el hook useEffect para que haga una llamada real a la API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        // Llamada real a la API
        const response = await fetch(`/api/admin/users?page=${currentPage}&search=${searchQuery}`)

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()

        // Mapear los datos para adaptarlos a nuestra interfaz
        const formattedUsers = data.users.map((user: any) => ({
          ...user,
          // Determinar el estado basado en isEmailConfirmed o cualquier otro criterio
          status: user.isEmailConfirmed ? "active" : "pending",
          // Asegurarse de que petsCount esté disponible
          petsCount: user._count?.pets || 0,
        }))

        setUsers(formattedUsers)
        setTotalPages(data.pagination.totalPages || 1)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Error al cargar los usuarios")
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Resetear a la primera página al buscar
  }

  // Actualizar la función handleStatusChange para que llame a la API
  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended" | "pending") => {
    try {
      // Llamada real a la API
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Actualizar estado local
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))

      toast.success("Estado del usuario actualizado")
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Error al actualizar el estado del usuario")
    }
  }

  // Actualizar la función handleDeleteUser para que llame a la API
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // Llamada real a la API
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Actualizar estado local
      setUsers(users.filter((user) => user.id !== userId))

      toast.success("Usuario eliminado correctamente")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error al eliminar el usuario")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Activo</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspendido</Badge>
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <Button onClick={() => router.push("/admin/users/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Buscar por nombre o email..."
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
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSearchQuery("")}>Todos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("status:active")}>Activos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("status:suspended")}>Suspendidos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("status:pending")}>Pendientes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSearchQuery("role:USER")}>Usuarios</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchQuery("role:ADMIN")}>Administradores</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Mascotas</TableHead>
              <TableHead>Fecha de registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profileImage || undefined} alt={user.username} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status || "pending")}</TableCell>
                  <TableCell>{user._count.pets}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id, "active")}
                          disabled={user.status === "active"}
                        >
                          Activar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id, "suspended")}
                          disabled={user.status === "suspended"}
                        >
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
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

