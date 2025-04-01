"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Definir el tipo para las ubicaciones
interface VisitorLocation {
  latitude: number
  longitude: number
  count: number
  country: string
  city: string
}

// Definir el tipo para las propiedades del componente
interface AnalyticsMapProps {
  locations: VisitorLocation[]
  height?: string
}

// Componente que solo se ejecuta en el cliente
const AnalyticsMap = ({ locations = [], height = "500px" }: AnalyticsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  useEffect(() => {
    // Importar Leaflet solo en el cliente
    const L = require("leaflet")
    require("leaflet.heat")
    require("leaflet/dist/leaflet.css")

    // Corregir el problema de los iconos de Leaflet en Next.js
    const fixLeafletIcon = () => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }

    // Verificar si el mapa ya está inicializado
    if (!mapInstanceRef.current && mapRef.current) {
      // Inicializar el mapa
      fixLeafletIcon()
      mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2)

      // Añadir capa de mapa base (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Añadir controles de zoom en la esquina inferior derecha
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(mapInstanceRef.current)

      // Crear grupo de marcadores
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    }

    // Actualizar datos en el mapa
    if (mapInstanceRef.current && Array.isArray(locations) && locations.length > 0) {
      const map = mapInstanceRef.current

      // Limpiar capas existentes
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }

      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers()
      }

      // Preparar datos para el mapa de calor
      const heatData = locations
        .filter((loc) => loc && loc.latitude && loc.longitude)
        .map((loc) => [loc.latitude, loc.longitude, loc.count])

      // Crear mapa de calor
      if (heatData.length > 0) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: Math.max(...locations.filter((loc) => loc).map((loc) => loc.count)),
          gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
        }).addTo(map)
      }

      // Añadir marcadores para las ubicaciones principales
      const topLocations = [...locations]
        .filter((loc) => loc)
        .sort((a, b) => b.count - a.count)
        .slice(0, 50) // Mostrar solo los 50 puntos principales para no sobrecargar el mapa

      topLocations.forEach((loc) => {
        if (loc && loc.latitude && loc.longitude && markersLayerRef.current) {
          // Crear un icono personalizado según el número de visitantes
          const size = Math.min(30, Math.max(20, 15 + Math.log10(loc.count) * 5))

          const customIcon = L.divIcon({
            className: "visitor-marker",
            html: `
              <div style="
                width: ${size}px; 
                height: ${size}px; 
                background-color: rgba(59, 130, 246, 0.8); 
                color: white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 10px; 
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              ">${loc.count}</div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })

          const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).bindPopup(`
              <div>
                <h3 style="font-weight: bold; margin-bottom: 5px;">${loc.city || "Ciudad desconocida"}, ${loc.country || "País desconocido"}</h3>
                <p style="margin: 5px 0;">Visitantes: ${loc.count}</p>
              </div>
            `)

          marker.addTo(markersLayerRef.current)
        }
      })

      // Ajustar la vista si hay ubicaciones
      if (heatData.length > 0) {
        try {
          // Intentar ajustar la vista a los límites de los datos
          const bounds = L.latLngBounds(heatData.map((point) => [point[0], point[1]]))
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        } catch (error) {
          console.error("Error al ajustar la vista del mapa:", error)
          // Si falla, establecer una vista predeterminada
          map.setView([20, 0], 2)
        }
      }
    }

    // Limpiar al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [locations, height])

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapRef} className="absolute inset-0 rounded-lg border" />

      {/* Leyenda del mapa */}
      <div className="absolute top-4 right-4 bg-background/90 p-3 rounded-md shadow-md text-xs z-[500]">
        <h4 className="font-medium mb-2">Densidad de visitantes</h4>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 rounded"></div>
        </div>
        <div className="flex justify-between mt-1">
          <span>Bajo</span>
          <span>Alto</span>
        </div>
      </div>
    </div>
  )
}

// Exportar el componente con carga dinámica para evitar problemas de SSR
export default dynamic(() => Promise.resolve(AnalyticsMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-md">
      <div className="animate-pulse">Cargando mapa...</div>
    </div>
  ),
})

