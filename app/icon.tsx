import { ImageResponse } from "next/og"

// Ruta: app/icon.tsx
// Este componente genera un icono dinámico para tu aplicación
export function generateImageMetadata() {
  return [
    {
      contentType: "image/png",
      size: { width: 48, height: 48 },
      id: "small",
    },
    {
      contentType: "image/png",
      size: { width: 72, height: 72 },
      id: "medium",
    },
    {
      contentType: "image/png",
      size: { width: 96, height: 96 },
      id: "large",
    },
    {
      contentType: "image/png",
      size: { width: 180, height: 180 },
      id: "apple-touch-icon",
    },
    {
      contentType: "image/png",
      size: { width: 192, height: 192 },
      id: "android-chrome-192",
    },
    {
      contentType: "image/png",
      size: { width: 512, height: 512 },
      id: "android-chrome-512",
    },
  ]
}

export default function Icon({ id }: { id: string }) {
  // Selecciona el tamaño basado en el ID
  const { width, height } =
    id === "small"
      ? { width: 48, height: 48 }
      : id === "medium"
        ? { width: 72, height: 72 }
        : id === "large"
          ? { width: 96, height: 96 }
          : id === "apple-touch-icon"
            ? { width: 180, height: 180 }
            : id === "android-chrome-192"
              ? { width: 192, height: 192 }
              : { width: 512, height: 512 }

  return new ImageResponse(
    <div
      style={{
        fontSize: width * 0.5,
        background: "linear-gradient(to bottom right, #6366F1, #8B5CF6)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: width * 0.2,
        color: "white",
        fontWeight: "bold",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>B&M</div>
    </div>,
    { width, height },
  )
}

