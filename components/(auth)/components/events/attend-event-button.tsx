"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AttendEventButtonProps {
  eventId: string
  isAttending: boolean
}

export function AttendEventButton({ eventId, isAttending: initialIsAttending }: AttendEventButtonProps) {
  const [isAttending, setIsAttending] = useState(initialIsAttending)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAttendClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/attend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al procesar la solicitud")
      }

      const data = await response.json()
      setIsAttending(data.attending)

      toast.success(data.attending ? "¡Te has unido al evento!" : "Has cancelado tu asistencia al evento")

      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Ocurrió un error. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAttendClick}
      disabled={isLoading}
      variant={isAttending ? "outline" : "default"}
      className="w-full"
    >
      {isAttending ? (
        <>
          <X className="mr-2 h-4 w-4" />
          Cancelar asistencia
        </>
      ) : (
        <>
          <Calendar className="mr-2 h-4 w-4" />
          Asistir al evento
        </>
      )}
    </Button>
  )
}

