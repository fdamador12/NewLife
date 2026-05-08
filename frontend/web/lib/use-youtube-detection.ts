import { useState, useEffect, useRef } from "react"
import {
  extractYouTubeVideoId,
  findBestYouTubeThumbnail,
} from "./youtube"

/**
 * Estado del proceso de detección de YouTube.
 */
export interface YouTubeDetection {
  /** True si la URL es válida de YouTube (incluso mientras se procesa). */
  isYouTube: boolean
  /** Video ID extraído (null si no es YouTube). */
  videoId: string | null
  /** URL de la mejor miniatura disponible. null si aún se está buscando o no se encontró. */
  thumbnailUrl: string | null
  /** True mientras se está probando qué calidad de miniatura está disponible. */
  isLoadingThumbnail: boolean
  /** Error si falló la búsqueda de miniatura. */
  error: string | null
}

/**
 * Hook que monitorea un campo de texto y, si detecta una URL de YouTube válida,
 * busca automáticamente la mejor miniatura disponible.
 *
 * Implementa debounce de 500ms para no hacer peticiones mientras el usuario tipea.
 */
export function useYouTubeDetection(url: string): YouTubeDetection {
  const [state, setState] = useState<YouTubeDetection>({
    isYouTube: false,
    videoId: null,
    thumbnailUrl: null,
    isLoadingThumbnail: false,
    error: null,
  })

  // Guardamos un ref para cancelar búsquedas viejas si el usuario sigue tipeando
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Si la URL está vacía → reset
    if (!url || url.trim() === "") {
      setState({
        isYouTube: false,
        videoId: null,
        thumbnailUrl: null,
        isLoadingThumbnail: false,
        error: null,
      })
      return
    }

    // Detección inmediata (sin debounce) para feedback visual rápido
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      setState({
        isYouTube: false,
        videoId: null,
        thumbnailUrl: null,
        isLoadingThumbnail: false,
        error: null,
      })
      return
    }

    // Es YouTube válido → buscar miniatura con debounce
    setState((prev) => ({
      ...prev,
      isYouTube: true,
      videoId,
      isLoadingThumbnail: true,
      error: null,
    }))

    const currentRequestId = ++requestIdRef.current

    const timeoutId = setTimeout(async () => {
      try {
        const thumbnailUrl = await findBestYouTubeThumbnail(videoId)

        // Si mientras buscábamos la miniatura, otra petición se inició,
        // descartamos este resultado para evitar race conditions
        if (currentRequestId !== requestIdRef.current) return

        setState({
          isYouTube: true,
          videoId,
          thumbnailUrl,
          isLoadingThumbnail: false,
          error: thumbnailUrl ? null : "No se encontró miniatura para este video",
        })
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return
        setState({
          isYouTube: true,
          videoId,
          thumbnailUrl: null,
          isLoadingThumbnail: false,
          error: "Error al buscar miniatura",
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [url])

  return state
}