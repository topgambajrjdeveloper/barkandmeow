"use client"

import { useState, useEffect } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PayPalDonationButtonProps {
  amount: number
}

export function PayPalDonationButton({ amount }: PayPalDonationButtonProps) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  // Asegurarse de que el componente solo se renderice cuando el monto sea válido
  useEffect(() => {
    setIsReady(amount > 0)
  }, [amount])

  // Crear un ID de orden único para esta donación
  const createOrderId = () => {
    return `donation-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  if (!isReady) {
    return null
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "EUR",
        intent: "capture",
      }}
    >
      <div className="w-full max-w-md mx-auto">
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "donate",
          }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toFixed(2),
                    currency_code: "EUR",
                  },
                  description: "Donación a BarkAndMeow",
                  custom_id: createOrderId(),
                },
              ],
              application_context: {
                shipping_preference: "NO_SHIPPING",
              },
            })
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              // Guardar la donación en la base de datos
              saveDonation({
                orderId: data.orderID,
                payerId: details.payer.payer_id,
                amount: Number.parseFloat(details.purchase_units[0].amount.value),
                email: details.payer.email_address,
                name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
              })

              // Redirigir a la página de agradecimiento
              router.push(`/donacion/gracias?order_id=${data.orderID}`)
            })
          }}
          onError={(err) => {
            console.error("Error en el pago con PayPal:", err)
            toast.error("Ha ocurrido un error al procesar tu donación. Por favor, inténtalo de nuevo.")
          }}
          onCancel={() => {
            toast.info("Has cancelado la donación. Puedes intentarlo de nuevo cuando quieras.")
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
}

// Función para guardar la donación en la base de datos
async function saveDonation(donationData: {
  orderId: string
  payerId: string
  amount: number
  email: string
  name: string
}) {
  try {
    const response = await fetch("/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(donationData),
    })

    if (!response.ok) {
      throw new Error("Error al guardar la donación")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al guardar la donación:", error)
    // No mostramos error al usuario porque la donación ya se procesó correctamente
  }
}

