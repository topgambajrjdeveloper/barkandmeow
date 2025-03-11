"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"

import { profileFormSchema, type ProfileFormValues } from "@/lib/validations"
import type { EditProfileDialogProps } from "@/types"

export function EditProfileDialog({ open, onOpenChange, profile }: EditProfileDialogProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(profile.profileImage)

  // Inicializar el formulario con los valores actuales del perfil
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username,
      bio: profile.bio || "",
      location: profile.location || "",
      isPublicProfile: profile.isPublicProfile,
      profileImage: profile.profileImage || "",
    },
  })

  // Función para manejar la subida de imágenes
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar el tipo de archivo
    if (!file.type.includes("image")) {
      toast.error("Por favor, sube solo imágenes")
      return
    }

    // Validar el tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB")
      return
    }

    // Crear una vista previa de la imagen
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // En una implementación real, aquí subirías la imagen a un servicio de almacenamiento
    setIsUploading(true)
    try {
      // Simulación de subida (en una implementación real, aquí subirías la imagen a un servicio como Cloudinary o S3)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Actualizar el valor del formulario con la URL de la imagen (en este caso usamos la vista previa)
      form.setValue("profileImage", event.target?.result as string)
      toast.success("Imagen subida correctamente")
    } catch (error) {
      toast.error("Error al subir la imagen")
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  // Mejorar el manejo de errores en el componente de edición de perfil
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/user/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Error response:", responseData)
        throw new Error(responseData.error || "Error al actualizar el perfil")
      }

      // Actualizar el contexto de usuario con los nuevos datos
      // Esto asegura que los cambios se reflejen en toda la aplicación
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedUserData = responseData.user

      toast.success("Perfil actualizado correctamente")

      // Actualizar el contexto de usuario si está disponible
      if (typeof window !== "undefined") {
        // Forzar un refresco completo para asegurar que todos los datos se actualicen
        router.refresh()
      }

      onOpenChange(false) // Cerrar el diálogo
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información de perfil. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewImage || "/placeholder.svg?height=96&width=96"} alt="Foto de perfil" />
                <AvatarFallback>{profile.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <label htmlFor="picture" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "Subiendo..." : "Cambiar foto"}</span>
                  </div>
                  <input
                    id="picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre de usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cuéntanos sobre ti y tus mascotas" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>{form.watch("bio")?.length || 0}/160 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu ciudad o país" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublicProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Perfil público</FormLabel>
                    <FormDescription>Permite que otros usuarios vean tu perfil y tus mascotas</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

