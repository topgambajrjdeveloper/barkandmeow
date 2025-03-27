/* eslint-disable react/no-unescaped-entities */
"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ExternalLink, Check, Info } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PatreonDonationSection() {
  const { user } = useUser()
  const [donationAmount, setDonationAmount] = useState("5")
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [email, setEmail] = useState(user?.email || "")

  const handleAmountChange = (value: string) => {
    setDonationAmount(value)
    setIsCustom(value === "custom")
    if (value !== "custom") {
      setCustomAmount("")
    }
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setCustomAmount(value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSupportClick = () => {
    const amount = isCustom ? customAmount : donationAmount
    if (!amount || (isCustom && Number.parseInt(amount) < 1)) {
      alert("Por favor, selecciona o introduce una cantidad válida")
      return
    }

    if (!email || !email.includes("@")) {
      alert("Por favor, introduce un email válido para poder asignar la insignia a tu perfil")
      return
    }

    // En una implementación real, esto enviaría el email a tu backend antes de redirigir
    // para poder asociar la donación con el usuario
    const encodedEmail = encodeURIComponent(email)

    // Redirigir a Patreon con el email como parámetro personalizado
    window.open(`https://www.patreon.com/join/barkandmeowapp?user_email=${encodedEmail}`, "_blank")

    // También podrías almacenar esta intención de donación en tu backend
    fetch("/api/donation-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: isCustom ? Number.parseInt(customAmount) : Number.parseInt(donationAmount),
        source: "patreon",
      }),
    }).catch((err) => console.error("Error registrando intención de donación:", err))
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Apoya Nuestro Proyecto</h2>

      <Card className="border shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Patreon"
                width={40}
                height={40}
                className="rounded"
              />
              <div className="text-left">
                <CardTitle>Apoya a BarkAndMeow</CardTitle>
                <CardDescription>Elige la cantidad con la que quieres contribuir</CardDescription>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Con tu apoyo organizamos eventos, quedadas y actividades donde las mascotas pueden conocerse, jugar y
            divertirse juntas. Cualquier cantidad nos ayuda a seguir creciendo.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg border border-muted">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Beneficios para usuarios</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Al apoyarnos, recibirás la insignia de "Usuario Premium" en tu perfil y tendrás plaza reservada en
                    todos los eventos que organicemos para mascotas.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Selecciona una cantidad</h3>
              <RadioGroup
                value={donationAmount}
                onValueChange={handleAmountChange}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <div>
                  <RadioGroupItem value="3" id="amount-3" className="peer sr-only" />
                  <Label
                    htmlFor="amount-3"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl font-bold">3€</span>
                    <span className="text-xs">Mensual</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="5" id="amount-5" className="peer sr-only" />
                  <Label
                    htmlFor="amount-5"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl font-bold">5€</span>
                    <span className="text-xs">Mensual</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="10" id="amount-10" className="peer sr-only" />
                  <Label
                    htmlFor="amount-10"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl font-bold">10€</span>
                    <span className="text-xs">Mensual</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="custom" id="amount-custom" className="peer sr-only" />
                  <Label
                    htmlFor="amount-custom"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl font-bold">Otra</span>
                    <span className="text-xs">Cantidad</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {isCustom && (
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-medium">
                  Introduce la cantidad (€)
                </Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="custom-amount"
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Ej: 15"
                    className="text-center"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="user-email" className="text-sm font-medium">
                  Tu email para recibir la insignia
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Necesitamos tu email para poder asignar la insignia de "Usuario Premium" a tu perfil. Debe
                        coincidir con el email que usaste para registrarte en BarkAndMeow.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="tu@email.com"
                className="mt-1.5"
                required
              />
            </div>

            <Button className="w-full" size="lg" onClick={handleSupportClick}>
              Apoyar con {isCustom ? (customAmount ? `${customAmount}€` : "tu cantidad") : `${donationAmount}€`}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Después de completar tu donación en Patreon, la insignia se añadirá automáticamente a tu perfil en un
              plazo de 24 horas. Si tienes algún problema, contacta con nosotros.
            </p>
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="https://www.patreon.com/barkandmeowapp" target="_blank">
                Visitar nuestra página de Patreon
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  )
}

