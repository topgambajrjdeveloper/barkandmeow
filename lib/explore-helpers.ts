// Función para navegar a la página de exploración con una categoría específica
export function navigateToExploreCategory(categoryId: string) {
  // Construir la URL con el parámetro de categoría
  const url = `/explore?category=${categoryId}`

  // Si estamos en la página de exploración, solo actualizar la URL
  if (window.location.pathname === "/explore") {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("category", categoryId)
    window.history.pushState({}, "", newUrl)

    // Disparar un evento personalizado para notificar el cambio de categoría
    window.dispatchEvent(new CustomEvent("exploreCategoryChange", { detail: categoryId }))
    return
  }

  // Si estamos en otra página, navegar a la página de exploración
  window.location.href = url
}

// Función para obtener la categoría activa de la URL
export function getActiveCategoryFromUrl(): string {
  const searchParams = new URLSearchParams(window.location.search)
  const categoryParam = searchParams.get("category")

  // Verificar si la categoría es válida
  const validCategories = ["all", "users", "pets", "events", "pet-friendly", "meetups", "shops", "vets", "popular"]

  return validCategories.includes(categoryParam || "") ? categoryParam || "all" : "all"
}

// Función para navegar a la página de eventos con filtros específicos
export function navigateToEventsPage(filters?: {
  filter?: string
  lat?: number
  lng?: number
  radius?: number
  filterByLocation?: boolean
}) {
  // Construir la URL base
  let url = "/explore/events"

  // Añadir parámetros de búsqueda si existen
  if (filters) {
    const searchParams = new URLSearchParams()

    if (filters.filter && filters.filter !== "all") {
      searchParams.set("filter", filters.filter)
    }

    if (filters.lat !== undefined && filters.lng !== undefined) {
      searchParams.set("lat", filters.lat.toString())
      searchParams.set("lng", filters.lng.toString())
    }

    if (filters.radius !== undefined) {
      searchParams.set("radius", filters.radius.toString())
    }

    if (filters.filterByLocation) {
      searchParams.set("filterByLocation", "true")
    }

    const searchString = searchParams.toString()
    if (searchString) {
      url += `?${searchString}`
    }
  }

  // Navegar a la URL
  window.location.href = url
}

