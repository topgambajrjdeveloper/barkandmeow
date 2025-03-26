"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const predefinedAmounts = [
  { value: "5", label: "5€" },
  { value: "10", label: "10€" },
  { value: "25", label: "25€" },
  { value: "50", label: "50€" },
  { value: "custom", label: "Otra cantidad" },
]

interface DonationOptionsProps {
  onAmountChange?: (amount: number) => void
}

export function DonationOptions({ onAmountChange }: DonationOptionsProps) {
  const [selectedAmount, setSelectedAmount] = useState("10")
  const [customAmount, setCustomAmount] = useState("")

  // Actualizar el monto cuando cambia la selección
  useEffect(() => {
    const amount = getActualAmount()
    // Solo llamar a onAmountChange si es una función
    if (onAmountChange && typeof onAmountChange === "function") {
      onAmountChange(amount)
    }
  }, [selectedAmount, customAmount, onAmountChange])

  const handleAmountChange = (value: string) => {
    setSelectedAmount(value)
    if (value !== "custom") {
      setCustomAmount("")
    }
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números y un punto decimal
    const value = e.target.value.replace(/[^0-9.]/g, "")
    // Evitar múltiples puntos decimales
    const parts = value.split(".")
    const formattedValue = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : value

    setCustomAmount(formattedValue)
  }

  const getActualAmount = () => {
    if (selectedAmount === "custom") {
      return customAmount ? Number.parseFloat(customAmount) : 0
    }
    return Number.parseFloat(selectedAmount)
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAmount}
        onValueChange={handleAmountChange}
        className="grid grid-cols-2 sm:grid-cols-5 gap-2"
      >
        {predefinedAmounts.map((amount) => (
          <div key={amount.value} className="flex items-center space-x-2">
            <RadioGroupItem value={amount.value} id={`amount-${amount.value}`} className="sr-only" />
            <Label
              htmlFor={`amount-${amount.value}`}
              className={cn(
                "flex h-12 w-full cursor-pointer items-center justify-center rounded-md border border-primary/20 bg-background text-center text-sm font-medium transition-colors hover:bg-primary/5 hover:border-primary/30",
                selectedAmount === amount.value && "bg-primary/10 border-primary",
              )}
            >
              {amount.value === "custom" ? "Otra" : amount.label}
              {selectedAmount === amount.value && <Check className="ml-1 h-4 w-4 text-primary" />}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedAmount === "custom" && (
        <div className="flex items-center">
          <Input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Introduce la cantidad"
            className="max-w-[200px]"
          />
          <span className="ml-2 text-sm font-medium">€</span>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {getActualAmount() > 0 && (
          <p>
            Vas a donar <span className="font-medium">{getActualAmount().toFixed(2)}€</span> a BarkAndMeow
          </p>
        )}
      </div>
    </div>
  )
}

