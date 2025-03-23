"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { sendContactForm } from "@/lib/actions/contact"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PawPrint, Mail, Phone, MapPin } from "lucide-react"
import { contactFormSchema, type ContactFormValues } from "@/lib/validations"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true)
    try {
      await sendContactForm(data)
      toast.success("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.")
      form.reset()
    } catch (error) {
      console.error("Error sending contact form:", error)
      toast.error("Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-12">
        <PawPrint className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-4">Contacto</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte. Completa el formulario a continuación y nos
          pondremos en contacto contigo lo antes posible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Correo Electrónico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {/* <a href="mailto:info@barkandmeow.app" className="hover:text-primary">
                  info@barkandmeow.app
                </a> */}
                <li>
              <a href="https://wa.me/34649599475" className="text-primary hover:underline">
                Contactar por WhatsApp
              </a>
              </li>
              </p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Teléfono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <a href="tel:+34912345678" className="hover:text-primary">
                  +34 912 345 678
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Calle Principal 123
                <br />
                28001 Madrid, España
              </p>
            </CardContent>
          </Card> */}
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario a continuación y te responderemos lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto de tu mensaje" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Tu mensaje será tratado con confidencialidad.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

