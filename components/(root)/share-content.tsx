/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle, Mail, Check, AtSign } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ShareContentProps {
  url?: string
  title?: string
  description?: string
  image?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
  triggerClassName?: string
}

export function ShareContent({
  url = window.location.href,
  title = document.title,
  description = "",
  image = "",
  variant = "outline",
  size = "default",
  className = "",
  showLabel = true,
  triggerClassName = "",
}: ShareContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Verificar si la Web Share API está disponible
  const isWebShareAvailable = typeof navigator !== "undefined" && !!navigator.share

  // Función para compartir usando la Web Share API nativa
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: description,
        url,
      })
      toast.success("Contenido compartido")
      setIsOpen(false)
    } catch (error) {
      // El usuario canceló o hubo un error
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Error al compartir")
      }
    }
  }

  // Función para copiar el enlace al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Enlace copiado al portapapeles")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Funciones para compartir en redes sociales específicas
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
    setIsOpen(false)
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
    )
    setIsOpen(false)
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    setIsOpen(false)
  }

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, "_blank")
    setIsOpen(false)
  }

  const shareByEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
      "_blank",
    )
    setIsOpen(false)
  }

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank")
    setIsOpen(false)
  }

  // Función para compartir en Threads
  const shareOnThreads = () => {
    // Threads no tiene una API de compartir directa, pero podemos abrir la app/web
    // y el usuario puede copiar/pegar el contenido
    window.open("https://www.threads.net", "_blank")

    // Copiamos el contenido al portapapeles para facilitar compartir
    navigator.clipboard.writeText(`${title}\n\n${description}\n\n${url}`)
    toast.success("Contenido copiado para compartir en Threads")

    setIsOpen(false)
  }

  // Si la Web Share API está disponible y no estamos en un popover, usar directamente
  if (isWebShareAvailable && !isOpen) {
    return (
      <div className={triggerClassName || className} onClick={handleNativeShare} role="button" tabIndex={0}>
        <Share2 className="h-4 w-4 mr-2" />
        {showLabel && "Compartir"}
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={`inline-flex items-center justify-center gap-1 cursor-pointer ${triggerClassName || className}`}
          role="button"
          tabIndex={0}
        >
          <Share2 className="h-4 w-4" />
          {showLabel && <span>Compartir</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Compartir en redes sociales</h3>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnFacebook}
                title="Compartir en Facebook"
              >
                <Facebook className="h-5 w-5 text-[#1877F2]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnTwitter}
                title="Compartir en Twitter/X"
              >
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnThreads}
                title="Compartir en Threads"
              >
                <AtSign className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnWhatsApp}
                title="Compartir en WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnTelegram}
                title="Compartir en Telegram"
              >
                <MessageCircle className="h-5 w-5 text-[#0088cc]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareOnLinkedIn}
                title="Compartir en LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={shareByEmail}
                title="Compartir por correo"
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">O copiar enlace</h3>
            <div className="flex items-center space-x-2">
              <div className="border rounded-md px-3 py-2 flex-1 bg-muted text-xs truncate">{url}</div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={copyToClipboard}
                title={copied ? "Copiado" : "Copiar enlace"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isWebShareAvailable && (
            <Button variant="default" className="w-full" onClick={handleNativeShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir con aplicaciones
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

