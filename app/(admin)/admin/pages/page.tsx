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
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, FileText, Eye, Edit, Trash, Plus } from "lucide-react"
import { toast } from "sonner"

interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft"
  lastUpdated: string
  author: string
}

export default function PagesManagement() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a tu API
        // const response = await fetch(`/api/admin/pages?page=${currentPage}&search=${searchQuery}`);
        // const data = await response.json();

        // Datos de ejemplo
        const mockPages: Page[] = [
          {
            id: "1",
            title: "Acerca de nosotros",
            slug: "about",
            status: "published",
            lastUpdated: "2023-05-15T10:30:00Z",
            author: "admin",
          },
          {
            id: "2",
            title: "Política de Cookies",
            slug: "politica-cookies",
            status: "published",
            lastUpdated: "2023-06-20T14:45:00Z",
            author: "admin",
          },
          {
            id: "3",
            title: "Política de Privacidad",
            slug: "privacy",
            status: "published",
            lastUpdated: "2023-07-10T09:15:00Z",
            author: "admin",
          },
          {
            id: "4",
            title: "Términos y Condiciones",
            slug: "terms",
            status: "published",
            lastUpdated: "2023-08-05T16:20:00Z",
            author: "admin",
          },
          {
            id: "5",
            title: "Preguntas Frecuentes",
            slug: "faq",
            status: "draft",
            lastUpdated: "2023-09-01T11:10:00Z",
            author: "admin",
          },
        ]

        setPages(mockPages)
        setTotalPages(1) // Solo una página para este ejemplo
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching pages:", error)
        toast.error("Error al cargar las páginas")
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Resetear a la primera página al buscar
  }

  const handleStatusChange = async (pageId: string, newStatus: "published" | "draft") => {
    try {
      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pages/${pageId}/status`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ status: newStatus })
      // });

      // Actualizar estado local
      setPages(pages.map((page) => (page.id === pageId ? { ...page, status: newStatus } : page)))

      toast.success(`Página ${newStatus === "published" ? "publicada" : "guardada como borrador"}`)
    } catch (error) {
      console.error("Error updating page status:", error)
      toast.error("Error al actualizar el estado de la página")
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta página? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pages/${pageId}`, {
      //   method: "DELETE"
      // });

      // Actualizar estado local
      setPages(pages.filter((page) => page.id !== pageId))

      toast.success("Página eliminada correctamente")
    } catch (error) {
      console.error("Error deleting page:", error)
      toast.error("Error al eliminar la página")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Publicada</Badge>
      case "draft":
        return <Badge variant="secondary">Borrador</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Páginas</h1>
        <Button onClick={() => router.push("/admin/pages/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Página
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Buscar por título o slug..."
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
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última actualización</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Cargando páginas...
                </TableCell>
              </TableRow>
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No se encontraron páginas
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>{getStatusBadge(page.status)}</TableCell>
                  <TableCell>{new Date(page.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>{page.author}</TableCell>
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
                        <DropdownMenuItem onClick={() => window.open(`/${page.slug}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver página
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/pages/${page.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(page.id, "published")}
                          disabled={page.status === "published"}
                        >
                          Publicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(page.id, "draft")}
                          disabled={page.status === "draft"}
                        >
                          Guardar como borrador
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
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

