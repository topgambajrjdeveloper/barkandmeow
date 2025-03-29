"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Trash2, Eye, EyeOff, MoreHorizontal, Calendar, Users, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Event } from "@/types"

interface EventsTableProps {
  events: Event[]
}

export function EventsTable({ events }: EventsTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = (eventId: string) => {
    router.push(`/admin/events/${eventId}`)
  }

  const handleView = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleTogglePublish = async (eventId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el evento")
      }

      toast.success(`Evento ${!currentStatus ? "publicado" : "despublicado"} correctamente`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (eventId: string) => {
    setEventToDelete(eventId)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!eventToDelete) return

    try {
      setIsLoading(true)

      const response = await fetch(`/api/events/${eventToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el evento")
      }

      toast.success("Evento eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error al eliminar el evento")
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Asistentes</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay eventos disponibles
              </TableCell>
            </TableRow>
          )}

          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {format(new Date(event.date), "PPP", { locale: es })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {event.location}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  {event._count?.attendees || 0}
                </div>
              </TableCell>
              <TableCell>
                {event.isPublished ? (
                  <Badge variant="default">Publicado</Badge>
                ) : (
                  <Badge variant="outline">Borrador</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleView(event.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver evento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(event.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(event.id, event.isPublished)}
                      disabled={isLoading}
                    >
                      {event.isPublished ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Despublicar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publicar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => confirmDelete(event.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

