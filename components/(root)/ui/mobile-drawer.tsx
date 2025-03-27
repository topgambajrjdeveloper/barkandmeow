"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Mail, FileText, Shield, Cookie, LogOut, User, Heart, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import { useUser } from "@/contexts/UserContext"

export function MobileDrawer() {
  const { user } = useUser()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente solo se renderice en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar el drawer cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!mounted) return null

  // Determinar la imagen del perfil y el nombre para mostrar
  const profileImage = user?.image || null
  const displayName = user?.name || ""
  const userId = user?.id || ""

  // Usar un identificador de usuario basado en el ID si no hay username
  const username = userId ? userId.substring(0, 8) : ""

  // Usar valores reales cuando estén disponibles, o valores predeterminados
  const postsCount = user?.postsCount || (Array.isArray(user?.posts) ? user.posts.length : 0)
  const followersCount = user?.followersCount || (Array.isArray(user?.followers) ? user.followers.length : 0)
  const followingCount = user?.followingCount || (Array.isArray(user?.following) ? user.following.length : 0)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            width="24"
            height="24"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0" title="Menú de navegación" hideTitle={true}>
        <div className="flex flex-col h-full">
          {user ? (
            <div className="p-6 border-b">
              {/* Perfil de usuario con imagen más grande y nombre debajo */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-3">
                  <AvatarImage src={profileImage || "/placeholder-user.jpg"} alt={displayName || "Usuario"} />
                  <AvatarFallback>
                    {displayName ? displayName[0].toUpperCase() : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">@{username}</p>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <div className="text-center">
                  <p className="font-bold">{postsCount}</p>
                  <p className="text-xs text-muted-foreground">Publicaciones</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{followersCount}</p>
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">Siguiendo</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">BarkAndMeow</h2>
              <p className="text-sm text-muted-foreground mt-2">Inicia sesión para ver tu perfil y estadísticas</p>
              <div className="flex space-x-2 mt-4">
                <Button asChild className="flex-1">
                  <Link href="/login">Acceder</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-auto py-4">
            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-sm font-semibold">Navegación</h3>
              <div className="space-y-1">
                <Button asChild variant={pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Link>
                </Button>
                <Button asChild variant={pathname === "/feed" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Link href="/feed">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Feed
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/explore" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href="/explore">
                    <Search className="mr-2 h-4 w-4" />
                    Explorar
                  </Link>
                </Button>
                {user && (
                  <Button
                    asChild
                    variant={pathname === `/profile/${userId}` ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={`/profile/${userId}`}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </Button>
                )}
                {user && (
                  <Button
                    asChild
                    variant={pathname === "/pets" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href="/pets">
                      <Heart className="mr-2 h-4 w-4" />
                      Mis Mascotas
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-sm font-semibold">Información</h3>
              <div className="space-y-1">
                <Button
                  asChild
                  variant={pathname === "/contact" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contacto
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/privacy" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href="/privacy">
                    <Shield className="mr-2 h-4 w-4" />
                    Política de Privacidad
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/terms" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href="/terms">
                    <FileText className="mr-2 h-4 w-4" />
                    Términos y Condiciones
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/cookies" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href="/cookies">
                    <Cookie className="mr-2 h-4 w-4" />
                    Política de Cookies
                  </Link>
                </Button>
              </div>
            </div>
          </nav>

          {user && (
            <div className="p-4 border-t">
              <Button variant="destructive" className="w-full" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

