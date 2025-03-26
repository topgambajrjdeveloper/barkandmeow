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
import { Search, UserPlus, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import type { TeamMember } from "@/types"

export default function TeamManagementPage() {
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/admin/team")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setTeamMembers(data)
      } catch (error) {
        console.error("Error fetching team members:", error)
        toast.error("Error al cargar los miembros del equipo")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleChangeOrder = async (id: string, direction: "up" | "down") => {
    try {
      const currentIndex = teamMembers.findIndex((member) => member.id === id)
      if (currentIndex === -1) return

      const currentMember = teamMembers[currentIndex]

      // Si es el primero y quiere subir, o es el último y quiere bajar, no hacemos nada
      if (
        (currentIndex === 0 && direction === "up") ||
        (currentIndex === teamMembers.length - 1 && direction === "down")
      ) {
        return
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

      const targetMember = teamMembers[targetIndex]

      // Intercambiar órdenes
      const response = await fetch(`/api/admin/team/${currentMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentMember,
          order: targetMember.order,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const secondResponse = await fetch(`/api/admin/team/${targetMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...targetMember,
          order: currentMember.order,
        }),
      })

      if (!secondResponse.ok) {
        throw new Error(`Error: ${secondResponse.status}`)
      }

      // Actualizar estado local
      const updatedMembers = [...teamMembers]
      updatedMembers[currentIndex] = { ...currentMember, order: targetMember.order }
      updatedMembers[targetIndex] = { ...targetMember, order: currentMember.order }

      // Ordenar por orden
      updatedMembers.sort((a, b) => a.order - b.order)

      setTeamMembers(updatedMembers)
      toast.success("Orden actualizado correctamente")
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Error al actualizar el orden")
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este miembro del equipo? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Actualizar estado local
      setTeamMembers(teamMembers.filter((member) => member.id !== id))
      toast.success("Miembro del equipo eliminado correctamente")
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast.error("Error al eliminar el miembro del equipo")
    }
  }

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión del Equipo</h1>
        <Button onClick={() => router.push("/admin/team/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Miembro
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Buscar por nombre o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fundador</TableHead>
              <TableHead>Redes Sociales</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Cargando miembros del equipo...
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No se encontraron miembros del equipo
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.image || undefined} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    {member.isFounder ? <Badge variant="default">Fundador</Badge> : <Badge variant="outline">No</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {member.twitter && <Badge variant="outline">Twitter</Badge>}
                      {member.instagram && <Badge variant="outline">Instagram</Badge>}
                      {member.facebook && <Badge variant="outline">Facebook</Badge>}
                      {member.linkedin && <Badge variant="outline">LinkedIn</Badge>}
                      {member.github && <Badge variant="outline">GitHub</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{member.order}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleChangeOrder(member.id, "up")}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleChangeOrder(member.id, "down")}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/admin/team/${member.id}/edit`)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteMember(member.id)}
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
    </div>
  )
}

