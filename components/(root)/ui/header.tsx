"use client"

import Link from "next/link"
import { PawPrint,  LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/contexts/UserContext"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function Header() {
  const { user, loading } = useUser()
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente solo se renderice en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determinar la imagen del perfil y el nombre para mostrar
  const profileImage = user?.profileImage || user?.image || null
  const displayName = user?.username || user?.name || ""
  const userId = user?.id || ""

  // Registrar información para depuración
  useEffect(() => {
    if (user) {
      console.log("Header: Usuario cargado", {
        id: userId,
        name: displayName,
        profileImage: profileImage,
      })
    }
  }, [user, userId, displayName, profileImage])

  const menuItems = [
    { href: "/feed", label: "Feed" },
    { href: "/explore", label: "Explorar" },
    // { href: "/messages", label: "Mensajes" },
  ]

  // No renderizar nada durante SSR para evitar errores de hidratación
  if (!mounted) return null

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-custom mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Link href={user ? "/feed" : "/"} className="flex">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="text-xl">BarkAndMeow</span>
            </Link>
          </div>

          {!loading && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                {user &&
                  menuItems.map((item) => (
                    <Link key={item.href} href={item.href} className="text-sm font-medium">
                      {item.label}
                    </Link>
                  ))}
              </nav>

              {/* Mobile Navigation */}
              {/* <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-4 mt-8">
                      {user &&
                        menuItems.map((item) => (
                          <Link key={item.href} href={item.href} className="text-sm font-medium">
                            {item.label}
                          </Link>
                        ))}
                      {user && (
                        <Button variant="ghost" onClick={() => signOut()}>
                          Cerrar sesión
                        </Button>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div> */}

              <div className="flex items-center space-x-2">
                <ThemeToggle />
                {user ? (
                  <>
                    <Link href={`/profile/${userId}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profileImage || "/placeholder-user.jpg"} alt={displayName || "Usuario"} />
                        <AvatarFallback>
                          {displayName ? displayName[0].toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </>
                ) : (
                  <div className="space-x-2">
                    <Link href="/login" className="text-sm font-medium">
                      Acceder
                    </Link>
                    <Link href="/register" className="text-sm font-medium">
                      Registrarse
                    </Link>
                  </div>
                )}
                {user && (
                  <Button variant="ghost" onClick={() => signOut()} className="hidden md:inline-flex">
                    <LogOut />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

