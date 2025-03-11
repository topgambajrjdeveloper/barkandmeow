"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Info } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VaccinationReminderInfoProps {
  petId: string
  petName: string
  hasUpcomingVaccinations: boolean
}

export function VaccinationReminderInfo({ petId, petName, hasUpcomingVaccinations }: VaccinationReminderInfoProps) {
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const toggleReminders = async () => {
    setIsLoading(true)
    try {
      // Aquí se implementaría la lógica para activar/desactivar recordatorios específicos para esta mascota
      const response = await fetch(`/api/pets/${petId}/vaccination-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !remindersEnabled }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar las preferencias de recordatorio")
      }

      setRemindersEnabled(!remindersEnabled)
      toast.success(
        remindersEnabled ? "Recordatorios desactivados para esta mascota" : "Recordatorios activados para esta mascota",
      )
    } catch (error) {
      console.error("Error toggling reminders:", error)
      toast.error("Error al actualizar las preferencias de recordatorio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Recordatorios de vacunación
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Recibirás notificaciones cuando se acerque la fecha de la próxima vacunación. Los recordatorios se
                    envían 30, 15, 7, 3 y 1 día antes de la fecha programada.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReminders}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {remindersEnabled ? (
              <>
                <BellOff className="h-4 w-4" />
                <span>Desactivar</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Activar</span>
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          {remindersEnabled
            ? `Recibirás recordatorios para las vacunas de ${petName}`
            : `No recibirás recordatorios para las vacunas de ${petName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {hasUpcomingVaccinations ? (
            <p>
              {petName} tiene vacunas programadas próximamente.{" "}
              {remindersEnabled
                ? "Recibirás recordatorios cuando se acerquen las fechas."
                : "Activa los recordatorios para recibir alertas."}
            </p>
          ) : (
            <p>
              {petName} no tiene vacunas programadas próximamente.{" "}
              {remindersEnabled && "Recibirás recordatorios cuando agregues nuevas vacunas."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

