import api from './axios'

// ── Tipos ──────────────────────────────────────────────────────────────────

/**
 * Categorías válidas para organizar imágenes en el bucket.
 * Debe coincidir con ALLOWED_CATEGORIES del backend.
 */
export type ImageCategory = 'covers' | 'avatars' | 'banners' | 'challenges' | 'misc'

/**
 * Respuesta del backend cuando se sube una imagen exitosamente.
 */
export interface UploadedFileResponse {
  key: string           // ej: "avatars/abc-123.webp"
  url: string           // URL pública para mostrar la imagen
  bucket: 'public' | 'private'
  mimeType: string      // siempre "image/webp" tras el procesamiento
  size: number          // bytes después del procesamiento
  width: number
  height: number
  uploadedAt: string
}

// ── Funciones ──────────────────────────────────────────────────────────────

/**
 * Sube una imagen al bucket público.
 * El backend valida tipo MIME real, redimensiona, elimina EXIF y convierte a WebP.
 *
 * @param file Archivo de imagen (jpg, png, webp). Máx. 5 MB.
 * @param category Categoría que organiza la imagen en el bucket
 * @returns Datos de la imagen subida, incluyendo la URL pública
 */
export async function uploadImage(
  file: File | Blob,
  category: ImageCategory,
): Promise<UploadedFileResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const res = await api.post<UploadedFileResponse>('/api/web/media/upload', formData, {
    headers: {
      // Axios y el navegador setean automáticamente el boundary correcto
      // cuando dejas que el header se construya solo. Forzar 'Content-Type'
      // aquí rompería el parseo en el backend.
      'Content-Type': 'multipart/form-data',
    },
    // Sin timeout custom → axios usa el default; las imágenes son pequeñas
  })

  return res.data
}

/**
 * Borra una imagen del bucket público.
 *
 * @param key Key completa del archivo (ej: "avatars/abc-123.webp")
 *            o URL completa de la imagen — la función extrae la key automáticamente.
 */
export async function deleteImage(keyOrUrl: string): Promise<void> {
  const key = isUrl(keyOrUrl) ? extractKeyFromUrl(keyOrUrl) : keyOrUrl

  if (!key) {
    throw new Error('No se pudo determinar la key del archivo a borrar.')
  }

  // El endpoint del backend espera /:category/:filename, no /:key con slashes,
  // así que separamos la key en sus dos partes.
  const [category, filename] = key.split('/')
  if (!category || !filename) {
    throw new Error(`Formato de key inválido: "${key}"`)
  }

  await api.delete(`/api/web/media/${category}/${filename}`)
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Detecta si un string es una URL HTTP(S).
 */
function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

/**
 * Extrae la key (categoria/uuid.ext) de una URL pública de MinIO.
 * Ejemplo:
 *   "http://localhost:5183/newlife-public/avatars/abc.webp"
 *   → "avatars/abc.webp"
 *
 * Acepta cualquier endpoint base (localhost, dominios de producción, etc.).
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // El path típico es: /newlife-public/avatars/abc.webp
    // Quitamos el prefijo del bucket y nos quedamos con el resto.
    const parts = parsed.pathname.split('/').filter(Boolean)
    // parts = ["newlife-public", "avatars", "abc.webp"]
    if (parts.length < 3) return null
    // Devolvemos todo excepto el primer segmento (el bucket)
    return parts.slice(1).join('/')
  } catch {
    return null
  }
}