"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { EnableNotifications } from "@/components/(auth)/components/notifications/enable-notifications"
import { useUser } from "@/contexts/UserContext"

export default function NotificationsSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useUser()
  const [settings, setSettings] = useState({
    emailVaccinationReminders: true,
    pushVaccinationReminders: true,
    emailHealthUpdates: true,
    pushHealthUpdates: true,
    emailSocialActivity: false,
    pushSocialActivity: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la configuración")
      }

      toast.success("Configuración guardada correctamente")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Error al enviar la notificación de prueba")
      }

      toast.success("Notificación de prueba enviada")
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast.error("Error al enviar la notificación de prueba")
    }
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Configuración de notificaciones</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notificaciones del navegador</CardTitle>
          <CardDescription>
            Recibe notificaciones en este dispositivo cuando el navegador esté abierto o en segundo plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnableNotifications />

          <div className="mt-4">
            <Button variant="outline" onClick={sendTestNotification}>
              Enviar notificación de prueba
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recordatorios de vacunación</CardTitle>
          <CardDescription>
            Recibe alertas cuando se acerque la fecha de la próxima vacunación de tus mascotas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailVaccinationReminders" className="flex-1">
              Recordatorios por correo electrónico
            </Label>
            <Switch
              id="emailVaccinationReminders"
              checked={settings.emailVaccinationReminders}
              onCheckedChange={() => handleToggle("emailVaccinationReminders")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pushVaccinationReminders" className="flex-1">
              Notificaciones push
            </Label>
            <Switch
              id="pushVaccinationReminders"
              checked={settings.pushVaccinationReminders}
              onCheckedChange={() => handleToggle("pushVaccinationReminders")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actualizaciones de salud</CardTitle>
          <CardDescription>
            Recibe notificaciones sobre actualizaciones en la cartilla sanitaria de tus mascotas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailHealthUpdates" className="flex-1">
              Actualizaciones por correo electrónico
            </Label>
            <Switch
              id="emailHealthUpdates"
              checked={settings.emailHealthUpdates}
              onCheckedChange={() => handleToggle("emailHealthUpdates")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pushHealthUpdates" className="flex-1">
              Notificaciones push
            </Label>
            <Switch
              id="pushHealthUpdates"
              checked={settings.pushHealthUpdates}
              onCheckedChange={() => handleToggle("pushHealthUpdates")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  )
}

