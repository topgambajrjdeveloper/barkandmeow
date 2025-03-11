import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getPostById } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PostCard from "@/components/(auth)/components/post/post-card";
import CommentForm from "@/components/(auth)/components/post/comment-form";
import CommentList from "@/components/(auth)/components/post/comment-list";

const prisma = new PrismaClient();

// Define the correct type for the page props
type PageProps = {
  params: {
    id: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function PostPage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;
  // Fix: Don't await params, it's not a Promise
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    redirect("/feed");
  }

  // Verificar si el usuario ha dado like a la publicación
  const like = await prisma.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: post.id,
      },
    },
  });

  const postWithLikeStatus = {
    ...post,
    hasLiked: !!like,
  };

  // Obtener el usuario actual para el formulario de comentarios
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-6">
        <Link href="/feed">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al feed
          </Button>
        </Link>
      </div>

      <div className="space-y-8 sm:max-w-[500px] mx-auto md:max-w-none">
        <PostCard
          post={postWithLikeStatus}
          currentUserId={userId}
          showActions={true}
        />

        <div className="bg-card border rounded-lg p-6">
          <CommentForm postId={post.id} user={user!} />

          <div className="mt-8">
            <CommentList postId={post.id} initialComments={post.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
