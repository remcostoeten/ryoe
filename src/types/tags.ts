// Tag types
export interface TTag {
    id: number
    name: string
    color: string
    description?: string
    createdAt: Date
    updatedAt: Date
}

export interface TCreateTagData {
    name: string
    color?: string
    description?: string
}

export interface TUpdateTagData {
    name?: string
    color?: string
    description?: string
}

// Tag with usage statistics
export interface TTagWithNoteCount extends TTag {
    noteCount: number
    usageCount: number
}

// Note-Tag association
export interface TNoteTag {
    id: number
    noteId: number
    tagId: number
    createdAt: Date
}

// Validation result type
export interface TValidationResult {
    isValid: boolean
    error?: string
}

// Tag validation functions
export function validateTagName(name: string): TValidationResult {
    const isValid = name.trim().length > 0 && name.length <= 50
    return {
        isValid,
        error: isValid ? undefined : 'Tag name must be 1-50 characters long'
    }
}

export function validateTagColor(color: string): TValidationResult {
    // Validate hex color format
    const isValid = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
    return {
        isValid,
        error: isValid ? undefined : 'Color must be a valid hex format (e.g., #FF0000)'
    }
}

// Utility functions
export function getRandomTagColor(): string {
    const colors = [
        '#3B82F6', // blue-500
        '#10B981', // emerald-500
        '#F59E0B', // amber-500
        '#EF4444', // red-500
        '#8B5CF6', // violet-500
        '#06B6D4', // cyan-500
        '#84CC16', // lime-500
        '#F97316', // orange-500
        '#EC4899', // pink-500
        '#6366F1', // indigo-500
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

export function formatTagForDisplay(tag: TTag): string {
    return `#${tag.name}`
}

export function sortTagsByName(tags: TTag[]): TTag[] {
    return [...tags].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortTagsByUsage(tags: TTag[], usageCounts: Record<number, number> = {}): TTag[] {
    return [...tags].sort((a, b) => {
        const aUsage = usageCounts[a.id] || 0
        const bUsage = usageCounts[b.id] || 0
        return bUsage - aUsage
    })
} 