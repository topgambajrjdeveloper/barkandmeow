import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

export async function getPostsByHashtag(hashtag: string, limit = 10, cursor?: string) {
  try {
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
    throw error
  }
}

