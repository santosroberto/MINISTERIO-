"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  currentImage?: string | null
  onUpload: (file: File) => Promise<string | undefined>
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ currentImage, onUpload, onRemove, disabled, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    try {
      const url = await onUpload(file)
      if (!url) {
        setPreview(currentImage || null)
        URL.revokeObjectURL(objectUrl)
      }
    } catch {
      setPreview(currentImage || null)
      URL.revokeObjectURL(objectUrl)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setPreview(null)
    onRemove()
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
          dragOver && "border-primary bg-primary/5",
          !preview && !dragOver && "border-muted-foreground/30 hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Clique para upload</span>
          </div>
        )}

        {preview && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-1 -top-1 h-6 w-6 rounded-full"
            onClick={(e) => { e.stopPropagation(); handleRemove() }}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={disabled || uploading}
      />

      {!preview && !uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-3 w-3" />
          Selecionar foto
        </Button>
      )}
    </div>
  )
}
