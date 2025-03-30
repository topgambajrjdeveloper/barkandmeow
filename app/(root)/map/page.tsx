import { redirect } from "next/navigation"

// Página de redirección para la ruta /map
export default function MapPage({ searchParams }: { searchParams: { category?: string } }) {
  // Obtener la categoría de los parámetros de consulta o usar el valor por defecto
  const category = searchParams.category || "pet-friendly"

  // Redirigir a la ruta dinámica correspondiente
  redirect(`/map/${category}`)
}