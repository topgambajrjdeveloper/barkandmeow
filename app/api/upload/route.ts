import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el archivo de la solicitud
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar el tipo de archivo
    if (!file.type.includes("image")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar el tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar los 5MB" }, { status: 400 })
    }

    // Convertir el archivo a un buffer para Cloudinary
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a Cloudinary
    const uploadPromise = new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "petsocial" },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error)
            reject(new Error("Failed to upload image"))
          } else {
            resolve(result.secure_url)
          }
        }
      )

      uploadStream.end(buffer)
    })

    const imageUrl = await uploadPromise
    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    )
  }
}
