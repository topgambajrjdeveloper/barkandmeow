import { z } from "zod"

// Función auxiliar para fechas opcionales
export const optionalDateString = z
  .string()
  .nullable()
  .optional()
  .refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  })

export const registerSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  profileImage: z.any().optional(),
  petName: z.string().min(1, "El nombre de la mascota es requerido"),
  petType: z.string().min(1, "El tipo de mascota es requerido"),
  petImage: z.any().optional(),
  isPublicProfile: z.boolean().default(true),
  location: z.string().min(2, "La localización debe tener al menos 2 caracteres").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const newPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
})

// Esquema de validación para el formulario de edición de perfil
export const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  bio: z
    .string()
    .max(160, {
      message: "La biografía no puede tener más de 160 caracteres.",
    })
    .optional(),
  location: z
    .string()
    .max(100, {
      message: "La ubicación no puede tener más de 100 caracteres.",
    })
    .optional(),
  isPublicProfile: z.boolean().default(true),
  profileImage: z.string().optional(),
})

// Esquema de validación para el formulario de perfil completo (incluye mascota)
export const profileWithPetFormSchema = z.object({
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  bio: z
    .string()
    .max(160, {
      message: "La biografía no puede tener más de 160 caracteres.",
    })
    .optional(),
  petName: z.string().min(1, {
    message: "El nombre de la mascota es obligatorio.",
  }),
  petType: z.string().min(1, {
    message: "El tipo de mascota es obligatorio.",
  }),
  location: z.string().optional(),
  isPublicProfile: z.boolean().default(true),
  profileImage: z.string().optional(),
  petImage: z.string().optional(),
})

// Esquema de validación para el pasaporte
export const passportSchema = z.object({
  passportNumber: z.string().min(1, "El número de pasaporte es requerido"),
  issuedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de emisión inválida",
  }),
  expiryDate: optionalDateString,
  issuingCountry: z.string().min(1, "El país emisor es requerido"),
  microchipNumber: z.string().nullable().optional(),
  species: z.string().min(1, "La especie es requerida"),
  breed: z.string().min(1, "La raza es requerida"),
  sex: z.enum(["male", "female"], {
    errorMap: () => ({ message: "El sexo debe ser 'male' o 'female'" }),
  }),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de nacimiento inválida",
  }),
  transponderCode: z.string().nullable().optional(),
  transponderReadDate: optionalDateString,
  transponderLocation: z.string().nullable().optional(),
  tattooCode: z.string().nullable().optional(),
  tattooDate: optionalDateString,
  tattooLocation: z.string().nullable().optional(),
  veterinarianName: z.string().min(1, "El nombre del veterinario es requerido"),
  clinicAddress: z.string().min(1, "La dirección de la clínica es requerida"),
  clinicPostalCode: z.string().min(1, "El código postal de la clínica es requerido"),
  clinicCity: z.string().min(1, "La ciudad de la clínica es requerida"),
  clinicCountry: z.string().min(1, "El país de la clínica es requerido"),
  clinicPhone: z.string().min(1, "El teléfono de la clínica es requerido"),
  clinicEmail: z.string().email("Email de la clínica inválido"),
})

export const healthCardSchema = z.object({
  veterinarianName: z.string().min(1, "El nombre del veterinario es requerido"),
  clinicName: z.string().min(1, "El nombre de la clínica es requerido"),
  clinicAddress: z.string().min(1, "La dirección de la clínica es requerida"),
  clinicPhone: z.string().min(1, "El teléfono de la clínica es requerido"),
  clinicEmail: z.string().email("Email de la clínica inválido"),
  lastCheckupDate: optionalDateString,
  nextCheckupDate: optionalDateString,
  notes: z.string().optional(),
})

// Esquema para vacunas
export const vaccinationSchema = z.object({
  name: z.string().min(1, "El nombre de la vacuna es requerido"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de vacunación inválida",
  }),
  nextDueDate: optionalDateString,
  veterinarian: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// Esquema para medicamentos
export const medicationSchema = z.object({
  name: z.string().min(1, "El nombre del medicamento es requerido"),
  dosage: z.string().min(1, "La dosis es requerida"),
  frequency: z.string().min(1, "La frecuencia es requerida"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  endDate: optionalDateString,
  notes: z.string().optional(),
})

// Esquema para registros médicos
export const medicalRecordSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha del registro inválida",
  }),
  description: z.string().min(1, "La descripción es requerida"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  veterinarianName: z.string().optional(),
  notes: z.string().optional(),
})

// Esquema para el formulario de contacto
export const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
  subject: z.string().min(5, {
    message: "El asunto debe tener al menos 5 caracteres.",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type NewPasswordInput = z.infer<typeof newPasswordSchema>
export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type ProfileWithPetFormValues = z.infer<typeof profileWithPetFormSchema>
export type PassportFormValues = z.infer<typeof passportSchema>
export type HealthCardFormValues = z.infer<typeof healthCardSchema>
export type VaccinationFormValues = z.infer<typeof vaccinationSchema>
export type MedicationFormValues = z.infer<typeof medicationSchema>
export type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>
export type ContactFormValues = z.infer<typeof contactFormSchema>

// Añadimos el alias de tipo PassportData
export type PassportData = PassportFormValues

