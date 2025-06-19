/**
 * File picker utilities for Tauri and web environments
 */

import { isTauriEnvironment } from './environment'

export interface FilePickerOptions {
  title?: string
  defaultPath?: string
  directory?: boolean
  multiple?: boolean
  filters?: Array<{
    name: string
    extensions: string[]
  }>
}

export interface FilePickerResult {
  success: boolean
  path?: string
  paths?: string[]
  error?: string
}

/**
 * Opens a file/directory picker dialog
 */
export async function openFilePicker(options: FilePickerOptions = {}): Promise<FilePickerResult> {
  try {
    if (isTauriEnvironment()) {
      return await openTauriFilePicker(options)
    } else {
      return await openWebFilePicker(options)
    }
  } catch (error) {
    console.error('File picker error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Tauri file picker implementation
 */
async function openTauriFilePicker(options: FilePickerOptions): Promise<FilePickerResult> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    
    const result = await open({
      title: options.title || 'Select Directory',
      defaultPath: options.defaultPath,
      directory: options.directory ?? true,
      multiple: options.multiple ?? false,
      filters: options.filters
    })

    if (result === null) {
      return { success: false, error: 'User cancelled selection' }
    }

    if (Array.isArray(result)) {
      return { success: true, paths: result }
    } else {
      return { success: true, path: result }
    }
  } catch (error) {
    console.error('Tauri file picker error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to open file picker'
    }
  }
}

/**
 * Web file picker implementation (fallback)
 */
async function openWebFilePicker(options: FilePickerOptions): Promise<FilePickerResult> {
  try {
    // Check if File System Access API is supported
    if ('showDirectoryPicker' in window && options.directory) {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      })
      return { success: true, path: dirHandle.name }
    }

    // Fallback to input element
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.webkitdirectory = options.directory ?? false
      input.multiple = options.multiple ?? false
      
      if (options.filters && options.filters.length > 0) {
        const extensions = options.filters.flatMap(f => f.extensions.map(ext => `.${ext}`))
        input.accept = extensions.join(',')
      }

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files && files.length > 0) {
          if (options.directory) {
            // For directory selection, get the path from the first file
            const firstFile = files[0]
            const pathParts = firstFile.webkitRelativePath.split('/')
            const directoryPath = pathParts.slice(0, -1).join('/')
            resolve({ success: true, path: directoryPath || firstFile.name })
          } else {
            const paths = Array.from(files).map(file => file.name)
            resolve({ 
              success: true, 
              path: paths[0],
              paths: paths.length > 1 ? paths : undefined
            })
          }
        } else {
          resolve({ success: false, error: 'No files selected' })
        }
      }

      input.oncancel = () => {
        resolve({ success: false, error: 'User cancelled selection' })
      }

      input.click()
    })
  } catch (error) {
    console.error('Web file picker error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File picker not supported'
    }
  }
}

/**
 * Opens a directory picker specifically for MDX storage
 */
export async function openMdxDirectoryPicker(defaultPath?: string): Promise<FilePickerResult> {
  return openFilePicker({
    title: 'Select MDX Storage Directory',
    defaultPath,
    directory: true,
    multiple: false
  })
}

/**
 * Validates if a path is suitable for MDX storage
 */
export function validateMdxPath(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim() === '') {
    return { valid: false, error: 'Path cannot be empty' }
  }

  // Basic path validation
  const invalidChars = /[<>:"|?*]/
  if (invalidChars.test(path)) {
    return { valid: false, error: 'Path contains invalid characters' }
  }

  return { valid: true }
}
