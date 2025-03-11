"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function AddPetPage() {
  const router = useRouter()
  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    image: null as File | null,
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPetData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    Object.entries(petData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value)
      }
    })

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Mascota añadida con éxito")
        router.push(`/pets/${data.id}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al añadir la mascota")
      }
    } catch (error) {
      console.error("Error adding pet:", error)
      toast.error("Error al añadir la mascota")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Añadir Nueva Mascota</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" value={petData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Input id="type" name="type" value={petData.type} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="breed">Raza</Label>
          <Input id="breed" name="breed" value={petData.breed} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="age">Edad</Label>
          <Input id="age" name="age" type="number" value={petData.age} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="image">Imagen</Label>
          <Input id="image" name="image" type="file" onChange={handleImageChange} accept="image/*" />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" value={petData.description} onChange={handleChange} />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Añadiendo..." : "Añadir Mascota"}
        </Button>
      </form>
    </div>
  )
}

