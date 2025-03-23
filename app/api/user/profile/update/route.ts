import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { profileWithPetFormSchema } from "@/lib/validations"
import prisma from "@/lib/prismadb"

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      console.log("No hay sesión de usuario autenticada")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Actualizando perfil para el usuario:", userId)

    const data = await request.json()
    console.log("Datos recibidos:", data)

    // Validar los datos recibidos
    const validationResult = profileWithPetFormSchema.safeParse(data)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      console.log("Datos inválidos:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Verificar si el nombre de usuario ya está en uso (excepto por el usuario actual)
    if (validatedData.username !== session.user.name) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: userId },
        },
      })

      if (existingUser) {
        console.log("Nombre de usuario ya en uso:", validatedData.username)
        return NextResponse.json({ error: "El nombre de usuario ya está en uso" }, { status: 400 })
      }
    }

    try {
      // Actualizar el perfil del usuario
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username: validatedData.username,
          bio: validatedData.bio, // Incluimos el campo bio
          petName: validatedData.petName,
          petType: validatedData.petType,
          location: validatedData.location,
          isPublicProfile: validatedData.isPublicProfile,
          profileImage: validatedData.profileImage,
          petImage: validatedData.petImage,
        },
      })

      console.log("Perfil actualizado correctamente:", updatedUser.id)

      // Devolver todos los campos actualizados para que el cliente pueda actualizar su estado
      return NextResponse.json({
        message: "Perfil actualizado correctamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio, // Incluimos el campo bio
          petName: updatedUser.petName,
          petType: updatedUser.petType,
          location: updatedUser.location,
          isPublicProfile: updatedUser.isPublicProfile,
          profileImage: updatedUser.profileImage,
          petImage: updatedUser.petImage,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      })
    } catch (dbError) {
      console.error("Error de base de datos al actualizar el perfil:", dbError)
      return NextResponse.json(
        {
          error: "Error al actualizar el perfil en la base de datos",
          details: dbError instanceof Error ? dbError.message : "Error desconocido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error general al actualizar el perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

