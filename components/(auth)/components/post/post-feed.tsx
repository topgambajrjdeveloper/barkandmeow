"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import PostCard from "./post-card"
import { Loader2 } from "lucide-react"

interface Post {
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

interface PostFeedProps {
  initialPosts: Post[]
  initialNextCursor: string | null
  userId: string
}

export default function PostFeed({ initialPosts, initialNextCursor, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(!!initialNextCursor)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  // Función para cargar más publicaciones
  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/feed?cursor=${nextCursor}&limit=5`)

      if (!response.ok) {
        throw new Error("Error al cargar más publicaciones")
      }

      const data = await response.json()

      if (data.posts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.posts])
        setNextCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      }
    } catch (error) {
      console.error("Error cargando más publicaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, nextCursor])

  // Configurar el observador de intersección para detectar cuando el usuario llega al final
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMorePosts()
        }
      },
      { threshold: 0.5 },
    )

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMorePosts, hasMore, isLoading])

  // Manejar la eliminación de una publicación
  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  // Si no hay publicaciones, mostrar un mensaje
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay publicaciones para mostrar.</p>
        <p className="mt-2">¡Sigue a más usuarios o crea tu primera publicación!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
          <PostCard post={post} currentUserId={userId} onDelete={() => handlePostDelete(post.id)} />
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">No hay más publicaciones para mostrar</div>
      )}
    </div>
  )
}

