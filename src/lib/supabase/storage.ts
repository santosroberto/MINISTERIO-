import { createClient } from "@/lib/supabase/client"

const BUCKET_NAME = "membro-fotos"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export interface UploadResult {
  url: string
  path: string
}

export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = "StorageError"
  }
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new StorageError(
      "Formato não permitido. Use JPEG, PNG, WebP ou GIF.",
      "INVALID_TYPE"
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(
      "Arquivo muito grande. Máximo de 5MB.",
      "FILE_TOO_LARGE"
    )
  }
}

function supabase() {
  return createClient().storage.from(BUCKET_NAME)
}

export const storageService = {
  async uploadFoto(membroId: string, file: File): Promise<UploadResult> {
    validateFile(file)

    const fileExt = file.name.split(".").pop()
    const fileName = `${membroId}/${Date.now()}.${fileExt}`
    const path = fileName

    const { error } = await supabase().upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      if (error.message?.includes("duplicate")) {
        throw new StorageError("Arquivo já existe.", "DUPLICATE")
      }
      throw new StorageError("Erro ao fazer upload. Tente novamente.", "UPLOAD_FAILED")
    }

    const { data: urlData } = supabase().getPublicUrl(path)

    return { url: urlData.publicUrl, path }
  },

  async deleteFoto(path: string): Promise<void> {
    if (!path) return

    const { error } = await supabase().remove([path])

    if (error) {
      throw new StorageError("Erro ao excluir arquivo.", "DELETE_FAILED")
    }
  },

  async deleteFotoByUrl(fileUrl: string): Promise<void> {
    const path = fileUrl.split(`${BUCKET_NAME}/`).pop()
    if (!path) return
    await this.deleteFoto(path)
  },

  async listFotos(membroId: string): Promise<string[]> {
    const { data, error } = await supabase().list(membroId, {
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) return []

    return data.map((file) => {
      const { data: urlData } = supabase().getPublicUrl(`${membroId}/${file.name}`)
      return urlData.publicUrl
    })
  },

  getPublicUrl(path: string): string {
    const { data } = supabase().getPublicUrl(path)
    return data.publicUrl
  },

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase().createSignedUrl(path, expiresIn)
    if (error) throw new StorageError("Erro ao gerar URL.", "SIGNED_URL_FAILED")
    return data.signedUrl
  },

  async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    validateFile(file)

    const fileExt = file.name.split(".").pop()
    const fileName = `avatars/${userId}.${fileExt}`

    const { error } = await supabase().upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      throw new StorageError("Erro ao fazer upload do avatar.", "UPLOAD_FAILED")
    }

    const { data: urlData } = supabase().getPublicUrl(fileName)

    return { url: urlData.publicUrl, path: fileName }
  },
}
