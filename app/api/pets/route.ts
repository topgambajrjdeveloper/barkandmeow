import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadImage } from "@/lib/cloudinary"
import prisma from "@/lib/prismadb"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const breed = formData.get("breed") as string
    const age = formData.get("age") ? Number(formData.get("age")) : null
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File | null

    // Verificar si es una conversión de mascota básica
    const isBasicPetConversion = formData.get("isBasicPetConversion") === "true"

    console.log("Datos recibidos para crear/actualizar mascota:", {
      name,
      type,
      breed: breed || "No especificada",
      age: age || "No especificada",
      description: description || "No especificada",
      tieneImagen: !!imageFile,
      esConversion: isBasicPetConversion,
    })

    // Obtener el usuario actual con su información de mascota básica
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        petName: true,
        petType: true,
        petImage: true,
      },
    })

    console.log("Información de usuario encontrada:", user)

    let imageUrl = null

    // Si se subió una nueva imagen, procesarla
    if (imageFile) {
      console.log("Procesando nueva imagen subida")
      imageUrl = await uploadImage(imageFile)
      console.log("Nueva imagen procesada:", imageUrl)
    }
    // Si no se subió imagen pero es una conversión y hay imagen existente, usarla
    else if (isBasicPetConversion && user?.petImage) {
      console.log("Usando imagen existente de la mascota básica:", user.petImage)
      imageUrl = user.petImage
    }

    // Verificar si coincide con la mascota básica del usuario
    let shouldClearBasicPet = false

    if (isBasicPetConversion && user?.petName === name) {
      console.log("La mascota coincide con la mascota básica del usuario, se limpiará después")
      shouldClearBasicPet = true
    }

    // Crear la mascota en la base de datos
    const pet = await prisma.pet.create({
      data: {
        name,
        type,
        breed: breed || null,
        age,
        image: imageUrl,
        description: description || null,
        userId: session.user.id,
      },
    })

    console.log("Mascota creada exitosamente:", pet)

    // Si es una conversión de mascota básica y coincide con la mascota básica del usuario,
    // limpiar los campos de mascota básica del usuario
    if (shouldClearBasicPet) {
      console.log("Limpiando campos de mascota básica del usuario")
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          petName: null,
          petType: null,
          petImage: null,
        },
      })
      console.log("Campos de mascota básica limpiados")
    }

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error("Error adding pet:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

