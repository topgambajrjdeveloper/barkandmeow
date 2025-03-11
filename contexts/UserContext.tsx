"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

// Definir una interfaz para el usuario
interface User {
  id: string
  name?: string
  username?: string
  email?: string
  profileImage?: string | null
  [key: string]: any // Para permitir otras propiedades
}

interface UserContextType {
  user: User | null
  loading: boolean
  updateUser: (userData: User | null) => void
  setUser: (userData: User | null) => void // Alias para updateUser para compatibilidad
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  updateUser: () => {},
  setUser: () => {}, // Añadido para compatibilidad
  refreshUser: async () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mejorar la función fetchUser para asegurar que el ID de usuario se cargue correctamente
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
      console.log("UserContext: Session user ID:", session?.user?.id)

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
        setUserState(userData)
      } else {
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

        console.error("UserContext: Error fetching user data:", errorMessage)
        setUserState(null)
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("UserContext: Request timed out")
      } else {
        console.error("UserContext: Failed to fetch user:", error)
      }
      setUserState(null)
    } finally {
      setLoading(false)
    }
  }, [status, session?.user?.id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Función para actualizar el usuario - mantiene la API existente
  const updateUser = (userData: User | null) => {
    console.log("UserContext: Updating user data", userData)
    setUserState(userData)
  }

  // Alias para updateUser para compatibilidad con el componente LoginForm
  const setUser = updateUser

  // Mejorar la función refreshUser para asegurar que los datos se actualicen correctamente
  const refreshUser = async () => {
    console.log("Refrescando datos del usuario...")
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
        setUserState(userData)
      } else {
        console.error("Error al refrescar los datos del usuario:", response.status)
        // No establecer user a null aquí para evitar perder los datos actuales en caso de error
      }

      console.log("Datos del usuario actualizados correctamente")
    } catch (error) {
      console.error("Error al refrescar los datos del usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, updateUser, setUser, refreshUser }}>{children}</UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

