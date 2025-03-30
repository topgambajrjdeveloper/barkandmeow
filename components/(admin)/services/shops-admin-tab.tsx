"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Check, X, MapPin } from "lucide-react"
import type { Service } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ShopsAdminTabProps {
  initialShops: Service[]
}

export default function ShopsAdminTab({ initialShops }: ShopsAdminTabProps) {
  const [shops, setShops] = useState<Service[]>(initialShops)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Service>>({
    title: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    openingHours: "",
    latitude: null,
    longitude: null,
    isActive: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === "" ? null : Number.parseFloat(value)
    setFormData((prev) => ({ ...prev, [name]: numValue }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      address: "",
      phone: "",
      website: "",
      openingHours: "",
      latitude: null,
      longitude: null,
      isActive: true,
    })
  }

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("El título es obligatorio")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          subCategory: "shop",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la tienda")
      }

      const newShop = await response.json()
      setShops((prev) => [newShop, ...prev])
      toast.success("Tienda creada con éxito")
      setIsCreating(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear la tienda")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!formData.title) {
      toast.error("El título es obligatorio")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la tienda")
      }

      const updatedShop = await response.json()
      setShops((prev) => prev.map((shop) => (shop.id === id ? updatedShop : shop)))
      toast.success("Tienda actualizada con éxito")
      setIsEditing(null)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar la tienda")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tienda?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la tienda")
      }

      setShops((prev) => prev.filter((shop) => shop.id !== id))
      toast.success("Tienda eliminada con éxito")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar la tienda")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al cambiar el estado")
      }

      const updatedShop = await response.json()
      setShops((prev) => prev.map((shop) => (shop.id === id ? updatedShop : shop)))
      toast.success(`Tienda ${!currentStatus ? "activada" : "desactivada"} con éxito`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cambiar el estado")
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (shop: Service) => {
    setFormData({
      title: shop.title,
      description: shop.description || "",
      address: shop.address || "",
      phone: shop.phone || "",
      website: shop.website || "",
      openingHours: shop.openingHours || "",
      latitude: shop.latitude,
      longitude: shop.longitude,
      isActive: shop.isActive || false,
    })
    setIsEditing(shop.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tiendas</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Tienda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Tienda</DialogTitle>
              <DialogDescription>Completa el formulario para añadir una nueva tienda.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Nombre *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Dirección
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">
                  Sitio Web
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="openingHours" className="text-right">
                  Horario
                </Label>
                <Input
                  id="openingHours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Ej: Lun-Vie: 9:00-18:00, Sáb: 10:00-14:00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="latitude" className="text-right">
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude === null ? "" : formData.latitude}
                  onChange={handleCoordinateChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longitude" className="text-right">
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude === null ? "" : formData.longitude}
                  onChange={handleCoordinateChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Activo
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                  <span className="ml-2">{formData.isActive ? "Visible para usuarios" : "No visible"}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No hay tiendas registradas
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.title}</TableCell>
                  <TableCell>
                    {shop.address ? (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{shop.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin dirección</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${shop.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      <span>{shop.isActive ? "Activo" : "Inactivo"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shop.createdAt ? format(new Date(shop.createdAt), "dd/MM/yyyy", { locale: es }) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleStatus(shop.id, shop.isActive || false)}
                        title={shop.isActive ? "Desactivar" : "Activar"}
                      >
                        {shop.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Dialog open={isEditing === shop.id} onOpenChange={(open) => !open && setIsEditing(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => startEditing(shop)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Editar Tienda</DialogTitle>
                            <DialogDescription>Modifica los datos de la tienda.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-title" className="text-right">
                                Nombre *
                              </Label>
                              <Input
                                id="edit-title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-description" className="text-right">
                                Descripción
                              </Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="col-span-3"
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-address" className="text-right">
                                Dirección
                              </Label>
                              <Input
                                id="edit-address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-phone" className="text-right">
                                Teléfono
                              </Label>
                              <Input
                                id="edit-phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-website" className="text-right">
                                Sitio Web
                              </Label>
                              <Input
                                id="edit-website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-openingHours" className="text-right">
                                Horario
                              </Label>
                              <Input
                                id="edit-openingHours"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Ej: Lun-Vie: 9:00-18:00, Sáb: 10:00-14:00"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-latitude" className="text-right">
                                Latitud
                              </Label>
                              <Input
                                id="edit-latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={formData.latitude === null ? "" : formData.latitude}
                                onChange={handleCoordinateChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-longitude" className="text-right">
                                Longitud
                              </Label>
                              <Input
                                id="edit-longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude === null ? "" : formData.longitude}
                                onChange={handleCoordinateChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-isActive" className="text-right">
                                Activo
                              </Label>
                              <div className="col-span-3 flex items-center">
                                <Switch
                                  id="edit-isActive"
                                  checked={formData.isActive}
                                  onCheckedChange={handleSwitchChange}
                                />
                                <span className="ml-2">
                                  {formData.isActive ? "Visible para usuarios" : "No visible"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsEditing(null)
                                resetForm()
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button type="button" onClick={() => handleEdit(shop.id)} disabled={isLoading}>
                              {isLoading ? "Guardando..." : "Guardar cambios"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(shop.id)} title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

