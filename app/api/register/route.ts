import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { registerSchema } from "@/lib/validations"
import { uploadImage } from "@/lib/cloudinary"
import { sendConfirmationEmail } from "@/lib/email"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {}

    for (const [key, value] of formData.entries()) {
      if (key === "isPublicProfile") {
        body[key] = value === "true"
      } else if (key === "latitude" || key === "longitude") {
        body[key] = value ? Number.parseFloat(value as string) : null
      } else if (key === "profileImage" || key === "petImage") {
        body[key] = value as File
      } else {
        body[key] = value
      }
    }

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }))
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { username, email, password, profileImage, petName, petType, petImage, isPublicProfile, location } =
      result.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El usuario o email ya existe" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Upload images to Cloudinary
    let profileImageUrl = null
    let petImageUrl = null

    if (profileImage instanceof File) {
      profileImageUrl = await uploadImage(profileImage)
    }

    if (petImage instanceof File) {
      petImageUrl = await uploadImage(petImage)
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex")

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profileImage: profileImageUrl,
        petName,
        petType,
        petImage: petImageUrl,
        isPublicProfile,
        location,
        latitude: body.latitude,
        longitude: body.longitude,
        confirmationToken,
        isEmailConfirmed: false,
      },
    })

    // Send confirmation email
    await sendConfirmationEmail(email, confirmationToken)

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword, message: "Usuario creado exitosamente. Por favor, verifica tu correo electrónico." },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error de registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

