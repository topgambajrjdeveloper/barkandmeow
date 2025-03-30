import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import VetsAdminTab from "@/components/(admin)/services/vets-admin-tab"
import ShopsAdminTab from "@/components/(admin)/services/shops-admin-tab"

import prisma from "@/lib/prismadb"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PetFriendlyAdminTab from "@/components/(admin)/services/pet-friendly-admin-tab"

async function getServicesData() {
  // Obtener servicios para cada categoría
  const vets = await prisma.service.findMany({
    where: {
      subCategory: "vet",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const shops = await prisma.service.findMany({
    where: {
      subCategory: "shop",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const petFriendlyPlaces = await prisma.service.findMany({
    where: {
      subCategory: "pet-friendly",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return {
    vets,
    shops,
    petFriendlyPlaces,
  }
}

export default async function ServicesAdminPage() {
  const session = await auth()

  // Verificar si el usuario es administrador
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { vets, shops, petFriendlyPlaces } = await getServicesData()

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Administración de Servicios</h1>

      <Tabs defaultValue="vets" className="space-y-6">
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="vets">Veterinarias ({vets.length})</TabsTrigger>
          <TabsTrigger value="shops">Tiendas ({shops.length})</TabsTrigger>
          <TabsTrigger value="pet-friendly">Pet-Friendly ({petFriendlyPlaces.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vets">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <VetsAdminTab initialVets={vets} />
          </Suspense>
        </TabsContent>

        <TabsContent value="shops">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <ShopsAdminTab initialShops={shops} />
          </Suspense>
        </TabsContent>

        <TabsContent value="pet-friendly">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <PetFriendlyAdminTab initialPlaces={petFriendlyPlaces} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ServicesTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-md">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

