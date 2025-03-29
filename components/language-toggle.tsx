"use client"

import { useState, useEffect } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Language = {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
]

export function LanguageToggle() {
  // Estado para el idioma actual (por defecto español)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente solo se renderice en el cliente
  useEffect(() => {
    setMounted(true)

    // Aquí podrías obtener el idioma guardado en localStorage o cookies
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      const lang = languages.find((l) => l.code === savedLanguage)
      if (lang) setCurrentLanguage(lang)
    }
  }, [])

  // Función para cambiar el idioma
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem("language", language.code)

    // Aquí implementarías la lógica para cambiar el idioma en toda la aplicación
    // Por ejemplo, usando i18n o un contexto global
    console.log(`Cambiando idioma a: ${language.name}`)

    // Ejemplo: document.documentElement.lang = language.code
  }

  // No renderizar nada durante SSR para evitar errores de hidratación
  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Cambiar idioma</span>
          <span className="absolute -bottom-1 text-center text-[11px]">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentLanguage.code === language.code && "font-bold bg-muted",
            )}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage.code === language.code && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

