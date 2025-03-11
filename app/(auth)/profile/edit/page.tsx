"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Importamos Textarea
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { profileWithPetFormSchema, type ProfileWithPetFormValues } from "@/lib/validations"

export default function EditProfilePage() {
  const { user, loading, refreshUser } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPetImageUploading, setIsPetImageUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewPetImage, setPreviewPetImage] = useState<string | null>(null)

  // Inicializar el formulario
  const form = useForm<ProfileWithPetFormValues>({
    resolver: zodResolver(profileWithPetFormSchema),
    defaultValues: {
      username: "",
      bio: "", // Añadimos el campo bio
      petName: "",
      petType: "",
      location: "",
      isPublicProfile: true,
      profileImage: "",
      petImage: "",
    },
  })

  // Proteger la ruta - redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Debes iniciar sesión para editar tu perfil")
      router.push("/login")
    }
  }, [user, loading, router])

  // Cargar los datos del usuario en el formulario
  useEffect(() => {
    if (user) {
      console.log("Cargando datos del usuario en el formulario:", user)

      // Asegurarse de que todos los campos se inicialicen correctamente
      form.reset(
        {
          username: user.username || "",
          bio: user.bio || "", // Incluimos el campo bio
          petName: user.petName || "",
          petType: user.petType || "",
          location: user.location || "",
          isPublicProfile: user.isPublicProfile !== undefined ? user.isPublicProfile : true,
          profileImage: user.profileImage || "",
          petImage: user.petImage || "",
        },
        { keepDefaultValues: false },
      )

      // Establecer las vistas previas de las imágenes
      setPreviewImage(user.profileImage || null)
      setPreviewPetImage(user.petImage || null)

      console.log("Formulario inicializado con:", {
        username: user.username,
        bio: user.bio,
        petName: user.petName,
        petType: user.petType,
        location: user.location,
        isPublicProfile: user.isPublicProfile,
        profileImage: user.profileImage ? "Imagen de perfil cargada" : "Sin imagen de perfil",
        petImage: user.petImage ? "Imagen de mascota cargada" : "Sin imagen de mascota",
      })
    }
  }, [user, form])

  // Añadir un useEffect para depurar cuando los valores del formulario cambien
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Valores actuales del formulario:", value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Función para subir una imagen a través de la API
  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al subir la imagen")
    }

    const data = await response.json()
    return data.url
  }

  // Función para manejar la subida de imágenes de perfil
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

    // Crear una vista previa de la imagen para mostrar inmediatamente
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir la imagen al servidor
    setIsUploading(true)
    try {
      const imageUrl = await uploadImageToServer(file)

      // Actualizar el valor del formulario con la URL de la imagen
      form.setValue("profileImage", imageUrl)
      toast.success("Imagen de perfil subida correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen de perfil")
      console.error("Error uploading profile image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  // Función para manejar la subida de imágenes de mascota
  const handlePetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Crear una vista previa de la imagen para mostrar inmediatamente
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewPetImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir la imagen al servidor
    setIsPetImageUploading(true)
    try {
      const imageUrl = await uploadImageToServer(file)

      // Actualizar el valor del formulario con la URL de la imagen
      form.setValue("petImage", imageUrl)
      toast.success("Imagen de mascota subida correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen de mascota")
      console.error("Error uploading pet image:", error)
    } finally {
      setIsPetImageUploading(false)
    }
  }

  // Mejorar la función refreshUser en el contexto para asegurar que los datos se actualicen correctamente
  const onSubmit = async (data: ProfileWithPetFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Enviando datos del formulario:", data)

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

      toast.success("Perfil actualizado correctamente")

      // Actualizar el contexto de usuario y esperar a que se complete
      await refreshUser()
      console.log("Datos de usuario actualizados en el contexto")

      // Redirigir al perfil
      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // No renderizar nada si no hay usuario (la redirección se maneja en el useEffect)
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link href={`/profile/${user.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Tus datos actuales se cargarán automáticamente. Modifica solo los campos que deseas actualizar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Actualiza tu información de perfil. Estos datos serán visibles para otros usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-2 border-primary/20">
                    <AvatarImage
                      src={previewImage || user.profileImage || "/placeholder.svg?height=128&width=128"}
                      alt="Foto de perfil"
                      className="object-cover"
                    />
                    <AvatarFallback>{user.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        <Upload className="h-4 w-4" />
                        <span>
                          {isUploading
                            ? "Subiendo..."
                            : previewImage || user.profileImage
                              ? "Cambiar foto"
                              : "Subir foto"}
                        </span>
                      </div>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {(previewImage || user.profileImage) && (
                    <p className="text-xs text-muted-foreground text-center">Foto de perfil actual</p>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre de usuario" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este es tu nombre público. Otros usuarios te verán con este nombre.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Añadimos el campo de biografía */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cuéntanos sobre ti y tus mascotas"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>{field.value?.length || 0}/160 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user.email && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Correo electrónico
                      </label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <p className="text-sm text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu ciudad o país" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>Opcional. Ayuda a otros usuarios a encontrarte por ubicación.</FormDescription>
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
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Información de mascota principal</h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 border-2 border-primary/20">
                      <AvatarImage
                        src={previewPetImage || user.petImage || "/placeholder.svg?height=128&width=128"}
                        alt="Foto de mascota"
                        className="object-cover"
                      />
                      <AvatarFallback>{form.watch("petName")?.[0] || "P"}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <label htmlFor="petPicture" className="cursor-pointer">
                        <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                          <Upload className="h-4 w-4" />
                          <span>
                            {isPetImageUploading
                              ? "Subiendo..."
                              : previewPetImage || user.petImage
                                ? "Cambiar foto"
                                : "Subir foto"}
                          </span>
                        </div>
                        <input
                          id="petPicture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePetImageUpload}
                          disabled={isPetImageUploading}
                        />
                      </label>
                    </div>
                    {(previewPetImage || user.petImage) && (
                      <p className="text-xs text-muted-foreground text-center">Foto de mascota actual</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="petName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la mascota</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de tu mascota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="petType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de mascota</FormLabel>
                          <FormControl>
                            <Input placeholder="Perro, gato, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/profile/${user.id}`)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

