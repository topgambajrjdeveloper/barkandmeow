/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useSession } from "next-auth/react"

// Define the User type
export type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null // Añadimos el campo role para identificar administradores
  // Add other user properties here as needed
}

// Define the UserContext type
type UserContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

// Create the UserContext
const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  refreshUser: async () => {},
})

// Create the UserProvider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchUser = useCallback(async () => {
    // Si no hay sesión, no intentar cargar el usuario
    if (status === "unauthenticated") {
      setUserState(null)
      setLoading(false)
      return
    }

    // Si todavía estamos cargando la sesión, esperar pero con un timeout
    if (status === "loading") {
      // Establecer un timeout para evitar que se quede cargando indefinidamente
      setTimeout(() => {
        if (status === "loading") {
          console.log("UserContext: Session loading timeout, setting loading to false")
          setLoading(false)
        }
      }, 3000) // 3 segundos máximo esperando la sesión
      return
    }

    try {
      setLoading(true)
      console.log("UserContext: Fetching user data, session status:", status)

      // Verificar si tenemos un ID de usuario antes de hacer la solicitud
      if (!session?.user?.id) {
        console.log("UserContext: No user ID available, skipping fetch")
        setLoading(false)
        return
      }

      console.log("UserContext: Session user ID:", session.user.id)

      // Añadir un timestamp para evitar caché
      const timestamp = new Date().getTime()
      console.log("UserContext: Making request to /api/user/me")

      // Establecer un timeout para la solicitud
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

      const response = await fetch(`/api/user/me?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("UserContext: Response status:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("UserContext: User data received successfully", userData)
        // Asegurarse de que el ID del usuario esté presente y sea correcto
        if (userData && !userData.id && session?.user?.id) {
          userData.id = session.user.id
          console.log("UserContext: Added missing user ID from session", userData)
        }

        // Asegurarse de que el rol del usuario esté presente
        if (userData && !userData.role && session?.user?.role) {
          userData.role = session.user.role
          console.log("UserContext: Added missing user role from session", userData)
        }

        setUserState(userData)
      } else {
        // Si la API falla, intentar usar los datos de la sesión directamente
        if (session?.user) {
          const sessionUser: User = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: (session.user as any).role || null, // Obtener el rol de la sesión
          }
          console.log("UserContext: Using session data as fallback", sessionUser)
          setUserState(sessionUser)
          setLoading(false)
          return
        }

        // Intentar obtener más información sobre el error
        let errorMessage = `Error ${response.status}`
        try {
          const errorData = await response.json()
          console.log("UserContext: Error data:", errorData)
          if (errorData && errorData.error) {
            errorMessage += `: ${errorData.error}`
          }
        } catch (parseError) {
          console.log("UserContext: Could not parse error as JSON, trying as text")
          // Si no podemos analizar como JSON, intentar como texto
          try {
            const errorText = await response.text()
            console.log("UserContext: Error text:", errorText)
            if (errorText) {
              errorMessage += `: ${errorText.substring(0, 100)}...`
            }
          } catch (textError) {
            console.log("UserContext: Could not get error text either")
            // Si todo falla, solo usamos el código de estado
          }
        }

        // Solo mostrar error en consola si no es un error 401 (no autenticado)
        if (response.status !== 401) {
          console.error("UserContext: Error fetching user data:", errorMessage)
        } else {
          console.log("UserContext: User not authenticated, skipping error")
        }
        setUserState(null)
      }
    } catch (error) {
      // Si hay un error en la solicitud, intentar usar los datos de la sesión directamente
      if (session?.user) {
        const sessionUser: User = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as any).role || null, // Obtener el rol de la sesión
        }
        console.log("UserContext: Using session data as fallback after error", sessionUser)
        setUserState(sessionUser)
        setLoading(false)
        return
      }

      if (error.name === "AbortError") {
        console.log("UserContext: Request timed out")
      } else {
        // Usar console.log en lugar de console.error para errores esperados
        console.log("UserContext: Failed to fetch user:", error)
      }
      setUserState(null)
    } finally {
      setLoading(false)
    }
  }, [status, session?.user])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const refreshUser = async () => {
    console.log("Refrescando datos del usuario...")

    // Verificar si tenemos un ID de usuario antes de hacer la solicitud
    if (!session?.user?.id) {
      console.log("UserContext: No user ID available, skipping refresh")
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Añadir un timestamp para evitar caché
      const timestamp = new Date().getTime()

      const response = await fetch(`/api/user/me?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("Datos actualizados del usuario:", userData)

        // Asegurarse de que el rol del usuario esté presente
        if (userData && !userData.role && session?.user?.role) {
          userData.role = session.user.role
          console.log("UserContext: Added missing user role from session during refresh", userData)
        }

        setUserState(userData)
      } else {
        // Solo mostrar error en consola si no es un error 401 (no autenticado)
        if (response.status !== 401) {
          console.log("Error al refrescar los datos del usuario:", response.status)
        }
        // No establecer user a null aquí para evitar perder los datos actuales en caso de error
      }

      console.log("Datos del usuario actualizados correctamente")
    } catch (error) {
      // Usar console.log en lugar de console.error
      console.log("Error al refrescar los datos del usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  return <UserContext.Provider value={{ user, loading, refreshUser }}>{children}</UserContext.Provider>
}

// Create a custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

