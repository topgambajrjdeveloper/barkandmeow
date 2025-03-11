"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { vaccinationSchema, type VaccinationFormValues } from "@/lib/validations"

interface AddVaccinationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId: string
  petName: string
  existingVaccination?: {
    id: string
    name: string
    date: string
    nextDueDate?: string | null
    veterinarian?: string | null
    notes?: string | null
  } | null
}

export function AddVaccinationDialog({
  open,
  onOpenChange,
  petId,
  petName,
  existingVaccination,
}: AddVaccinationDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar el formulario con valores existentes si los hay
  const form = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      name: existingVaccination?.name || "",
      date: existingVaccination?.date || new Date().toISOString().split("T")[0],
      nextDueDate: existingVaccination?.nextDueDate || null,
      veterinarian: existingVaccination?.veterinarian || "",
      notes: existingVaccination?.notes || "",
    },
  })

  // Modificar la función onSubmit para mapear correctamente los campos
  const onSubmit = async (data: VaccinationFormValues) => {
    setIsSubmitting(true)
    try {
      // Asegurarse de que los campos opcionales sean strings vacíos en lugar de null
      const formData = {
        ...data,
        veterinarian: data.veterinarian || "",
        notes: data.notes || "",
      }

      // Si estamos editando, incluir el ID
      if (existingVaccination) {
        formData.id = existingVaccination.id
      }

      const response = await fetch(`/api/pets/${petId}/vaccinations`, {
        method: existingVaccination ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la vacuna")
      }

      toast.success(existingVaccination ? "Vacuna actualizada correctamente" : "Vacuna añadida correctamente")

      // Cerrar el diálogo y refrescar la página
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving vaccination:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar la vacuna")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingVaccination ? "Editar" : "Añadir"} vacuna para {petName}
          </DialogTitle>
          <DialogDescription>
            Registra las vacunas de tu mascota para mantener un seguimiento de su salud.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la vacuna*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Rabia, Parvovirus" {...field} />
                  </FormControl>
                  <FormDescription>El nombre o tipo de vacuna administrada</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vacunación*</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>La fecha en que se administró la vacuna</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima fecha (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>La fecha para la próxima dosis, si aplica</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="veterinarian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veterinario (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Dr. Juan Pérez"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>El nombre del veterinario que administró la vacuna</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cualquier información adicional relevante"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingVaccination ? "Actualizar" : "Guardar"} vacuna
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

