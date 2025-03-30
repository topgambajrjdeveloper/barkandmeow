"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Service } from "@/types"

// Corregir el problema de los iconos de Leaflet en Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

interface MapComponentProps {
  places: Service[]
  userLocation: { latitude: number; longitude: number } | null
  onMarkerClick?: (place: Service) => void
  center?: [number, number]
  zoom?: number
}

export default function MapComponent({ places, userLocation, onMarkerClick, center, zoom = 13 }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapInitialized, setMapInitialized] = useState(false)

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized) return

    fixLeafletIcon()

    // Determinar el centro del mapa
    const initialCenter =
      center || (userLocation ? [userLocation.latitude, userLocation.longitude] : [40.416775, -3.70379]) // Madrid como ubicación por defecto

    // Crear el mapa
    const map = L.map(mapContainerRef.current).setView(initialCenter as [number, number], zoom)

    // Añadir capa de mapa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Guardar referencia al mapa
    mapRef.current = map
    setMapInitialized(true)

    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setMapInitialized(false)
      }
    }
  }, [mapInitialized, center, userLocation, zoom])

  // Actualizar marcadores cuando cambian los lugares o la ubicación del usuario
  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Añadir marcador de ubicación del usuario
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup("Tu ubicación")

      markersRef.current.push(userMarker)
    }

    // Añadir marcadores para los lugares
    const bounds = L.latLngBounds([])

    places.forEach((place) => {
      if (place.latitude && place.longitude) {
        // Crear un icono personalizado según la categoría
        let iconHtml = `<div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">P</div>`

        if (place.subCategory === "shop") {
          iconHtml = `<div class="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">S</div>`
        } else if (place.subCategory === "vet") {
          iconHtml = `<div class="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">V</div>`
        }

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: iconHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        })

        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div>
              <h3 class="font-bold">${place.title}</h3>
              <p>${place.address || "Sin dirección"}</p>
              ${place.distance ? `<p>A ${place.distance.toFixed(1)} km</p>` : ""}
              ${place.openingHours ? `<p>Horario: ${place.openingHours}</p>` : ""}
              <div class="mt-2">
                <a href="https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}" 
                   target="_blank" rel="noopener noreferrer" 
                   class="text-blue-500 hover:underline">
                  Cómo llegar
                </a>
              </div>
            </div>
          `)

        marker.on("click", () => {
          if (onMarkerClick) {
            onMarkerClick(place)
          }
        })

        markersRef.current.push(marker)
        bounds.extend([place.latitude, place.longitude])
      }
    })

    // Añadir ubicación del usuario a los límites si está disponible
    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude])
    }

    // Ajustar el mapa para mostrar todos los marcadores
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [places, userLocation, mapInitialized, onMarkerClick])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-[500px] w-full rounded-lg border" />
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
          <span>Pet-Friendly</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
          <span>Tiendas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Veterinarias</span>
        </div>
      </div>
    </div>
  )
}

