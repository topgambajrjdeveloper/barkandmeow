// ID de Google Analytics
export const GA_TRACKING_ID = process.env.GA_TRACKING_ID as string

// Tipos para Google Analytics
export interface GTagEvent {
  action: string
  category: string
  label: string
  value?: number
}

// Inicializa Google Analytics
export const pageview = (url: string) => {
  if (typeof window !== "undefined") {
    window.gtag?.("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Envía eventos a Google Analytics
export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== "undefined") {
    window.gtag?.("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

