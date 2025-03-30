/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Users, X, Hash } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { generatePreviewContent } from "@/lib/content-processor"

interface User {
  id: string
  username: string
  profileImage?: string | null
}

interface Pet {
  id: string
  name: string
  image?: string | null
  type: string
}

interface CreatePostProps {
  user: User
  userPets: Pet[]
  onPostCreated?: () => void
}

export default function CreatePost({ user, userPets, onPostCreated }: CreatePostProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [currentHashtag, setCurrentHashtag] = useState("")
  const [taggedUsers, setTaggedUsers] = useState<User[]>([])
  const [taggedPets, setTaggedPets] = useState<Pet[]>([])
  const [isTaggingUsers, setIsTaggingUsers] = useState(false)
  const [isTaggingPets, setIsTaggingPets] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isCreatePage = pathname === "/create"

  // Efecto para mostrar/ocultar la vista previa
  useEffect(() => {
    // Mostrar vista previa si hay contenido o elementos etiquetados
    setShowPreview(content.trim().length > 0 || hashtags.length > 0 || taggedUsers.length > 0 || taggedPets.length > 0)
  }, [content, hashtags, taggedUsers, taggedPets])

  // Efecto para buscar usuarios/mascotas cuando se escribe en el campo de búsqueda
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 1) {
      setSearchResults([])
      return
    }

    const fetchResults = async () => {
      setIsSearching(true)
      try {
        const endpoint = isTaggingUsers ? "/api/users/search" : "/api/pets/search"
        console.log(`Buscando en: ${endpoint}?q=${searchTerm}`)

        const response = await fetch(`${endpoint}?q=${searchTerm}`)

        if (!response.ok) {
          console.error(`Error en búsqueda: ${response.status} ${response.statusText}`)
          setSearchResults([])
          return
        }

        const data = await response.json()
        console.log("Resultados de búsqueda:", data)

        if (isTaggingUsers && data.users) {
          console.log("Usuarios encontrados:", data.users)
          setSearchResults(data.users)
        } else if (!isTaggingUsers && data.pets) {
          console.log("Mascotas encontradas:", data.pets)
          setSearchResults(data.pets)
        } else {
          console.log("No se encontraron resultados o formato incorrecto")
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error al buscar:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, isTaggingUsers, isTaggingPets])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.includes("image")) {
      toast.error("El archivo debe ser una imagen")
      return
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("La imagen no puede superar los 5MB")
      return
    }

    setImageFile(file)

    // Crear URL para previsualización
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()])
      setCurrentHashtag("")
    }
  }

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const handleTagUser = (user: any) => {
    console.log("Etiquetando usuario:", user)
    // Asegurarnos de que el objeto user tiene todas las propiedades necesarias
    const validUser: User = {
      id: user.id,
      username: user.username || "usuario",
      profileImage: user.profileImage,
    }

    if (!taggedUsers.some((u) => u.id === validUser.id)) {
      setTaggedUsers([...taggedUsers, validUser])
    }
    setSearchTerm("")
    setSearchResults([])
    setIsTaggingUsers(false)
  }

  const handleTagPet = (pet: any) => {
    console.log("Etiquetando mascota:", pet)
    // Asegurarnos de que el objeto pet tiene todas las propiedades necesarias
    const validPet: Pet = {
      id: pet.id,
      name: pet.name || "Mascota sin nombre",
      type: pet.type || "Tipo desconocido",
      image: pet.image,
    }

    if (!taggedPets.some((p) => p.id === validPet.id)) {
      setTaggedPets([...taggedPets, validPet])
    }
    setSearchTerm("")
    setSearchResults([])
    setIsTaggingPets(false)
  }

  const handleRemoveTaggedUser = (userId: string) => {
    setTaggedUsers(taggedUsers.filter((user) => user.id !== userId))
  }

  const handleRemoveTaggedPet = (petId: string) => {
    setTaggedPets(taggedPets.filter((pet) => pet.id !== petId))
  }

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error("La publicación debe tener contenido o una imagen")
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = null

      // Si hay una imagen, subirla primero a Cloudinary
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || "Error al subir la imagen")
        }

        const uploadResult = await uploadResponse.json()
        // Usar la URL devuelta por Cloudinary
        imageUrl = uploadResult.url
      }

      // Crear la publicación
      const postData = {
        content,
        imageUrl,
        petId: selectedPet?.id,
        hashtags,
        taggedUsers: taggedUsers.map((user) => user.id),
        taggedPets: taggedPets.map((pet) => pet.id),
      }

      console.log("Enviando datos de publicación:", postData)

      const postResponse = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!postResponse.ok) {
        const error = await postResponse.json()
        throw new Error(error.error || "Error al crear la publicación")
      }

      const result = await postResponse.json()
      console.log("Publicación creada:", result)

      toast.success("Publicación creada con éxito")

      // Limpiar el formulario
      setContent("")
      setImageFile(null)
      setImagePreview(null)
      setSelectedPet(null)
      setHashtags([])
      setTaggedUsers([])
      setTaggedPets([])

      // Si estamos en la página de creación (móvil), redirigir al feed
      if (isCreatePage) {
        router.push("/feed")
      } else {
        // Actualizar la UI
        router.refresh()
      }

      // Llamar al callback si existe
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error al crear la publicación:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la publicación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-background/1 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">¿Qué está haciendo tu mascota hoy?</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Comparte un momento especial con tu mascota..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        {/* Vista previa del contenido con hashtags y menciones clicables */}
        {showPreview && (
          <div className="mt-4 p-3 border rounded-md">
            <h3 className="text-sm font-medium mb-2">Vista previa:</h3>
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: generatePreviewContent(content, hashtags, taggedUsers, taggedPets),
              }}
            />
          </div>
        )}

        {imagePreview && (
          <div className="relative">
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="Vista previa"
              width={600}
              height={400}
              className="rounded-md object-cover w-full max-h-[300px]"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mascotas seleccionadas */}
        {selectedPet && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <span>{selectedPet.name}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setSelectedPet(null)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Hash className="h-3 w-3" />
                <span>{tag}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveHashtag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Usuarios etiquetados */}
        {taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Usuarios etiquetados:</span>
            {taggedUsers.map((user) => (
              <Badge key={user.id} variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span>@{user.username}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveTaggedUser(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Mascotas etiquetadas */}
        {taggedPets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Mascotas etiquetadas:</span>
            {taggedPets.map((pet) => (
              <Badge key={pet.id} variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span>{pet.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveTaggedPet(pet.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {/* Input para subir imagen */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Foto</span>
          </Button>

          {/* Seleccionar mascota */}
          {userPets.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Mascota</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecciona una mascota</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {userPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-accent"
                      onClick={() => {
                        setSelectedPet(pet)
                        document
                          .querySelector('[role="dialog"]')
                          ?.closest('div[data-state="open"]')
                          ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                      }}
                    >
                      <Avatar>
                        <AvatarImage src={pet.image || "/placeholder.svg?height=40&width=40"} alt={pet.name} />
                        <AvatarFallback>{pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">{pet.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Añadir hashtag */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Hash className="h-4 w-4" />
                <span className="hidden sm:inline">Hashtag</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir hashtag</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Escribe un hashtag"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddHashtag()
                      }
                    }}
                  />
                  <Button onClick={handleAddHashtag}>Añadir</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Etiquetar usuarios */}
          <Dialog
            open={isTaggingUsers}
            onOpenChange={(open) => {
              setIsTaggingUsers(open)
              if (!open) {
                setSearchTerm("")
                setSearchResults([])
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => {
                  setIsTaggingUsers(true)
                  setIsTaggingPets(false)
                  setSearchTerm("")
                  setSearchResults([])
                }}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Etiquetar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Etiquetar usuarios</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                <div className="max-h-[300px] overflow-y-auto">
                  {isSearching ? (
                    <div className="py-6 text-center text-sm">Buscando usuarios...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      {searchTerm.length > 0 ? "No se encontraron usuarios" : "Escribe para buscar usuarios"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-accent cursor-pointer"
                          onClick={() => handleTagUser(result)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.profileImage || "/placeholder-user.jpg"} alt={result.username} />
                            <AvatarFallback>{result.username?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">@{result.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Etiquetar mascotas */}
          <Dialog
            open={isTaggingPets}
            onOpenChange={(open) => {
              setIsTaggingPets(open)
              if (!open) {
                setSearchTerm("")
                setSearchResults([])
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => {
                  setIsTaggingPets(true)
                  setIsTaggingUsers(false)
                  setSearchTerm("")
                  setSearchResults([])
                }}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Etiquetar mascota</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Etiquetar mascotas</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Buscar mascotas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                <div className="max-h-[300px] overflow-y-auto">
                  {isSearching ? (
                    <div className="py-6 text-center text-sm">Buscando mascotas...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm">
                      {searchTerm.length > 0 ? "No se encontraron mascotas" : "Escribe para buscar mascotas"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-accent cursor-pointer"
                          onClick={() => handleTagPet(result)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={result.image || "/placeholder.svg?height=40&width=40"}
                              alt={result.name}
                            />
                            <AvatarFallback>{result.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.name || "Mascota sin nombre"}</p>
                            <p className="text-xs text-muted-foreground">{result.type || "Tipo desconocido"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="ml-auto h-8"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageFile)}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

