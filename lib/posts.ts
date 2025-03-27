import prisma from "@/lib/prismadb"

export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: true,
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return post
  } catch (error) {
    console.error("Error al obtener la publicación:", error)
    throw error
  }
}

export async function getFeedPosts(limit = 10, cursor?: string) {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: true,
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return {
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    }
  } catch (error) {
    console.error("Error al obtener publicaciones del feed:", error)
    throw error
  }
}

export async function getUserPosts(userId: string, limit = 10, cursor?: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { userId },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: true,
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return {
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    }
  } catch (error) {
    console.error("Error al obtener publicaciones del usuario:", error)
    throw error
  }
}

// Añadir esta función para validar hashtags
export function validateHashtag(tag: string): boolean {
  // Solo permitir letras, números y guiones bajos
  const validHashtagPattern = /^[a-zA-Z0-9_]+$/
  return validHashtagPattern.test(tag)
}

// Modificar la función getPostsByHashtag para usar la validación
export async function getPostsByHashtag(hashtag: string, limit = 10, cursor?: string) {
  try {
    // Validar el hashtag antes de hacer la consulta
    if (!validateHashtag(hashtag)) {
      return { posts: [], nextCursor: null }
    }

    const posts = await prisma.post.findMany({
      where: {
        hashtags: {
          some: {
            name: hashtag.toLowerCase().trim(),
          },
        },
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: true,
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return {
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    }
  } catch (error) {
    console.error("Error al obtener publicaciones por hashtag:", error)
    return { posts: [], nextCursor: null }
  }
}

// Función para verificar si un usuario ha dado like a un post
export async function hasUserLikedPost(postId: string, userId: string) {
  try {
    const like = await prisma.postLike.findFirst({
      where: {
        postId,
        userId,
      },
    })

    return !!like
  } catch (error) {
    console.error("Error al verificar like:", error)
    return false
  }
}

// Función para procesar el contenido y convertir hashtags y menciones en enlaces
export function processContent(content: string) {
  if (!content) return ""

  let processedContent = content

  // Convertir hashtags en enlaces
  processedContent = processedContent.replace(
    /#(\w+)/g,
    '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>',
  )

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

