import type { TServiceResult } from '@/types/service'

interface FileUploadResult {
  url: string
  name: string
  size: number
  type: string
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<TServiceResult<FileUploadResult>> {
  try {
    // For now, we'll use a data URL as a temporary solution
    // TODO: Replace with actual file upload to a server/storage service
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      }
      
      reader.onload = () => {
        resolve({
          success: true,
          data: {
            url: reader.result as string,
            name: file.name,
            size: file.size,
            type: file.type
          }
        })
      }
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file',
          code: 'FILE_READ_ERROR'
        })
      }
      
      reader.readAsDataURL(file)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
      code: 'UPLOAD_ERROR'
    }
  }
} 