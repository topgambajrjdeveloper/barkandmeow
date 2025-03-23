import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/(admin)/admin-sidebar"
import { auth } from "@/auth"

export const metadata = {
  title: "Panel de Administración | BarkAndMeow",
  description: "Portal de administración para gestionar BarkAndMeow",
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Verificar si el usuario está autenticado y es administrador
  const session = await auth()

  if (!session || session?.user?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-auto">{children}</div>
    </div>
  )
}

