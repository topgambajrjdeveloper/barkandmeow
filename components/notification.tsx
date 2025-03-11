import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

type NotificationType = "success" | "error" | "info"

interface NotificationProps {
  type: NotificationType
  title: string
  message: string
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export function Notification({ type, title, message }: NotificationProps) {
  const Icon = icons[type]

  return (
    <Alert
      variant={type === "error" ? "destructive" : type === "success" ? "default" : "secondary"}
      className="text-sm"
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
      <AlertDescription className="text-xs">{message}</AlertDescription>
    </Alert>
  )
}

