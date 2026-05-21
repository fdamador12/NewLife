import type { Area } from 'react-easy-crop'

/**
 * Recorta una imagen usando Canvas API.
 *
 * Toma una URL de imagen (puede ser un Blob URL local) y un área de recorte
 * definida en píxeles, y devuelve un Blob con la imagen recortada.
 *
 * El resultado es un JPEG/PNG según el formato original — el backend lo convertirá
 * a WebP al subirlo, así que aquí no nos preocupamos por la conversión.
 *
 * @param imageSrc URL de la imagen a recortar (puede ser Blob URL)
 * @param pixelCrop Área de recorte en píxeles {x, y, width, height}
 * @param outputType Tipo MIME del output. Default: 'image/jpeg' (más compatible)
 * @param quality Calidad 0-1 (solo aplica a JPEG). Default: 0.92
 */
export async function cropImage(
  imageSrc: string,
  pixelCrop: Area,
  outputType: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas.')
  }

  // Dimensiones del canvas = dimensiones del área recortada
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Fondo blanco para evitar transparencias raras al pasar a JPEG
  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Dibuja solo el área recortada de la imagen original
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar el blob de la imagen recortada.'))
          return
        }
        resolve(blob)
      },
      outputType,
      quality,
    )
  })
}

/**
 * Carga una imagen desde una URL y devuelve la promesa cuando esté lista.
 * Maneja CORS para imágenes externas.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    // Necesario si la imagen viene de otro dominio
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

/**
 * Convierte un File a una Blob URL temporal para preview en navegador.
 * Recuerda revocar la URL con URL.revokeObjectURL() cuando ya no la uses
 * para evitar memory leaks.
 */
export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}