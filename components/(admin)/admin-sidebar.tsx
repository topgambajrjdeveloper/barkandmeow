"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  PawPrint,
  FileText,
  Settings,
  Bell,
  BarChart,
  Menu,
  LogOut,
  MessageSquare,
  Calendar,
  Map,
  Heart,
  Stethoscope,
  StampIcon as Passport,
  Store,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
    submenu?: {
      href: string
      title: string
    }[]
  }[]
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      href: "/admin",
      title: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/events",
      title: "Eventos",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/users",
      title: "Usuarios",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/team",
      title: "Equipo",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/pets",
      title: "Mascotas",
      icon: <PawPrint className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/services",
      title: "Servicios",
      icon: <Store className="mr-2 h-4 w-4" />,
      submenu: [
        {
          href: "/admin/services",
          title: "Todos los servicios",
        },
        {
          href: "/admin/services?tab=vets",
          title: "Veterinarias",
        },
        {
          href: "/admin/services?tab=shops",
          title: "Tiendas",
        },
        {
          href: "/admin/services?tab=pet-friendly",
          title: "Pet-Friendly",
        },
      ],
    },
    {
      href: "/admin/health",
      title: "Salud",
      icon: <Stethoscope className="mr-2 h-4 w-4" />,
      submenu: [
        {
          href: "/admin/health/cards",
          title: "Tarjetas de Salud",
        },
        {
          href: "/admin/health/vaccinations",
          title: "Vacunaciones",
        },
        {
          href: "/admin/health/medications",
          title: "Medicamentos",
        },
      ],
    },
    {
      href: "/admin/passports",
      title: "Pasaportes",
      icon: <Passport className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/posts",
      title: "Publicaciones",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/follows",
      title: "Seguidores",
      icon: <Heart className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/pages",
      title: "Páginas",
      icon: <FileText className="mr-2 h-4 w-4" />,
      submenu: [
        {
          href: "/admin/pages/about",
          title: "Acerca de",
        },
        {
          href: "/admin/pages/politica-cookies",
          title: "Política de Cookies",
        },
        {
          href: "/admin/pages/privacy",
          title: "Privacidad",
        },
        {
          href: "/admin/pages/terms",
          title: "Términos",
        },
      ],
    },
    {
      href: "/admin/messages",
      title: "Mensajes",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/locations",
      title: "Ubicaciones",
      icon: <Map className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/analytics",
      title: "Analíticas",
      icon: <BarChart className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/notifications",
      title: "Notificaciones",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      title: "Configuración",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="absolute left-4 top-4">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">BarkAndMeow Admin</h2>
            </div>
            <ScrollArea className="flex-1">
              <SidebarNav items={navItems} className="p-2" />
            </ScrollArea>
            <div className="p-4 border-t">
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:flex lg:flex-col h-screen w-64 border-r bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">BarkAndMeow Admin</h2>
        </div>
        <ScrollArea className="flex-1">
          <SidebarNav items={navItems} className="p-2" />
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  )
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href)
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.href
        const hasSubmenu = item.submenu && item.submenu.length > 0
        const isSubmenuOpen = openSubmenu === item.href

        return (
          <div key={item.href} className="flex flex-col">
            {hasSubmenu ? (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="justify-between"
                onClick={() => toggleSubmenu(item.href)}
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.title}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("h-4 w-4 transition-transform", isSubmenuOpen ? "rotate-180" : "")}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Button>
            ) : (
              <Button variant={isActive ? "secondary" : "ghost"} className="justify-start" asChild>
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            )}

            {hasSubmenu && isSubmenuOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                {item.submenu?.map((subitem) => {
                  const isSubActive = pathname === subitem.href
                  return (
                    <Button
                      key={subitem.href}
                      variant={isSubActive ? "secondary" : "ghost"}
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <Link href={subitem.href}>{subitem.title}</Link>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

