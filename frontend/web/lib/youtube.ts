/**
 * Helpers para trabajar con URLs de YouTube.
 *
 * Soporta los 3 formatos comunes:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * Y maneja el caso pesado: YouTube devuelve un placeholder de 120x90 px
 * cuando un video no tiene versión HD, en vez de un 404. Por eso
 * `findBestThumbnail` prueba varias resoluciones y valida dimensiones.
 */

// ── Detección y extracción ─────────────────────────────────────────────────

/**
 * Extrae el ID de video de una URL de YouTube.
 * Devuelve null si la URL no es de YouTube o no tiene formato reconocido.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null

  const trimmed = url.trim()

  // Patrones soportados, en orden de probabilidad
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/shorts/VIDEO_ID (por si acaso)
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Detecta si una URL es de YouTube (incluye youtube.com y youtu.be).
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

// ── Miniaturas ─────────────────────────────────────────────────────────────

/**
 * Las URLs de miniaturas que YouTube genera, en orden de calidad descendente.
 * `maxresdefault` no siempre existe; `hqdefault` siempre existe (es el fallback seguro).
 */
const THUMBNAIL_QUALITIES = [
  { name: "maxresdefault", minWidth: 1280 },
  { name: "sddefault", minWidth: 640 },
  { name: "hqdefault", minWidth: 480 },
] as const

/**
 * Construye la URL de una miniatura de YouTube.
 */
function buildThumbnailUrl(videoId: string, quality: string): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Intenta cargar una imagen y resuelve con sus dimensiones reales.
 * Si la imagen no existe o falla la carga, rechaza con error.
 */
function probeImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => reject(new Error("Image load failed"))

    // Timeout de seguridad: si tarda más de 8s, abortamos
    const timeout = setTimeout(() => {
      reject(new Error("Image load timeout"))
    }, 8000)

    img.addEventListener("load", () => clearTimeout(timeout))
    img.addEventListener("error", () => clearTimeout(timeout))

    img.src = url
  })
}

/**
 * Encuentra la mejor miniatura disponible para un video de YouTube.
 *
 * Prueba en orden: maxresdefault → sddefault → hqdefault.
 * Detecta el caso del placeholder de 120x90 px (que YouTube devuelve cuando
 * no existe la calidad pedida) verificando que el ancho real sea suficiente.
 *
 * @returns URL de la mejor miniatura encontrada, o null si no hay ninguna válida
 */
export async function findBestYouTubeThumbnail(
  videoId: string,
): Promise<string | null> {
  for (const quality of THUMBNAIL_QUALITIES) {
    const url = buildThumbnailUrl(videoId, quality.name)
    try {
      const dimensions = await probeImage(url)
      // Si el ancho es suficiente, es una miniatura real (no placeholder)
      if (dimensions.width >= quality.minWidth) {
        return url
      }
      // Si dimensiones < esperado, es el placeholder de 120x90 → probar siguiente
    } catch {
      // Falló la carga → probar siguiente calidad
    }
  }

  return null
}

/**
 * Descarga una miniatura de YouTube como Blob para poder subirla a MinIO.
 *
 * Nota: `img.youtube.com` permite CORS para imágenes, así que esto funciona
 * desde el navegador sin proxy. Si en el futuro deja de funcionar (cambio de
 * política de Google), tendríamos que rutearlo a través de nuestro backend.
 *
 * @returns Blob de la imagen lista para subirse via FormData
 */
export async function downloadYouTubeThumbnail(thumbnailUrl: string): Promise<Blob> {
  const res = await fetch(thumbnailUrl, { mode: "cors" })
  if (!res.ok) {
    throw new Error(`No se pudo descargar la miniatura: HTTP ${res.status}`)
  }
  return res.blob()
}

/**
 * Función conveniencia: dada una URL de YouTube, devuelve directamente
 * la URL de su mejor miniatura disponible (o null si no es válida).
 */
export async function getThumbnailFromYouTubeUrl(
  youtubeUrl: string,
): Promise<string | null> {
  const videoId = extractYouTubeVideoId(youtubeUrl)
  if (!videoId) return null
  return findBestYouTubeThumbnail(videoId)
}