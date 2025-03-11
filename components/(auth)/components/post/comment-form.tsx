/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CommentFormProps {
  postId: string
  user: {
    id: string
    username: string
    profileImage?: string | null
  }
  onCommentAdded?: (comment: any) => void
}

export default function CommentForm({ postId, user, onCommentAdded }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("El comentario no puede estar vacío")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al publicar el comentario")
      }

      const result = await response.json()

      // Limpiar el formulario
      setContent("")

      // Notificar que se ha añadido un comentario
      if (onCommentAdded) {
        onCommentAdded(result.comment)
      }

      // Actualizar la UI
      router.refresh()

      toast.success("Comentario publicado")
    } catch (error) {
      console.error("Error al publicar el comentario:", error)
      toast.error(error instanceof Error ? error.message : "Error al publicar el comentario")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex space-x-4">
      <Avatar>
        <AvatarImage src={user.profileImage || "/placeholder-user.jpg"} alt={user.username} />
        <AvatarFallback>{user.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Publicando..." : "Comentar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

