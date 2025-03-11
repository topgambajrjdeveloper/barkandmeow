/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, MoreHorizontal, Hash, Twitter, Facebook, Copy, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PostCardProps {
  post: {
    id: string
    content: string
    imageUrl: string | null
    createdAt: string
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
  const [shareUrl, setShareUrl] = useState<string>("")
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [canUseNativeShare, setCanUseNativeShare] = useState(false)
  const sharePopoverRef = useRef<HTMLDivElement>(null)
  const [isUsingNativeShare, setIsUsingNativeShare] = useState(false)

  const isOwner = currentUserId === post.user.id

  // Efecto para manejar la hidratación y configuración inicial
  useEffect(() => {
    setIsMounted(true)

    // Configurar la URL para compartir
    const origin = window.location.origin
    setShareUrl(`${origin}/feed/${post.id}`)

    // Detectar si podemos usar la API Web Share
    setCanUseNativeShare(!!navigator.share)

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
  }, [post.createdAt, post.id])

  // Cerrar el menú de compartir al hacer clic fuera
  useEffect(() => {
    if (!isMounted) return

    const handleClickOutside = (event: MouseEvent) => {
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMounted])

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

  const handleShare = () => {
    if (isMounted && canUseNativeShare) {
      setIsUsingNativeShare(true)
    } else {
      setIsShareMenuOpen(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Enlace copiado al portapapeles")
      setIsShareMenuOpen(false)
    } catch (error) {
      toast.error("No se pudo copiar el enlace")
    }
  }

  const shareOnTwitter = () => {
    const text = post.content
      ? `${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}`
      : "Mira esta publicación"
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
    setIsShareMenuOpen(false)
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
    setIsShareMenuOpen(false)
  }

  const shareOnWhatsApp = () => {
    const text = post.content
      ? `${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}`
      : "Mira esta publicación"
    const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`
    window.open(url, "_blank")
    setIsShareMenuOpen(false)
  }

  const shareOnTelegram = () => {
    const text = post.content
      ? `${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}`
      : "Mira esta publicación"
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    setIsShareMenuOpen(false)
  }

  // Usar la API Web Share si está disponible
  const useNativeShare = useCallback(async () => {
    if (!isMounted) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Publicación de ${post.user.username}`,
          text: post.content || "Mira esta publicación",
          url: shareUrl,
        })
        toast.success("Contenido compartido")
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Error al compartir")
        }
      }
    } else {
      setIsShareMenuOpen(true)
    }
  }, [isMounted, shareUrl, post.user.username, post.content])

  useEffect(() => {
    if (isUsingNativeShare) {
      useNativeShare()
      setIsUsingNativeShare(false)
    }
  }, [isUsingNativeShare, useNativeShare])

  return (
    <Card className="border-background/1 border-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/profile/${post.user.id}`}>
              <Avatar>
                <AvatarImage src={post.user.profileImage || "/placeholder-user.jpg"} alt={post.user.username} />
                <AvatarFallback>{post.user.username[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.user.id}`} className="text-sm font-medium leading-none hover:underline">
                {post.user.username}
              </Link>
              <div className="flex items-center text-xs text-muted-foreground">
                {post.pet && (
                  <Link href={`/pets/${post.pet.id}`} className="hover:underline">
                    {post.pet.name} • {post.pet.type} •{" "}
                  </Link>
                )}
                {/* Mostrar un placeholder hasta que el tiempo se calcule en el cliente */}
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
        {post.content && <p>{post.content}</p>}

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
                <Link href={`/profile/${tagged.user.id}`} className="font-medium hover:underline">
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
                <Link href={`/pets/${tagged.pet.id}`} className="font-medium hover:underline">
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

            {/* Renderizar siempre el mismo componente para evitar errores de hidratación */}
            <Popover open={isShareMenuOpen} onOpenChange={setIsShareMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              {isMounted && (
                <PopoverContent className="w-56" ref={sharePopoverRef}>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Compartir publicación</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={shareOnTwitter}
                        title="Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={shareOnFacebook}
                        title="Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={shareOnWhatsApp}
                        title="WhatsApp"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.2.301-.767.966-.94 1.164-.173.199-.347.223-.647.075-.3-.15-1.269-.467-2.416-1.483-.893-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.462.13-.61.136-.137.301-.354.451-.531.151-.177.2-.301.3-.502.099-.2.05-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.241-.579-.486-.5-.672-.51-.172-.008-.371-.01-.571-.01-.2 0-.522.074-.796.359-.273.285-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.209 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={shareOnTelegram}
                        title="Telegram"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copiar enlace</span>
                    </Button>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

