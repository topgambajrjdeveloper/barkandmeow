import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Sin conexión</h1>
      <p className="text-gray-600 mb-6">
        Parece que no tienes conexión a internet. Algunas funciones pueden no estar disponibles.
      </p>
      <Button asChild>
        <Link href="/">Intentar nuevamente</Link>
      </Button>
    </div>
  )
}

