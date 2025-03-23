import { ImageResponse } from "next/og"

// Ruta: app/opengraph-image.tsx
export const alt = "BarkAndMeow - Red Social para Mascotas"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  // Puedes usar tu logo en la imagen de Open Graph
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#333",
        padding: 48,
      }}
    >
      {/* Aquí puedes usar una imagen de fondo o tu logo */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <img
          src={`${process.env.NEXT_PUBLIC_APP_URL || "https://barkandmeow-latest.onrender.com"}/BarkAndMeow.png`}
          width={120}
          height={120}
          alt="Logo"
          style={{ marginRight: 24 }}
        />
        <div style={{ fontSize: 72, fontWeight: "bold" }}>BarkAndMeow</div>
      </div>
      <div style={{ fontSize: 36, textAlign: "center", maxWidth: "80%" }}>Red Social para Mascotas y sus Dueños</div>
    </div>,
    { ...size },
  )
}

