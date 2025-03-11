"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { passportSchema, type PassportData } from "@/lib/validations"
import { ZodError } from "zod"

export default function AddPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [petId, setPetId] = useState<string | null>(null)
  const [passportData, setPassportData] = useState<PassportData>({
    passportNumber: "",
    issuedDate: "",
    expiryDate: "",
    issuingCountry: "",
    microchipNumber: "",
    species: "",
    breed: "",
    sex: "male",
    dateOfBirth: "",
    transponderCode: "",
    transponderReadDate: "",
    transponderLocation: "",
    tattooCode: "",
    tattooDate: "",
    tattooLocation: "",
    veterinarianName: "",
    clinicAddress: "",
    clinicPostalCode: "",
    clinicCity: "",
    clinicCountry: "",
    clinicPhone: "",
    clinicEmail: "",
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setPetId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPassportData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setPassportData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!petId) {
      toast.error("ID de mascota no disponible")
      return
    }
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = passportSchema.parse(passportData)

      const response = await fetch(`/api/pets/${petId}/passport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        toast.success("Pasaporte añadido con éxito")
        router.push(`/pets/${petId}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Error al añadir el pasaporte")
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
        toast.error("Por favor, corrige los errores en el formulario")
      } else {
        toast.error("Error al validar los datos del pasaporte")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!petId) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Añadir Pasaporte</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="passportNumber">Número de Pasaporte</Label>
          <Input
            id="passportNumber"
            name="passportNumber"
            value={passportData.passportNumber}
            onChange={handleChange}
            required
          />
          {errors.passportNumber && <p className="text-red-500 text-sm mt-1">{errors.passportNumber}</p>}
        </div>
        <div>
          <Label htmlFor="issuedDate">Fecha de Emisión</Label>
          <Input
            id="issuedDate"
            name="issuedDate"
            type="date"
            value={passportData.issuedDate}
            onChange={handleChange}
            required
          />
          {errors.issuedDate && <p className="text-red-500 text-sm mt-1">{errors.issuedDate}</p>}
        </div>
        <div>
          <Label htmlFor="expiryDate">Fecha de Expiración</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={passportData.expiryDate || ""}
            onChange={handleChange}
          />
          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
        </div>
        <div>
          <Label htmlFor="issuingCountry">País Emisor</Label>
          <Input
            id="issuingCountry"
            name="issuingCountry"
            value={passportData.issuingCountry}
            onChange={handleChange}
            required
          />
          {errors.issuingCountry && <p className="text-red-500 text-sm mt-1">{errors.issuingCountry}</p>}
        </div>
        <div>
          <Label htmlFor="microchipNumber">Número de Microchip</Label>
          <Input
            id="microchipNumber"
            name="microchipNumber"
            value={passportData.microchipNumber || ""}
            onChange={handleChange}
          />
          {errors.microchipNumber && <p className="text-red-500 text-sm mt-1">{errors.microchipNumber}</p>}
        </div>
        <div>
          <Label htmlFor="species">Especie</Label>
          <Input id="species" name="species" value={passportData.species} onChange={handleChange} required />
          {errors.species && <p className="text-red-500 text-sm mt-1">{errors.species}</p>}
        </div>
        <div>
          <Label htmlFor="breed">Raza</Label>
          <Input id="breed" name="breed" value={passportData.breed} onChange={handleChange} required />
          {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
        </div>
        <div>
          <Label htmlFor="sex">Sexo</Label>
          <Select name="sex" value={passportData.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Macho</SelectItem>
              <SelectItem value="female">Hembra</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={passportData.dateOfBirth}
            onChange={handleChange}
            required
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <Label htmlFor="transponderCode">Código del Transpondedor</Label>
          <Input
            id="transponderCode"
            name="transponderCode"
            value={passportData.transponderCode || ""}
            onChange={handleChange}
          />
          {errors.transponderCode && <p className="text-red-500 text-sm mt-1">{errors.transponderCode}</p>}
        </div>
        <div>
          <Label htmlFor="transponderReadDate">Fecha de Lectura del Transpondedor</Label>
          <Input
            id="transponderReadDate"
            name="transponderReadDate"
            type="date"
            value={passportData.transponderReadDate || ""}
            onChange={handleChange}
          />
          {errors.transponderReadDate && <p className="text-red-500 text-sm mt-1">{errors.transponderReadDate}</p>}
        </div>
        <div>
          <Label htmlFor="transponderLocation">Ubicación del Transpondedor</Label>
          <Input
            id="transponderLocation"
            name="transponderLocation"
            value={passportData.transponderLocation || ""}
            onChange={handleChange}
          />
          {errors.transponderLocation && <p className="text-red-500 text-sm mt-1">{errors.transponderLocation}</p>}
        </div>
        <div>
          <Label htmlFor="tattooCode">Código del Tatuaje</Label>
          <Input id="tattooCode" name="tattooCode" value={passportData.tattooCode || ""} onChange={handleChange} />
          {errors.tattooCode && <p className="text-red-500 text-sm mt-1">{errors.tattooCode}</p>}
        </div>
        <div>
          <Label htmlFor="tattooDate">Fecha del Tatuaje</Label>
          <Input
            id="tattooDate"
            name="tattooDate"
            type="date"
            value={passportData.tattooDate || ""}
            onChange={handleChange}
          />
          {errors.tattooDate && <p className="text-red-500 text-sm mt-1">{errors.tattooDate}</p>}
        </div>
        <div>
          <Label htmlFor="tattooLocation">Ubicación del Tatuaje</Label>
          <Input
            id="tattooLocation"
            name="tattooLocation"
            value={passportData.tattooLocation || ""}
            onChange={handleChange}
          />
          {errors.tattooLocation && <p className="text-red-500 text-sm mt-1">{errors.tattooLocation}</p>}
        </div>
        <div>
          <Label htmlFor="veterinarianName">Nombre del Veterinario</Label>
          <Input
            id="veterinarianName"
            name="veterinarianName"
            value={passportData.veterinarianName}
            onChange={handleChange}
            required
          />
          {errors.veterinarianName && <p className="text-red-500 text-sm mt-1">{errors.veterinarianName}</p>}
        </div>
        <div>
          <Label htmlFor="clinicAddress">Dirección de la Clínica</Label>
          <Input
            id="clinicAddress"
            name="clinicAddress"
            value={passportData.clinicAddress}
            onChange={handleChange}
            required
          />
          {errors.clinicAddress && <p className="text-red-500 text-sm mt-1">{errors.clinicAddress}</p>}
        </div>
        <div>
          <Label htmlFor="clinicPostalCode">Código Postal de la Clínica</Label>
          <Input
            id="clinicPostalCode"
            name="clinicPostalCode"
            value={passportData.clinicPostalCode}
            onChange={handleChange}
            required
          />
          {errors.clinicPostalCode && <p className="text-red-500 text-sm mt-1">{errors.clinicPostalCode}</p>}
        </div>
        <div>
          <Label htmlFor="clinicCity">Ciudad de la Clínica</Label>
          <Input id="clinicCity" name="clinicCity" value={passportData.clinicCity} onChange={handleChange} required />
          {errors.clinicCity && <p className="text-red-500 text-sm mt-1">{errors.clinicCity}</p>}
        </div>
        <div>
          <Label htmlFor="clinicCountry">País de la Clínica</Label>
          <Input
            id="clinicCountry"
            name="clinicCountry"
            value={passportData.clinicCountry}
            onChange={handleChange}
            required
          />
          {errors.clinicCountry && <p className="text-red-500 text-sm mt-1">{errors.clinicCountry}</p>}
        </div>
        <div>
          <Label htmlFor="clinicPhone">Teléfono de la Clínica</Label>
          <Input
            id="clinicPhone"
            name="clinicPhone"
            value={passportData.clinicPhone}
            onChange={handleChange}
            required
          />
          {errors.clinicPhone && <p className="text-red-500 text-sm mt-1">{errors.clinicPhone}</p>}
        </div>
        <div>
          <Label htmlFor="clinicEmail">Email de la Clínica</Label>
          <Input
            id="clinicEmail"
            name="clinicEmail"
            type="email"
            value={passportData.clinicEmail}
            onChange={handleChange}
            required
          />
          {errors.clinicEmail && <p className="text-red-500 text-sm mt-1">{errors.clinicEmail}</p>}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Añadiendo..." : "Añadir Pasaporte"}
        </Button>
      </form>
    </div>
  )
}

