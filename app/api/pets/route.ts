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

    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        type,
        breed,
        age,
        image: imageUrl,
        description,
        userId: session.user.id,
      },
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error("Error adding pet:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

