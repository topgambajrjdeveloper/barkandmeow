"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentFormProps {
  postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: comment,
        }),
      })

      if (response.ok) {
        setComment("")
        router.refresh()
      } else {
        console.error("Error al publicar comentario")
      }
    } catch (error) {
      console.error("Error al publicar comentario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Escribe un comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!comment.trim() || isSubmitting}>
          {isSubmitting ? "Publicando..." : "Publicar comentario"}
        </Button>
      </div>
    </form>
  )
}

