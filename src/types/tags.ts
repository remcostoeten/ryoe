// Tag types for the application

export type TTag = {
  id: number
  name: string
  color: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export type TCreateTagData = {
  name: string
  color?: string
  description?: string
}

export type TUpdateTagData = Partial<TCreateTagData>

export type TNoteTag = {
  id: number
  noteId: number
  tagId: number
  createdAt: Date
}

export type TTagWithNoteCount = TTag & {
  noteCount: number
}

export type TNoteWithTags = {
  id: number
  title: string
  content: string
  folderId: number | null
  position: number
  isPublic: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  tags: TTag[]
}

// Tag color presets
export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#84cc16', // lime
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#a855f7', // purple
  '#e11d48', // rose
] as const

export type TTagColor = typeof TAG_COLORS[number]

// Tag validation
export function validateTagName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Tag name is required' }
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Tag name must be 50 characters or less' }
  }
  
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
    return { isValid: false, error: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores' }
  }
  
  return { isValid: true }
}

export function validateTagColor(color: string): { isValid: boolean; error?: string } {
  if (!color) {
    return { isValid: true } // Color is optional
  }
  
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { isValid: false, error: 'Color must be a valid hex color (e.g., #ff0000)' }
  }
  
  return { isValid: true }
}

// Helper functions
export function getRandomTagColor(): TTagColor {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
}

export function formatTagName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
