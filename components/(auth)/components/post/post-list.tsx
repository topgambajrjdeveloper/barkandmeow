import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { HeartIcon, MessageCircleIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  username: string
  profileImage: string | null
}

interface Pet {
  id: string
  name: string
  image: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: User
}

interface Like {
  id: string
  userId: string
}

interface Post {
  id: string
  content: string
  image?: string | null
  createdAt: Date
  user: User
  pet?: Pet | null
  likes: Like[]
  comments: Comment[]
}

interface PostListProps {
  posts: Post[]
  currentUserId: string
}

// Función para convertir hashtags y menciones en enlaces
function processContent(content: string) {
  // Convertir hashtags en enlaces
  const withHashtags = content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>')

  // Convertir menciones de usuario en enlaces
  const withUserMentions = withHashtags.replace(
    /@(\w+)/g,
    '<a href="/user/$1" class="text-blue-500 hover:underline">@$1</a>',
  )

  // Convertir menciones de mascotas en enlaces (asumiendo que tienen un formato como @pet:id)
  const withPetMentions = withUserMentions.replace(
    /@pet:(\w+)/g,
    '<a href="/pet/$1" class="text-blue-500 hover:underline">@pet:$1</a>',
  )

  return withPetMentions
}

export default function PostList({ posts, currentUserId }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex items-start gap-3">
            <Link href={`/user/${post.user.username}`}>
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={post.user.profileImage || "/placeholder.svg?height=40&width=40"}
                  alt={post.user.username}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/user/${post.user.username}`} className="font-medium hover:underline">
                  @{post.user.username}
                </Link>

                {post.pet && (
                  <>
                    <span className="text-gray-500">•</span>
                    <Link
                      href={`/pet/${post.pet.id}`}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
                    >
                      <div className="relative h-5 w-5 rounded-full overflow-hidden">
                        <Image
                          src={post.pet.image || "/placeholder.svg?height=20&width=20"}
                          alt={post.pet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{post.pet.name}</span>
                    </Link>
                  </>
                )}

                <span className="text-gray-500 text-sm ml-auto">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>

              <div
                className="mt-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
              />

              {post.image && (
                <div className="mt-3 relative rounded-lg overflow-hidden h-64 w-full">
                  <Image src={post.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    post.likes.some((like) => like.userId === currentUserId) ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  <HeartIcon size={18} />
                  <span>{post.likes.length}</span>
                </Button>

                <Link href={`/post/${post.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
                    <MessageCircleIcon size={18} />
                    <span>{post.comments.length}</span>
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
                  <ShareIcon size={18} />
                </Button>
              </div>

              {post.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <Link href={`/post/${post.id}`} className="text-sm text-gray-500 hover:underline">
                    Ver {post.comments.length} {post.comments.length === 1 ? "comentario" : "comentarios"}
                  </Link>

                  {post.comments.length === 1 && (
                    <div className="mt-2 flex items-start gap-2">
                      <Link href={`/user/${post.comments[0].user.username}`}>
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={post.comments[0].user.profileImage || "/placeholder.svg?height=32&width=32"}
                            alt={post.comments[0].user.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 bg-gray-50 p-2 rounded-lg">
                        <Link href={`/user/${post.comments[0].user.username}`} className="font-medium hover:underline">
                          @{post.comments[0].user.username}
                        </Link>
                        <p className="text-sm">{post.comments[0].content}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

