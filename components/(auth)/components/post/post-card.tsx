/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, MoreHorizontal, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShareContent } from "@/components/(root)/share-content"

// Modificar la función processContent para validar hashtags antes de crear enlaces
export function processContent(content: string) {
  if (!content) return ""

  let processedContent = content

  // Convertir hashtags en enlaces (solo hashtags válidos)
  processedContent = processedContent.replace(/#(\w+)/g, (match, tag) => {
    // Validar que el hashtag solo contiene caracteres permitidos
    if (/^[a-zA-Z0-9_]+$/.test(tag)) {
      return `<a href="/hashtag/${tag}" class="text-blue-500 hover:underline">#${tag}</a>`
    }
    // Si no es válido, devolver el hashtag original sin enlace
    return match
  })

  // Convertir menciones de usuario en enlaces
  processedContent = processedContent.replace(
    /@(\w+)/g,
    '<a href="/user/$1" class="text-blue-500 hover:underline">@$1</a>',
  )

  // Convertir menciones de mascotas en enlaces
  processedContent = processedContent.replace(
    /@pet:(\w+)/g,
    '<a href="/pet/$1" class="text-blue-500 hover:underline">@pet:$1</a>',
  )

  return processedContent
}

interface PostCardProps {
  post: {
    id: string
    content: string | null
    imageUrl?: string | null
    createdAt: string | Date
    user: {
      id: string
      username: string
      profileImage: string | null
    }
    pet?: {
      id: string
      name: string
      type: string
      image: string | null
    } | null
    hashtags: { id: string; name: string }[]
    taggedUsers?: { user: { id: string; username: string } }[]
    taggedPets?: { pet: { id: string; name: string } }[]
    _count: {
      likes: number
      comments: number
    }
    hasLiked?: boolean
  }
  currentUserId?: string
  showActions?: boolean
  onDelete?: () => void
}

export default function PostCard({ post, currentUserId, showActions = true, onDelete }: PostCardProps) {
  const router = useRouter()
  const [isLiking, setIsLiking] = useState(false)
  const [liked, setLiked] = useState(post.hasLiked || false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [timeAgo, setTimeAgo] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)

  const isOwner = currentUserId === post.user.id

  // Efecto para manejar la hidratación y calcular el tiempo relativo
  useEffect(() => {
    setIsMounted(true)

    // Calcular el tiempo relativo
    setTimeAgo(
      formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: es,
      }),
    )

    // Actualizar el tiempo cada minuto
    const interval = setInterval(() => {
      setTimeAgo(
        formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale: es,
        }),
      )
    }, 60000)

    return () => clearInterval(interval)
  }, [post.createdAt])

  const handleLike = useCallback(async () => {
    if (!currentUserId) {
      router.push("/login")
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const { liked } = await response.json()
        setLiked(liked)
        setLikeCount((prev) => (liked ? prev + 1 : prev - 1))
      } else {
        throw new Error("Error al procesar el like")
      }
    } catch (error) {
      toast.error("No se pudo procesar tu like")
    } finally {
      setIsLiking(false)
    }
  }, [currentUserId, isLiking, post.id, router])

  const handleDelete = useCallback(async () => {
    if (!isOwner) return

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Publicación eliminada")
        if (onDelete) onDelete()
        router.refresh()
      } else {
        throw new Error("Error al eliminar la publicación")
      }
    } catch (error) {
      toast.error("No se pudo eliminar la publicación")
    }
  }, [isOwner, onDelete, post.id, router])

  return (
    <Card className="border-background/1 border-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/user/${post.user.username}`}>
              <Avatar>
                <AvatarImage src={post.user.profileImage || "/placeholder-user.jpg"} alt={post.user.username} />
                <AvatarFallback>{post.user.username[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/user/${post.user.username}`} className="text-sm font-medium leading-none hover:underline">
                {post.user.username}
              </Link>
              <div className="flex items-center text-xs text-muted-foreground">
                {post.pet && (
                  <Link href={`/pet/${post.pet.id}`} className="hover:underline">
                    {post.pet.name} • {post.pet.type} •{" "}
                  </Link>
                )}
                <span>{timeAgo || "..."}</span>
              </div>
            </div>
          </div>

          {isOwner && showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.content && (
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
        )}

        {post.imageUrl && (
          <Link href={`/feed/${post.id}`}>
            <div className="relative max-h-[300px] overflow-hidden rounded-md">
              <Image
                priority
                src={post.imageUrl || "/placeholder.svg"}
                alt="Publicación"
                width={600}
                height={400}
                className="object-cover w-full h-auto max-h-[500px] cursor-pointer"
              />
            </div>
          </Link>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <Link key={tag.id} href={`/hashtag/${tag.name}`}>
                <Badge variant="secondary" className="cursor-pointer">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Usuarios etiquetados */}
        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span>Con: </span>
            {post.taggedUsers.map((tagged, index) => (
              <span key={tagged.user.id}>
                <Link href={`/user/${tagged.user.username}`} className="font-medium hover:underline">
                  @{tagged.user.username}
                </Link>
                {index < post.taggedUsers!.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}

        {/* Mascotas etiquetadas */}
        {post.taggedPets && post.taggedPets.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span>Mascotas: </span>
            {post.taggedPets.map((tagged, index) => (
              <span key={tagged.pet.id}>
                <Link href={`/pet/${tagged.pet.id}`} className="font-medium hover:underline">
                  {tagged.pet.name}
                </Link>
                {index < post.taggedPets!.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="border-t pt-3">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${liked ? "text-red-500" : ""}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>

            <Link href={`/feed/${post.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.comments}</span>
              </Button>
            </Link>

            {/* Reemplazar el botón de compartir con el componente ShareContent */}
            <ShareContent
              variant="ghost"
              size="sm"
              showLabel={false}
              title={`Publicación de ${post.user.username}`}
              description={post.content || ""}
              url={typeof window !== "undefined" ? `${window.location.origin}/feed/${post.id}` : `/feed/${post.id}`}
              image={post.imageUrl || ""}
              className="gap-1"
            />
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

