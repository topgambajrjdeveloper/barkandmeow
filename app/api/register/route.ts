import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import prisma from "@/lib/prismadb"
import { uploadImage } from "@/lib/cloudinary"
import { sendConfirmationEmail } from "@/lib/email"

// Lista de tipos de mascotas válidos
const validPetTypes = ["Perro", "Gato", "Ave", "Pez", "Reptil", "Otro"]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Datos del usuario
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const profileImage = formData.get("profileImage") as File | null
    const isPublicProfile = formData.get("isPublicProfile") === "true"
    const location = formData.get("location") as string
    const latitude = Number.parseFloat(formData.get("latitude") as string) || null
    const longitude = Number.parseFloat(formData.get("longitude") as string) || null

    // Datos de la mascota
    const petName = formData.get("petName") as string
    const petType = formData.get("petType") as string
    const petImage = formData.get("petImage") as File | null

    // Validaciones básicas
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Validar que el tipo de mascota sea uno de los permitidos
    if (petType && !validPetTypes.includes(petType)) {
      return NextResponse.json({ error: "Tipo de mascota no válido" }, { status: 400 })
    }

    // Verificar si el correo ya está registrado
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUserByEmail) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 })
    }

    // Verificar si el nombre de usuario ya está registrado
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUserByUsername) {
      return NextResponse.json({ error: "El nombre de usuario ya está registrado" }, { status: 400 })
    }

    // Procesar imagen de perfil si existe
    let profileImageUrl = null
    if (profileImage) {
      profileImageUrl = await uploadImage(profileImage)
    }

    // Procesar imagen de la mascota si existe
    let petImageUrl = null
    if (petImage) {
      petImageUrl = await uploadImage(petImage)
    }

    // Hashear la contraseña usando bcryptjs
    const hashedPassword = await hash(password, 10)

    // Generar token de confirmación
    const confirmationToken = randomBytes(32).toString("hex")

    // Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profileImage: profileImageUrl,
        role: "USER", // Asignar rol por defecto
        isPublicProfile,
        location,
        latitude,
        longitude,
        isEmailConfirmed: false, // El email no está confirmado inicialmente
        confirmationToken, // Guardar el token de confirmación
      },
    })

    // Si se proporcionó información de mascota, crear la mascota
    if (petName && petType) {
      // Crear la mascota asociada al usuario
      await prisma.pet.create({
        data: {
          name: petName,
          type: petType,
          image: petImageUrl,
          userId: user.id,
        },
      })
    }

    // Enviar email de confirmación
    try {
      await sendConfirmationEmail(email, confirmationToken)
     
    } catch (emailError) {
      console.error("Error al enviar email de confirmación:", emailError)
      // No fallamos el registro si el email falla, solo lo registramos
    }

    return NextResponse.json(
      {
        message:
          "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para confirmar tu cuenta.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

