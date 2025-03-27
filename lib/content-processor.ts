// lib/content-processor.ts
// Archivo centralizado para procesar contenido con hashtags y menciones

/**
 * Procesa el contenido del post para convertir hashtags y menciones en enlaces
 */
export function processContent(content: string) {
  if (!content) return ""

  let processedContent = content

  // Procesar hashtags
  processedContent = processedContent.replace(
    /#(\w+)/g,
    '<a href="/hashtag/$1" class="text-blue-500 hover:underline">#$1</a>',
  )

  // Procesar menciones de usuario - asegúrate de que la ruta coincida con tu estructura
  processedContent = processedContent.replace(
    /@(\w+)/g,
    '<a href="/user/$1" class="text-blue-500 hover:underline">@$1</a>',
  )

  // Procesar menciones de mascotas - asegúrate de que la ruta coincida con tu estructura
  processedContent = processedContent.replace(
    /@pet:(\w+)/g,
    '<a href="/pet/$1" class="text-blue-500 hover:underline">@pet:$1</a>',
  )

  return processedContent
}

/**
 * Genera texto para la vista previa con hashtags y menciones procesados
 */
export function generatePreviewContent(
  content: string,
  hashtags: string[] = [],
  taggedUsers: { id: string; username: string }[] = [],
  taggedPets: { id: string; name: string }[] = [],
) {
  if (!content) return ""

  let previewContent = content

  // Añadir hashtags al final si no están ya en el contenido
  hashtags.forEach((tag) => {
    if (!content.includes(`#${tag}`)) {
      previewContent += ` #${tag}`
    }
  })

  // Añadir menciones de usuario al final si no están ya en el contenido
  taggedUsers.forEach((user) => {
    if (!content.includes(`@${user.username}`)) {
      previewContent += ` @${user.username}`
    }
  })

  // Añadir menciones de mascotas al final si no están ya en el contenido
  taggedPets.forEach((pet) => {
    if (!content.includes(`@pet:${pet.id}`)) {
      previewContent += ` @pet:${pet.id}`
    }
  })

  // Procesar el contenido para la vista previa
  return processContent(previewContent)
}

