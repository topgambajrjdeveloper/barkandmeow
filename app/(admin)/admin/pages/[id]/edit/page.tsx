"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Editor } from "@/components/(admin)/editor"
import { toast } from "sonner"
import { ArrowLeft, Save, Eye, Trash } from "lucide-react"

interface PageData {
  id: string
  title: string
  slug: string
  content: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
}

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageData, setPageData] = useState<PageData>({
    id: "",
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  })

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a tu API
        // const response = await fetch(`/api/admin/pages/${params.id}`);
        // const data = await response.json();

        // Datos de ejemplo
        let mockPage: PageData

        if (params.id === "1") {
          mockPage = {
            id: "1",
            title: "Acerca de nosotros",
            slug: "about",
            content: `<h1>Acerca de BarkAndMeow</h1>
            <p>BarkAndMeow es una red social dedicada a conectar a dueños de mascotas y sus adorables compañeros peludos.</p>
            <p>Nuestra misión es crear una comunidad donde los amantes de las mascotas puedan compartir experiencias, encontrar consejos y descubrir servicios para el bienestar de sus mascotas.</p>
            <h2>Nuestra Historia</h2>
            <p>Fundada en 2023, BarkAndMeow nació de la pasión por los animales y la tecnología. Nuestro equipo está formado por desarrolladores y diseñadores que también son dueños de mascotas entusiastas.</p>`,
            metaTitle: "Acerca de BarkAndMeow | Red Social para Mascotas",
            metaDescription:
              "Conoce más sobre BarkAndMeow, la red social dedicada a conectar dueños de mascotas y sus adorables compañeros peludos.",
            isPublished: true,
          }
        } else if (params.id === "2") {
          mockPage = {
            id: "2",
            title: "Política de Cookies",
            slug: "politica-cookies",
            content: `<h1>Política de Cookies</h1>
            <p>En BarkAndMeow utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación y ofrecerte contenido personalizado.</p>
            <h2>¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Estas cookies nos permiten reconocerte y recordar tus preferencias.</p>`,
            metaTitle: "Política de Cookies | BarkAndMeow",
            metaDescription:
              "Información sobre el uso de cookies en BarkAndMeow, la red social para mascotas y sus dueños.",
            isPublished: true,
          }
        } else {
          // Página genérica para otros IDs
          mockPage = {
            id: params.id,
            title: "Página de ejemplo",
            slug: "pagina-ejemplo",
            content: "<h1>Contenido de ejemplo</h1><p>Este es un contenido de ejemplo para la página.</p>",
            metaTitle: "Página de ejemplo | BarkAndMeow",
            metaDescription: "Descripción de ejemplo para la página.",
            isPublished: params.id !== "5", // El ID 5 es un borrador en nuestros datos de ejemplo
          }
        }

        setPageData(mockPage)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching page:", error)
        toast.error("Error al cargar la página")
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPageData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (content: string) => {
    setPageData((prev) => ({ ...prev, content }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setPageData((prev) => ({ ...prev, isPublished: checked }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validaciones básicas
      if (!pageData.title.trim()) {
        toast.error("El título es obligatorio")
        setIsSaving(false)
        return
      }

      if (!pageData.slug.trim()) {
        toast.error("El slug es obligatorio")
        setIsSaving(false)
        return
      }

      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pages/${params.id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(pageData)
      // });

      // Simulamos un retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Página guardada correctamente")
      setIsSaving(false)
    } catch (error) {
      console.error("Error saving page:", error)
      toast.error("Error al guardar la página")
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta página? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // En una implementación real, esto sería una llamada a tu API
      // await fetch(`/api/admin/pages/${params.id}`, {
      //   method: "DELETE"
      // });

      toast.success("Página eliminada correctamente")
      router.push("/admin/pages")
    } catch (error) {
      console.error("Error deleting page:", error)
      toast.error("Error al eliminar la página")
    }
  }

  const handlePreview = () => {
    // Abrir una nueva ventana con la vista previa
    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${pageData.title} | Vista previa</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 {
              color: #333;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .preview-banner {
              background: #f0f0f0;
              padding: 10px;
              text-align: center;
              margin-bottom: 20px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="preview-banner">
            <strong>Vista previa</strong> - Esta es una vista previa de la página. Los cambios no se han guardado.
          </div>
          ${pageData.content}
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando página...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/pages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Página</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="mb-4">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={pageData.title}
                onChange={handleInputChange}
                placeholder="Título de la página"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={pageData.slug}
                onChange={handleInputChange}
                placeholder="slug-de-la-pagina"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contenido</Label>
            <Editor initialValue={pageData.content} onChange={handleEditorChange} />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimización para motores de búsqueda</CardTitle>
              <CardDescription>Configura cómo aparecerá tu página en los resultados de búsqueda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta título</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={pageData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="Meta título para SEO"
                />
                <p className="text-sm text-muted-foreground">Recomendado: 50-60 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta descripción</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={pageData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Meta descripción para SEO"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Recomendado: 150-160 caracteres</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la página</CardTitle>
              <CardDescription>Configura las opciones de publicación y visibilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Estado de publicación</Label>
                  <p className="text-sm text-muted-foreground">
                    {pageData.isPublished
                      ? "La página está publicada y visible para todos los usuarios"
                      : "La página está en modo borrador y solo visible para administradores"}
                  </p>
                </div>
                <Switch id="published" checked={pageData.isPublished} onCheckedChange={handleSwitchChange} />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleString()}</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

