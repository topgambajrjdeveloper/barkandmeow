import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prismadb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getFeedPosts } from "@/lib/posts";
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation";
import CreatePost from "@/components/(auth)/components/post/create-post";

import { Suspense } from "react";
import PostFeed from "@/components/(auth)/components/post/post-feed";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { EventsCard } from "@/components/(auth)/components/events/events-card";

async function getPopularPets() {
  const pets = await prisma.pet.findMany({
    include: {
      _count: {
        select: { followers: true },
      },
    },
  });

  // Sort pets by follower count and take the top 5
  const popularPets = pets
    .sort((a, b) => b._count.followers - a._count.followers)
    .slice(0, 5);

  return popularPets;
}

async function getUserWithPets(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profileImage: true,
      pets: {
        select: {
          id: true,
          name: true,
          type: true,
          image: true,
        },
      },
    },
  });

  return user;
}

export default async function Feed() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;

  // Add a check to ensure userId is defined
  if (!userId) {
    redirect("/login"); // Redirect if userId is undefined
  }

  const popularPets = await getPopularPets();
  const initialPostsData = await getFeedPosts(5); // Cargar solo los primeros 5 posts inicialmente
  const user = await getUserWithPets(userId);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-screen-sm mx-auto md:max-w-none md:mx-0 pb-20 md:pb-0">
      <div className="md:col-span-2 space-y-6">
        {/* Ocultar CreatePost en dispositivos móviles */}
        <div className="hidden md:block">
          <CreatePost user={user!} userPets={user?.pets || []} />
        </div>

        <Suspense
          fallback={<div className="space-y-6">Cargando publicaciones...</div>}
        >
          <PostFeed
            initialPosts={initialPostsData.posts}
            initialNextCursor={initialPostsData.nextCursor}
            userId={userId}
          />
        </Suspense>
      </div>
      <div className="hidden md:block space-y-6">
        <PopularPetsCard pets={popularPets} />
        <EventsCard />
        <PagesCard />
      </div>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  );
}

function PopularPetsCard({ pets }: { pets: any[] }) {
  return (
    <Card className="border-background/1 border-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Mascotas populares</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {pets.map((pet) => (
          <PetSuggestion
            key={pet.id}
            name={pet.name}
            type={pet.type}
            image={pet.image || "/placeholder.svg?height=40&width=40"}
            followers={pet._count.followers}
          />
        ))}
      </CardContent>
      <CardFooter>
        <Link href="/explore" className="text-sm text-primary">
          Ver más mascotas
        </Link>
      </CardFooter>
    </Card>
  );
}

function PagesCard() {
  return (
    <Card className="border-background/1 border-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Páginas Importantes</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Link href={"/contact"} className="text-sm text-primary">
            <h4 className="font-medium">Contactar</h4>
          </Link>
        </div>
        <div>
          <Link href={"/about"} className="text-sm text-primary">
            <h4 className="font-medium">Sobre Nosotros</h4>
          </Link>
        </div>
        <div>
          <Link href={"/privacy"} className="text-sm text-primary">
            <h4 className="font-medium">Política de Privacidad</h4>
          </Link>
        </div>
        <div>
          <Link href={"/cookies"} className="text-sm text-primary">
            <h4 className="font-medium">Cookies</h4>
          </Link>
        </div>
        <div>
          <Link href={"/terms"} className="text-sm text-primary">
            <h4 className="font-medium">Términos y Condiciones</h4>
          </Link>
        </div>
        <div>
          <Link href={"/sitemap.xml"} className="text-sm text-primary">
            <h4 className="font-medium">Sitemap</h4>
          </Link>
        </div>
        <div className="text-center text-lg font-semibold">
          Nuestras redes sociales
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="https://www.facebook.com/" target="_blank">
            {" "}
            <Facebook className="h-6 w-6 text-sm text-primary" />{" "}
          </Link>
          <Link href="https://www.threads.net/@barkandmeow.app" target="_blank">
            <svg
              aria-label="Threads"
              className="h-6 w-6 text-sm text-primary"
              fill="currentColor"
              role="img"
              viewBox="0 0 192 192"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"></path>
            </svg>
          </Link>
          <Link href="https://x.com/BarkandmeowApp" target="_blank">
            {" "}
            <Twitter className="h-6 w-6 text-sm text-primary" />{" "}
          </Link>
          <Link
            href="https://www.instagram.com/barkandmeow.app/"
            target="_blank"
          >
            {" "}
            <Instagram className="h-6 w-6 text-sm text-primary" />{" "}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PetSuggestion({
  name,
  type,
  image,
  followers,
}: {
  name: string;
  type: string;
  image: string;
  followers: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Seguir
      </Button>
    </div>
  );
}
