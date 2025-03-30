import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/lib/prismadb"
import EventsTabContent from "@/components/(auth)/components/events/events-tab-content"
import PetFriendlyTabContent from "@/components/(auth)/components/pet-friendly/pet-friendly-tab-content"
import ShopsTabContent from "@/components/(auth)/components/shops/shops-tab-content"
import VetsTabContent from "@/components/(auth)/components/vets/vets-tab-content"

// Modificar la función getInitialServices para usar los campos correctos
async function getInitialServices() {
  // Obtener servicios para cada categoría
  const petFriendlyPlaces = await prisma.service.findMany({
    where: {
      subCategory: "pet-friendly",
      isActive: true,
    },
    take: 6,
    orderBy: {
      rating: "desc",
    },
  })

  const shops = await prisma.service.findMany({
    where: {
      subCategory: "shop",
      isActive: true,
    },
    take: 6,
    orderBy: {
      rating: "desc",
    },
  })

  const vets = await prisma.service.findMany({
    where: {
      subCategory: "vet",
      isActive: true,
    },
    take: 6,
    orderBy: {
      rating: "desc",
    },
  })

  return {
    petFriendlyPlaces,
    shops,
    vets,
  }
}

async function getEvents() {
  const totalEvents = await prisma.event.count({
    where: {
      endDate: {
        gte: new Date(),
      },
    },
  })

  const upcomingEvents = await prisma.event.findMany({
    where: {
      endDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 6,
  })

  return {
    totalEvents,
    upcomingEvents,
  }
}

export default async function ExplorePage() {
  const { petFriendlyPlaces, shops, vets } = await getInitialServices()
  const { totalEvents, upcomingEvents } = await getEvents()

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Explorar</h1>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid grid-cols-4 h-auto">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="pet-friendly">Pet-Friendly</TabsTrigger>
          <TabsTrigger value="shops">Tiendas</TabsTrigger>
          <TabsTrigger value="vets">Veterinarias</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Suspense fallback={<EventsTabSkeleton />}>
            <EventsTabContent totalEvents={totalEvents} initialEvents={upcomingEvents} />
          </Suspense>
        </TabsContent>

        <TabsContent value="pet-friendly">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <PetFriendlyTabContent initialPlaces={petFriendlyPlaces} />
          </Suspense>
        </TabsContent>

        <TabsContent value="shops">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <ShopsTabContent initialShops={shops} />
          </Suspense>
        </TabsContent>

        <TabsContent value="vets">
          <Suspense fallback={<ServicesTabSkeleton />}>
            <VetsTabContent initialVets={vets} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventsTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  )
}

