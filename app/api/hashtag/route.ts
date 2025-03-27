/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { validateHashtag } from "@/lib/posts"

export async function GET(request: NextRequest) {
  // Obtener la URL completa
  const url = request.url
  const { pathname, hash, searchParams } = new URL(url)

  // Verificar si hay un parámetro de búsqueda 'tag'
  const tagParam = searchParams.get("tag")

  // Verificar si hay un fragmento (parte después del #)
  const hashFragment = hash ? hash.substring(1) : null // Quitar el # inicial

  // Priorizar el parámetro de búsqueda sobre el fragmento
  const tag = tagParam || hashFragment

  // Si no hay tag, redirigir al feed
  if (!tag) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  // Limpiar el tag - eliminar caracteres especiales y espacios
  // Extraer solo el primer hashtag si hay varios
  let cleanTag = tag

  // Si el tag comienza con #, quitarlo
  if (cleanTag.startsWith("#")) {
    cleanTag = cleanTag.substring(1)
  }

  // Si hay múltiples hashtags, tomar solo el primero
  if (cleanTag.includes("#")) {
    cleanTag = cleanTag.split("#")[0].trim()
  }

  // Si hay espacios, tomar solo la primera palabra
  if (cleanTag.includes(" ")) {
    cleanTag = cleanTag.split(" ")[0].trim()
  }

  // Eliminar cualquier otro carácter no válido
  cleanTag = cleanTag.replace(/[^\w]/g, "")

  // Verificar si el tag limpio es válido
  if (!cleanTag || !validateHashtag(cleanTag)) {
    // Si el tag no es válido, devolver una página de error
    return NextResponse.json(
      {
        error: "Hashtag inválido",
        message:
          "El hashtag proporcionado no es válido. Los hashtags solo pueden contener letras, números y guiones bajos.",
        originalTag: tag,
        cleanedTag: cleanTag,
      },
      { status: 400 },
    )
  }

  // Si el tag es válido, redirigir a la página de hashtag
  return NextResponse.redirect(new URL(`/hashtag/${cleanTag}`, request.url))
}

