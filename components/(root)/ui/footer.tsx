"use client"

import Link from "next/link"
import { useUser } from "@/contexts/UserContext"

export default function Footer() {
  const { user } = useUser()

  if (user) return null

  return (
    <footer className="bg-background border-t md:hidden">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-wrap justify-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            Acerca de
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Política de Privacidad
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Términos y Condiciones
          </Link>
        </nav>
      </div>
    </footer>
  )
}

