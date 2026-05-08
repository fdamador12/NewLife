import type { ImageUploaderValue } from "@/components/admin/image-uploader"
import {
  uploadImage,
  deleteImage,
  type ImageCategory,
} from "./media"
import { downloadYouTubeThumbnail } from "./youtube"

/**
 * Resultado de procesar el estado de un ImageUploader.
 *
 * - undefined: el campo no debe enviarse al backend (no cambió nada)
 * - null: el campo debe enviarse como null al backend (se borró la imagen)
 * - string: nueva URL para enviar al backend
 */
export type ProcessedImageUrl = string | null | undefined

/**
 * Procesa el estado de un ImageUploader y devuelve la URL final que debe
 * persistirse en el backend. Maneja los 4 escenarios:
 *
 * 1. Sin cambios → undefined (no se envía el campo)
 * 2. File nuevo (subida o crop) → sube a MinIO, devuelve URL pública
 * 3. URL externa (miniatura YouTube) → descarga, sube a MinIO, devuelve URL pública
 * 4. Quitada (removed:true) → null
 *
 * Nota: este helper NO borra la imagen vieja. Eso lo hace el caller después
 * de que la actualización del recurso fue exitosa, para no tener side-effects
 * si algo intermedio falla.
 *
 * @param state Estado del ImageUploader
 * @param category Categoría donde subir la imagen (avatars, covers, etc.)
 */
export async function processImageState(
  state: ImageUploaderValue,
  category: ImageCategory,
): Promise<ProcessedImageUrl> {
  // Caso 4: usuario quitó la imagen sin reemplazar
  if (state.removed) {
    return null
  }

  // Caso 2: hay un File local (recortado o subido) → subir
  if (state.file) {
    const uploaded = await uploadImage(state.file, category)
    return uploaded.url
  }

  // Caso 3: hay una URL externa (miniatura YouTube) → descargar + subir
  if (state.externalUrl) {
    const blob = await downloadYouTubeThumbnail(state.externalUrl)
    // Convertimos a File con extensión .jpg para que multipart funcione
    const file = new File([blob], "youtube-thumbnail.jpg", { type: "image/jpeg" })
    const uploaded = await uploadImage(file, category)
    return uploaded.url
  }

  // Caso 1: sin cambios (la imagen existente sigue tal cual)
  return undefined
}

/**
 * Borra de MinIO una imagen vieja (existingUrl) si fue reemplazada o quitada.
 * No falla si el borrado da error — solo loggea, porque la operación principal
 * (crear/actualizar el recurso) ya tuvo éxito y no queremos rollback.
 *
 * @param oldUrl URL de la imagen vieja (puede ser undefined)
 * @param newUrl Resultado de processImageState (undefined si no cambió)
 */
export async function cleanupOldImage(
  oldUrl: string | undefined,
  newUrl: ProcessedImageUrl,
): Promise<void> {
  // Solo borramos si:
  // - había una imagen vieja
  // - Y el resultado del proceso fue distinto a "undefined" (sí hubo cambio)
  if (!oldUrl || newUrl === undefined) return

  try {
    await deleteImage(oldUrl)
  } catch (err) {
    console.warn("No se pudo borrar la imagen anterior:", err)
  }
}