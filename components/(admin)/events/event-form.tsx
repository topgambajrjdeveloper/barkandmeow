"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Esquema de validación para el formulario
const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres",
  }),
  location: z.string().min(3, {
    message: "La ubicación debe tener al menos 3 caracteres",
  }),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  endDate: z.date().optional(),
  imageUrl: z
    .string()
    .url({
      message: "Debe ser una URL válida",
    })
    .optional()
    .or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isPublished: z.boolean().default(false),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  initialData?: any
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Valores por defecto para el formulario
  const defaultValues: Partial<EventFormValues> = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
    imageUrl: initialData?.imageUrl || "",
    latitude: initialData?.latitude || undefined,
    longitude: initialData?.longitude || undefined,
    isPublished: initialData?.isPublished || false,
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsLoading(true)

      if (isEditing) {
        // Actualizar evento existente
        const response = await fetch(`/api/events/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Error al actualizar el evento")
        }

        toast.success("Evento actualizado correctamente")
      } else {
        // Crear nuevo evento
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Error al crear el evento")
        }

        toast.success("Evento creado correctamente")
      }

      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Evento" : "Crear Nuevo Evento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Paseo en el parque" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el evento..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Parque Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y hora</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full pl-3 text-left font-normal">
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de finalización (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full pl-3 text-left font-normal">
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la imagen (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormDescription>URL de una imagen para mostrar en el evento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="40.7128"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Publicar evento</FormLabel>
                    <FormDescription>Si está marcado, el evento será visible para todos los usuarios</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? "Guardando..." : isEditing ? "Actualizar evento" : "Crear evento"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

