"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Crop as CropIcon,
} from "lucide-react"
import { cropImage, fileToObjectUrl } from "@/lib/crop-image"

// ── Tipos ──────────────────────────────────────────────────────────────────

export type AspectRatio = "1:1" | "16:9" | "3:1" | "free"

/**
 * Estado interno de la imagen seleccionada.
 *
 * - file: el File real que se subirá al guardar el formulario
 * - previewUrl: URL temporal del navegador (Blob URL) para mostrar el preview
 * - existingUrl: URL existente en MinIO (cuando se está editando un grupo con logo previo)
 * - externalUrl: URL externa a descargar al guardar (ej: miniatura de YouTube)
 *                Es como existingUrl pero la subimos a MinIO en vez de mantenerla.
 */
export interface ImageUploaderValue {
  /** File con la imagen final (después del crop si aplicó). undefined si no hay cambios. */
  file?: File
  /** URL del preview a mostrar. Puede ser Blob URL local o URL pública de MinIO. */
  previewUrl?: string
  /** URL pública existente (para edición). Se mantiene si el usuario no cambia la imagen. */
  existingUrl?: string
  /** URL externa pendiente de descargar y subir al guardar (ej: miniatura YouTube). */
  externalUrl?: string
  /** True si el usuario quiere QUITAR la imagen existente sin reemplazarla. */
  removed?: boolean
}

interface ImageUploaderProps {
  /** Valor controlado del componente */
  value: ImageUploaderValue
  /** Callback cuando cambia el valor */
  onChange: (value: ImageUploaderValue) => void
  /** Aspect ratio del crop. Default: '1:1' */
  aspectRatio?: AspectRatio
  /** Tamaño máximo de archivo en MB. Default: 5 */
  maxSizeMB?: number
  /** Texto descriptivo (ej: "Logo del grupo") */
  label?: string
  /** Texto de ayuda secundario */
  hint?: string
  /** Clases CSS extra para el contenedor */
  className?: string
  /** Si está deshabilitado */
  disabled?: boolean
}

// ── Constantes ─────────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ACCEPTED_EXTENSIONS_LABEL = "JPG, PNG o WebP"

const ASPECT_RATIO_VALUES: Record<AspectRatio, number | undefined> = {
  "1:1": 1,
  "16:9": 16 / 9,
  "3:1": 3,
  free: undefined,
}

// ── Componente ─────────────────────────────────────────────────────────────

/**
 * Componente reutilizable para subir imágenes.
 *
 * Características:
 * - Drag & drop o click para seleccionar archivo
 * - Validación de tipo MIME y tamaño en cliente
 * - Crop interactivo con zoom (modal)
 * - Preview del resultado
 * - Botón para quitar imagen
 * - Soporta URLs externas (miniaturas de YouTube) que se descargan al guardar
 *
 * IMPORTANTE: este componente NO sube nada al backend por sí solo.
 * Solo prepara el File. La subida ocurre cuando el formulario padre
 * llama a `uploadImage()` antes de guardar el grupo/contenido/etc.
 */
