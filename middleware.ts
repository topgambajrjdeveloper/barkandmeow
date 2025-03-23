import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Obtener el token de autenticación
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })

  const isAuthenticated = !!token

  // Rutas que requieren autenticación
  const authRoutes = ["/feed", "/profile", "/pets", "/explore", "/discover", "/admin"]

  // Rutas que requieren ser el propio usuario (no se puede acceder al perfil de otro)
  const selfOnlyRoutes = ["/profile/edit"]

  // Rutas que requieren ser administrador
  const adminRoutes = ["/admin"]

  // Verificar si la ruta actual requiere autenticación
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Verificar si la ruta actual es una ruta de "solo propio usuario"
  const isSelfOnlyRoute = selfOnlyRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Verificar si la ruta actual es una ruta de administrador
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (isAuthRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si la ruta es de administrador, verificar que el usuario tenga rol de administrador
  if (isAdminRoute && (!token || token.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si la ruta es de "solo propio usuario", verificar que el usuario esté autenticado
  if (isSelfOnlyRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si el usuario está en la página principal y está autenticado
  if (request.nextUrl.pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  return NextResponse.next()
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    "/",
    "/feed",
    "/profile/:path*",
    "/pets/:path*",
    "/explore",
    "/discover",
    "/login",
    "/register",
    "/admin/:path*",
  ],
}

