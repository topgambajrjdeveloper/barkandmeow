"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/lib/followerNumber";
import type { Follower, Friend, Pet, UserProfile } from "@/types";
import { signOut } from "next-auth/react";
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = params.id || "me";
        const response = await fetch(`/api/user/profile/${userId}`);

        if (response.ok) {
          const data = await response.json();
          console.log("Profile data:", data);
          setProfile(data);
          setIsFollowing(data.isFollowing);
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to fetch profile. Status:",
            response.status,
            "Error:",
            errorText
          );
          toast.error("Error al cargar el perfil");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchProfile();
    }
  }, [params.id, loading]);

  const handleFollow = async () => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: profile?.id, type: "user" }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followersCount: isFollowing
                  ? prev.followersCount - 1
                  : prev.followersCount + 1,
                isFollowing: !isFollowing,
              }
            : null
        );
        toast.success(
          isFollowing ? "Usuario dejado de seguir" : "Usuario seguido"
        );
      } else {
        toast.error("Error al realizar la acción de seguir");
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
      toast.error("Error al realizar la acción de seguir");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  if (loading || isLoading) {
    return <div>Cargando perfil...</div>;
  }

  if (!profile) {
    return <div>No se pudo cargar el perfil.</div>;
  }

  const isOwnProfile = user?.id === profile.id;
  
  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <section className="flex-1">
        <div className="container py-8">
          {/* Encabezado del perfil de usuario */}
          <div className="mb-8 flex flex-col items-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={
                  profile.profileImage ||
                  "/placeholder.svg?height=128&width=128"
                }
                alt="Foto de perfil"
              />
              <AvatarFallback>{profile.username[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                <div>
                  <p className="text-lg font-semibold">
                    {formatNumber(profile.postsCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {formatNumber(profile.followersCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {formatNumber(profile.followingCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {profile?.bio} - Dueño de {profile.petName}
              </p>
              <div className="flex justify-center gap-2 sm:justify-start">
                {isOwnProfile ? (
                  <>
                    <Link href={`/profile/edit`}>
                      <Button>Editar perfil</Button>
                    </Link>
                    <Link href="/pets/add">
                      <Button variant="outline">Añadir mascota</Button>
                    </Link>
                    {/* Botón de cerrar sesión solo visible en móvil y cuando es el propio perfil */}
                    {isMobile && (
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Salir</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button onClick={handleFollow}>
                      {isFollowing ? "Dejar de seguir" : "Seguir"}
                    </Button>
                    {profile.isFollowing && (
                      <span className="text-sm text-muted-foreground items-center">
                        Te sigue
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <Tabs defaultValue="pets" className="w-full">
            <div className="overflow-x-auto pb-3 mb-3 scrollbar-hide">
              <TabsList className="lg:w-full md:w-max inline-flex">
                <TabsTrigger value="pets">Mis mascotas</TabsTrigger>
                <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                <TabsTrigger value="friends">Amigos</TabsTrigger>
                <TabsTrigger value="followers">Seguidores</TabsTrigger>
                <TabsTrigger value="following">Siguiendo</TabsTrigger>
              </TabsList>
            </div>

            {/* Pets Tab */}
            <TabsContent value="pets" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.pets && profile.pets.length > 0 ? (
                  profile.pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
                ) : (
                  <p>No hay mascotas para mostrar.</p>
                )}
                {isOwnProfile && (
                  <Card className="flex items-center justify-center">
                    <Link href="/pets/add">
                      <Button>Añadir Mascota</Button>
                    </Link>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Aquí puedes mapear las publicaciones del usuario si las tienes disponibles */}
                <PostCard
                  content="Contenido de ejemplo"
                  image="/placeholder.svg?height=400&width=600"
                  likes={0}
                  comments={0}
                  timeAgo="Hace un momento"
                />
              </div>
            </TabsContent>

            {/* Friends Tab */}
            <TabsContent value="friends" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.friends && profile.friends.length > 0 ? (
                  profile.friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))
                ) : (
                  <p>No hay amigos para mostrar.</p>
                )}
              </div>
            </TabsContent>

            {/* Followers Tab */}
            <TabsContent value="followers" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.followers && profile.followers.length > 0 ? (
                  profile.followers.map((follower) => (
                    <FollowerCard key={follower.id} follower={follower} />
                  ))
                ) : (
                  <p>No hay seguidores para mostrar.</p>
                )}
              </div>
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profile.following && profile.following.length > 0 ? (
                  profile.following.map((following) => (
                    <FollowerCard key={following.id} follower={following} />
                  ))
                ) : (
                  <p>No estás siguiendo a nadie aún.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  return (
    <Card>
      <CardHeader className="p-0">
        <Image
          priority
          src={pet.image || "/placeholder.svg?height=300&width=300"}
          alt={pet.name}
          width={350}
          height={200}
          className="rounded-lg "
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle>{pet.name}</CardTitle>
        <CardDescription>
          {pet.type} • {pet.breed} •{" "}
          {pet.age ? `${pet.age} años` : "Edad no disponible"}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/pets/${pet.id}`}>
          <Button variant="outline" className="w-full">
            Ver perfil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function PostCard({
  content,
  image,
  likes,
  comments,
  timeAgo,
}: {
  content: string;
  image: string;
  likes: number;
  comments: number;
  timeAgo: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-sm text-muted-foreground">{timeAgo}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{content}</p>
        <Image
          src={image || "/placeholder.svg"}
          alt="Publicación"
          width={600}
          height={400}
          className="rounded-md object-cover w-full"
        />
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full items-center">
          <Button variant="ghost" size="sm" className="gap-1">
            <Heart className="h-4 w-4" />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={friend.profileImage || "/placeholder.svg?height=48&width=48"}
              alt={friend.username}
            />
            <AvatarFallback>{friend.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{friend.username}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Link href={`/profile/${friend.id}`}>
          <Button variant="outline" className="w-full">
            Ver perfil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function FollowerCard({ follower }: { follower: Follower }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={
                follower.profileImage || "/placeholder.svg?height=48&width=48"
              }
              alt={follower.username}
            />
            <AvatarFallback>{follower.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{follower.username}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Link href={`/profile/${follower.id}`}>
          <Button variant="outline" className="w-full">
            Ver perfil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