export function ImageUploader({
  value,
  onChange,
  aspectRatio = "1:1",
  maxSizeMB = 5,
  label = "Imagen",
  hint,
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("")
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessingCrop, setIsProcessingCrop] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const aspectValue = ASPECT_RATIO_VALUES[aspectRatio]

  // Limpieza de Blob URLs al desmontar — previene memory leaks
  useEffect(() => {
    return () => {
      if (value.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(value.previewUrl)
      }
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Validación + apertura del crop ───────────────────────────────────────

  const validateAndOpenCrop = useCallback(
    (file: File) => {
      setError("")

      // Tipo MIME
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        setError(`Formato no soportado. Usa ${ACCEPTED_EXTENSIONS_LABEL}.`)
        return
      }

      // Tamaño
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        setError(`El archivo excede el límite de ${maxSizeMB} MB.`)
        return
      }

      const url = fileToObjectUrl(file)
      setOriginalFile(file)
      setOriginalImageUrl(url)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setShowCropModal(true)
    },
    [maxSizeMB],
  )

  // ── Eventos del input file ───────────────────────────────────────────────

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndOpenCrop(file)
    }
    // Resetea para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ""
  }

  const handleClickToSelect = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndOpenCrop(file)
    }
  }

  // ── Crop callbacks ───────────────────────────────────────────────────────

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPx: Area) => {
    setCroppedAreaPixels(croppedAreaPx)
  }, [])

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !originalImageUrl || !originalFile) return

    setIsProcessingCrop(true)
    try {
      const blob = await cropImage(originalImageUrl, croppedAreaPixels, "image/jpeg", 0.92)

      // Convertimos el Blob a File para conservar nombre y para que multipart funcione bien
      const croppedFile = new File([blob], originalFile.name, { type: "image/jpeg" })
      const newPreviewUrl = URL.createObjectURL(blob)

      // Liberamos la preview anterior si era Blob URL
      if (value.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(value.previewUrl)
      }

      onChange({
        file: croppedFile,
        previewUrl: newPreviewUrl,
        existingUrl: value.existingUrl,
        externalUrl: undefined, // si había URL externa, queda invalidada por el upload manual
        removed: false,
      })

      // Cleanup del modal
      URL.revokeObjectURL(originalImageUrl)
      setOriginalImageUrl("")
      setOriginalFile(null)
      setShowCropModal(false)
    } catch (err) {
      console.error("Error al recortar:", err)
      setError("No se pudo procesar la imagen. Intenta con otra.")
      setShowCropModal(false)
    } finally {
      setIsProcessingCrop(false)
    }
  }

  const handleCancelCrop = () => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl)
    setOriginalImageUrl("")
    setOriginalFile(null)
    setShowCropModal(false)
  }

  // ── Quitar imagen ────────────────────────────────────────────────────────

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (value.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(value.previewUrl)
    }
    onChange({
      file: undefined,
      previewUrl: undefined,
      existingUrl: undefined,
      externalUrl: undefined,
      // Si había una URL existente, marcamos para borrar en backend al guardar
      removed: !!value.existingUrl,
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────

  // La imagen a mostrar, en orden de prioridad:
  // 1. previewUrl (Blob URL local de un upload reciente o crop)
  // 2. externalUrl (URL externa pendiente de subir, ej: miniatura YouTube)
  // 3. existingUrl (URL ya guardada en MinIO)
  const displayUrl = value.previewUrl || value.externalUrl || value.existingUrl
  const hasImage = !!displayUrl

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-[#1a1a1a]">
          {label}
        </label>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleFileSelected}
        className="hidden"
        disabled={disabled}
      />

      {/* Zona de upload / preview */}
      {!hasImage ? (
        <div
          onClick={handleClickToSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Subir imagen"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleClickToSelect()
            }
          }}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            "bg-[#f8f6f3] border-[#e5e5e5] hover:border-[#d4854a] hover:bg-[#d4854a]/5",
            isDragging && "border-[#d4854a] bg-[#d4854a]/10",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <Upload className="w-6 h-6 text-[#d4854a]" />
          </div>
          <p className="text-sm font-medium text-[#1a1a1a]">
            Haz click o arrastra una imagen aquí
          </p>
          <p className="text-xs text-[#737373]">
            {ACCEPTED_EXTENSIONS_LABEL} · Máx. {maxSizeMB} MB
          </p>
          {hint && <p className="text-xs text-[#a3a3a3] mt-1">{hint}</p>}
        </div>
      ) : (
        <div className="relative group">
          <div
            className={cn(
              "relative rounded-lg overflow-hidden bg-[#f8f6f3] border border-[#e5e5e5]",
              aspectRatio === "1:1" && "aspect-square max-w-[200px]",
              aspectRatio === "16:9" && "aspect-video",
              aspectRatio === "3:1" && "aspect-[3/1]",
              aspectRatio === "free" && "min-h-[120px]",
            )}
          >
            {displayUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClickToSelect}
              disabled={disabled}
              className="border-[#e5e5e5] text-[#737373] hover:bg-[#f8f6f3] gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Cambiar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
            >
              <X className="w-4 h-4" />
              Quitar
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal de Crop */}
      <Dialog open={showCropModal} onOpenChange={(open) => !open && handleCancelCrop()}>
        <DialogContent className="bg-white border-[#e5e5e5] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-[#d4854a]" />
              Ajustar imagen
            </DialogTitle>
            <DialogDescription className="text-[#737373]">
              Arrastra para mover · usa el zoom para ajustar el encuadre
            </DialogDescription>
          </DialogHeader>

          {/* Zona de crop */}
          <div className="relative w-full h-[400px] bg-[#1a1a1a] rounded-lg overflow-hidden">
            {originalImageUrl && (
              <Cropper
                image={originalImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspectValue}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                cropShape="rect"
              />
            )}
          </div>

          {/* Controles de zoom */}
          <div className="flex items-center gap-3 px-1">
            <ZoomOut className="w-4 h-4 text-[#737373] flex-shrink-0" />
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.01}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-[#737373] flex-shrink-0" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelCrop}
              disabled={isProcessingCrop}
              className="border-[#e5e5e5] text-[#737373] hover:bg-[#f8f6f3]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isProcessingCrop || !croppedAreaPixels}
              className="bg-[#d4854a] hover:bg-[#c07842] text-white"
            >
              {isProcessingCrop ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CropIcon className="w-4 h-4 mr-2" />
              )}
              Aplicar recorte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}