/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    profileImage: string | null
  }
}

interface CommentListProps {
  postId: string
  initialComments: Comment[]
}

export default function CommentList({ postId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [timeAgo, setTimeAgo] = useState<Record<string, string>>({})

  // Calcular el tiempo relativo para cada comentario solo en el cliente
  useEffect(() => {
    const newTimeAgo: Record<string, string> = {}

    comments.forEach((comment) => {
      newTimeAgo[comment.id] = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: es,
      })
    })

    setTimeAgo(newTimeAgo)

    // Actualizar cada minuto
    const interval = setInterval(() => {
      const updatedTimeAgo: Record<string, string> = {}

      comments.forEach((comment) => {
        updatedTimeAgo[comment.id] = formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
          locale: es,
        })
      })

      setTimeAgo(updatedTimeAgo)
    }, 60000)

    return () => clearInterval(interval)
  }, [comments])

  const loadMoreComments = async () => {
    if (isLoading || !nextCursor) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments?cursor=${nextCursor}`)

      if (!response.ok) {
        throw new Error("Error al cargar más comentarios")
      }

      const data = await response.json()
      setComments((prev) => [...prev, ...data.comments])
      setNextCursor(data.nextCursor)
    } catch (error) {
      toast.error("No se pudieron cargar más comentarios")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para añadir un nuevo comentario a la lista
  const addComment = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev])
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comentarios ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No hay comentarios aún. ¡Sé el primero en comentar!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Link href={`/profile/${comment.user.id}`}>
                <Avatar>
                  <AvatarImage src={comment.user.profileImage || "/placeholder-user.jpg"} alt={comment.user.username} />
                  <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/profile/${comment.user.id}`} className="font-medium hover:underline">
                      {comment.user.username}
                    </Link>
                    <span className="text-xs text-muted-foreground">{timeAgo[comment.id] || "..."}</span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {nextCursor && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMoreComments} disabled={isLoading}>
                {isLoading ? "Cargando..." : "Cargar más comentarios"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

