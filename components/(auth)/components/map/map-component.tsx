"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Service } from "@/types"
// Importar la función getUserLocation del módulo location.ts
import { getUserLocation } from "@/lib/location"

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
  height?: string
}

// Modificar la función MapComponent para usar forwardRef
const MapComponent = forwardRef(
  ({ places, userLocation, onMarkerClick, center, zoom = 6, height = "700px" }: MapComponentProps, ref) => {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.Marker[]>([])
    const [mapInitialized, setMapInitialized] = useState(false)

    // Crear un objeto de referencia para los marcadores por ID
    const markersById = useRef<Record<string, L.Marker>>({})

    // Exponer métodos a través de la referencia
    useImperativeHandle(ref, () => ({
      // Método para centrar el mapa en una ubicación específica
      flyToLocation: (lat: number, lng: number, place?: Service) => {
        if (!mapRef.current) return

        console.log(`Centrando mapa en [${lat}, ${lng}]`)

        // Centrar el mapa en la ubicación con animación
        mapRef.current.flyTo([lat, lng], 15, {
          animate: true,
          duration: 1,
        })

        // Si se proporciona un lugar y existe un marcador para él, abrir su popup
        if (place && place.id && markersById.current[place.id]) {
          setTimeout(() => {
            markersById.current[place.id].openPopup()
          }, 1000) // Esperar a que termine la animación
        }
      },
    }))

    // Inicializar el mapa
    useEffect(() => {
      if (typeof window === "undefined") return // Evitar ejecución en el servidor

      if (!mapContainerRef.current || mapRef.current) return

      console.log("Inicializando mapa...")
      fixLeafletIcon()

      // Función asíncrona para obtener la ubicación y configurar el mapa
      const initializeMap = async () => {
        try {
          // Determinar el centro del mapa
          let initialCenter: [number, number] = [40.416775, -3.70379] // Valor por defecto (Madrid)

          // Si hay centro especificado o ubicación de usuario, usarlos
          if (center) {
            initialCenter = center
          } else if (userLocation) {
            initialCenter = [userLocation.latitude, userLocation.longitude]
          } else {
            // Intentar obtener la ubicación del usuario usando el módulo location.ts
            const locationData = await getUserLocation()
            if (locationData.latitude && locationData.longitude) {
              initialCenter = [locationData.latitude, locationData.longitude]
              console.log("Usando ubicación obtenida de location.ts:", initialCenter)
            } else {
              console.log("No se pudo obtener ubicación, usando ubicación por defecto")
            }
          }

          // Crear el mapa con zoom más bajo para ver más territorio
          const map = L.map(mapContainerRef.current).setView(initialCenter, zoom)

          // Añadir capa de mapa de OpenStreetMap
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)

          // Guardar referencia al mapa
          mapRef.current = map
          setMapInitialized(true)
          console.log("Mapa inicializado correctamente con centro en:", initialCenter, "y zoom:", zoom)

          // Forzar un redimensionamiento después de la inicialización
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize()
            }
          }, 100)
        } catch (error) {
          console.error("Error al inicializar el mapa:", error)
        }
      }

      // Inicializar el mapa
      initializeMap()

      // Limpiar al desmontar
      return () => {
        if (mapRef.current) {
          console.log("Limpiando mapa...")
          mapRef.current.remove()
          mapRef.current = null
          setMapInitialized(false)
        }
      }
    }, [center, userLocation, zoom])

    // Actualizar marcadores cuando cambian los lugares o la ubicación del usuario
    useEffect(() => {
      if (!mapRef.current || !mapInitialized) return

      console.log("Actualizando marcadores...", places.length)

      // Limpiar marcadores anteriores
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markersById.current = {} // Limpiar el objeto de marcadores por ID

      // Añadir marcador de ubicación del usuario
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
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
      let hasValidPlaces = false

      places.forEach((place) => {
        if (place.latitude && place.longitude) {
          hasValidPlaces = true
          // Crear un icono personalizado según la categoría
          let iconColor = "#000000" // Negro por defecto para pet-friendly
          let iconText = "P"

          if (place.category === "shop" || place.subCategory === "shop") {
            iconColor = "#f97316" // Naranja para tiendas
            iconText = "S"
          } else if (place.category === "vet" || place.subCategory === "vet") {
            iconColor = "#22c55e" // Verde para veterinarias
            iconText = "V"
          }

          console.log(`Creando marcador para ${place.title} en [${place.latitude}, ${place.longitude}]`)

          const customIcon = L.divIcon({
            className: "custom-div-icon", // Usar un nombre de clase en lugar de cadena vacía
            html: `
        <div style="
          width: 30px; 
          height: 30px; 
          background-color: ${iconColor}; 
          color: white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 14px; 
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">${iconText}</div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
          })

          const marker = L.marker([place.latitude, place.longitude], { icon: customIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
        <div>
          <h3 style="font-weight: bold; margin-bottom: 5px;">${place.title}</h3>
          <p style="margin: 5px 0;">${place.address || "Sin dirección"}</p>
          ${place.distance != null ? `<p style="margin: 5px 0;">A ${place.distance.toFixed(1)} km</p>` : ""}
          ${place.openingHours ? `<p style="margin: 5px 0;">Horario: ${place.openingHours}</p>` : ""}
          <div style="margin-top: 10px;">
            <a href="https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}" 
               target="_blank" rel="noopener noreferrer" 
               style="color: #3b82f6; text-decoration: none; font-weight: bold;">
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

          // Guardar referencia al marcador por ID
          if (place.id) {
            markersById.current[place.id] = marker
          }

          bounds.extend([place.latitude, place.longitude])
        }
      })

      // Añadir ubicación del usuario a los límites si está disponible
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude])
      }

      // Ajustar el mapa para mostrar todos los marcadores
      if (bounds.isValid() && hasValidPlaces) {
        console.log("Ajustando mapa a los límites de los marcadores")
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      } else if (!hasValidPlaces) {
        // Si no hay lugares válidos, intentar usar la ubicación del usuario o la ubicación por defecto
        console.log("No hay lugares válidos, intentando centrar en la ubicación del usuario")

        // Función asíncrona para centrar el mapa
        const centerMap = async () => {
          try {
            // Si ya tenemos userLocation, usarlo
            if (userLocation) {
              mapRef.current.setView([userLocation.latitude, userLocation.longitude], 12)
              return
            }

            // Intentar obtener la ubicación del usuario
            const locationData = await getUserLocation()
            if (locationData.latitude && locationData.longitude) {
              console.log("Centrando mapa en ubicación obtenida:", [locationData.latitude, locationData.longitude])
              mapRef.current.setView([locationData.latitude, locationData.longitude], 12)
            } else {
              // Si no se puede obtener la ubicación, usar Madrid como fallback
              console.log("No se pudo obtener ubicación, centrando en España")
              mapRef.current.setView([40.416775, -3.70379], 6)
            }
          } catch (error) {
            console.error("Error al centrar el mapa:", error)
            // En caso de error, usar Madrid como fallback
            mapRef.current.setView([40.416775, -3.70379], 6)
          }
        }

        centerMap()
      }

      // Forzar un redimensionamiento después de actualizar marcadores
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 100)
    }, [places, userLocation, mapInitialized, onMarkerClick])

    return (
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="absolute inset-0 rounded-lg border" />
        <div className="absolute bottom-4 left-4 bg-background p-3 rounded-md shadow-md text-xs z-[500]">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full bg-black mr-2"></div>
            <span>Pet-Friendly</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span>Tiendas</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Veterinarias</span>
          </div>
        </div>
      </div>
    )
  },
)

// Al final del archivo, después de la definición del componente pero antes de la exportación, añadir:
MapComponent.displayName = "MapComponent"

// Exportar el componente con nombre para facilitar la depuración
export default MapComponent

