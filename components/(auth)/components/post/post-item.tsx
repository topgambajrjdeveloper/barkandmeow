import type React from "react"

interface Post {
  id: string
  content: string
  createdAt: Date
  userId: string
}

interface PostItemProps {
  post: Post
}

// Función para convertir hashtags y menciones en enlaces
function processContent(content: string) {
  // Convertir hashtags en enlaces
  const withHashtags = content.replace(
    /#(\w+)/g,
    '<a href="/hashtag/$1" className="text-blue-500 hover:underline">#$1</a>',
  )

  // Convertir menciones de usuario en enlaces
  const withUserMentions = withHashtags.replace(
    /@(\w+)/g,
    '<a href="/user/$1" className="text-blue-500 hover:underline">@$1</a>',
  )

  // Convertir menciones de mascotas en enlaces (asumiendo que tienen un formato como @pet:id)
  const withPetMentions = withUserMentions.replace(
    /@pet:(\w+)/g,
    '<a href="/pet/$1" className="text-blue-500 hover:underline">@pet:$1</a>',
  )

  return withPetMentions
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold">Post</h3>
      <p className="text-gray-500">Created at: {post.createdAt.toString()}</p>
      <div className="mt-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
    </div>
  )
}

export default PostItem

