"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
]

type LanguageContextType = {
  currentLanguage: Language
  changeLanguage: (code: string) => void
  languages: Language[]
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Cargar el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem("language") || "es"
    const lang = languages.find((l) => l.code === savedLanguage) || languages[0]
    setCurrentLanguage(lang)

    // Aquí cargarías las traducciones
    // Por ejemplo, desde archivos JSON o una API
    const loadTranslations = async () => {
      // Ejemplo de carga de traducciones
      // const esTranslations = await import('@/locales/es.json')
      // const enTranslations = await import('@/locales/en.json')

      // Por ahora, usamos un objeto de ejemplo
      setTranslations({
        es: {
          "nav.home": "Inicio",
          "nav.feed": "Feed",
          "nav.explore": "Explorar",
          "nav.contact": "Contactar",
          // Más traducciones...
        },
        en: {
          "nav.home": "Home",
          "nav.feed": "Feed",
          "nav.explore": "Explore",
          "nav.contact": "Contact",
          // Más traducciones...
        },
        // Otros idiomas...
      })

      setIsLoaded(true)
    }

    loadTranslations()
  }, [])

  const changeLanguage = (code: string) => {
    const lang = languages.find((l) => l.code === code)
    if (lang) {
      setCurrentLanguage(lang)
      localStorage.setItem("language", lang.code)
      document.documentElement.lang = lang.code
    }
  }

  // Función para obtener traducciones
  const t = (key: string): string => {
    if (!isLoaded) return key

    const langTranslations = translations[currentLanguage.code]
    if (!langTranslations) return key

    return langTranslations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

