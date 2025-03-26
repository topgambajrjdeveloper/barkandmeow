"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonationOptions } from "./donation-options"
import { PayPalDonationButton } from "./paypal-donation-button"

export function DonationSection() {
  const [amount, setAmount] = useState(10)

  // Función para recibir la cantidad seleccionada desde DonationOptions
  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
  }

  return (
    <Card id="donativos" className="mb-6">
      <CardHeader>
        <CardTitle>Apoya Nuestro Proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            BarkAndMeow es un proyecto impulsado por la pasión y el compromiso con el bienestar animal. Si compartes
            nuestra visión y quieres ayudarnos a seguir creciendo, considera hacer un donativo. Tu apoyo nos permitirá:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Mantener la plataforma libre de publicidad intrusiva</li>
            <li>Desarrollar nuevas funcionalidades para mejorar la experiencia de usuario</li>
            <li>Colaborar con protectoras y asociaciones de bienestar animal</li>
            <li>Organizar eventos y actividades para nuestra comunidad</li>
          </ul>

          <div className="mt-6">
            <DonationOptions onAmountChange={handleAmountChange} />
          </div>

          <div className="flex justify-center mt-8">{amount > 0 && <PayPalDonationButton amount={amount} />}</div>
        </div>
      </CardContent>
    </Card>
  )
}

