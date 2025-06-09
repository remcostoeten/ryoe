import { tagRepository } from '@/repositories/tag-repository'
import { validateTagName, validateTagColor, getRandomTagColor } from '@/types/tags'
import type { TTag, TCreateTagData, TUpdateTagData, TNoteTag, TTagWithNoteCount } from '@/types/tags'
import type { TServiceResult } from '@/services/types'

// Tag service functions
export async function createTagWithValidation(data: TCreateTagData): Promise<TServiceResult<TTag>> {
  try {
    // Validate tag name
    const nameValidation = validateTagName(data.name)
    if (!nameValidation.isValid) {
      return {
        success: false,
        error: nameValidation.error || 'Invalid tag name'
      }
    }

    // Validate color if provided
    if (data.color) {
      const colorValidation = validateTagColor(data.color)
      if (!colorValidation.isValid) {
        return {
          success: false,
          error: colorValidation.error || 'Invalid tag color'
        }
      }
    }

    // Check if tag with same name already exists
    const existingTags = await tagRepository.searchTags(data.name.trim())
    const duplicateTag = existingTags.find(tag => 
      tag.name.toLowerCase() === data.name.trim().toLowerCase()
    )

    if (duplicateTag) {
      return {
        success: false,
        error: 'A tag with this name already exists'
      }
    }

    // Create tag with random color if not provided
    const tagData: TCreateTagData = {
      ...data,
      name: data.name.trim(),
      color: data.color || getRandomTagColor()
    }

    const tag = await tagRepository.createTag(tagData)

    return {
      success: true,
      data: tag
    }
  } catch (error) {
    console.error('Error creating tag:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tag'
    }
  }
}

export async function updateTagWithValidation(id: number, data: TUpdateTagData): Promise<TServiceResult<TTag>> {
  try {
    // Validate tag name if provided
    if (data.name !== undefined) {
      const nameValidation = validateTagName(data.name)
      if (!nameValidation.isValid) {
        return {
          success: false,
          error: nameValidation.error || 'Invalid tag name'
        }
      }

      // Check for duplicate names (excluding current tag)
      const existingTags = await tagRepository.searchTags(data.name.trim())
      const duplicateTag = existingTags.find(tag =>
        tag.id !== id && tag.name.toLowerCase() === data.name!.trim().toLowerCase()
      )

      if (duplicateTag) {
        return {
          success: false,
          error: 'A tag with this name already exists'
        }
      }
    }

    // Validate color if provided
    if (data.color !== undefined) {
      const colorValidation = validateTagColor(data.color)
      if (!colorValidation.isValid) {
        return {
          success: false,
          error: colorValidation.error || 'Invalid tag color'
        }
      }
    }

    // Trim name if provided
    const updateData: TUpdateTagData = {
      ...data,
      name: data.name ? data.name.trim() : undefined
    }

    const tag = await tagRepository.updateTag(id, updateData)

    return {
      success: true,
      data: tag
    }
  } catch (error) {
    console.error('Error updating tag:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tag'
    }
  }
}

export async function deleteTagWithValidation(id: number): Promise<TServiceResult<void>> {
  try {
    // Check if tag exists
    const tag = await tagRepository.getTagById(id)
    if (!tag) {
      return {
        success: false,
        error: 'Tag not found'
      }
    }

    await tagRepository.deleteTag(id)

    return {
      success: true,
      data: undefined
    }
  } catch (error) {
    console.error('Error deleting tag:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tag'
    }
  }
}

export async function getTagById(id: number): Promise<TServiceResult<TTag>> {
  try {
    const tag = await tagRepository.getTagById(id)

    if (!tag) {
      return {
        success: false,
        error: 'Tag not found'
      }
    }

    return {
      success: true,
      data: tag
    }
  } catch (error) {
    console.error('Error getting tag:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tag'
    }
  }
}

export async function getAllTags(): Promise<TServiceResult<TTag[]>> {
  try {
    const tags = await tagRepository.getAllTags()

    return {
      success: true,
      data: tags
    }
  } catch (error) {
    console.error('Error getting all tags:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tags'
    }
  }
}

export async function getTagsWithNoteCounts(): Promise<TServiceResult<TTagWithNoteCount[]>> {
  try {
    const tags = await tagRepository.getAllTags()

    // Get note counts for each tag
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const noteIds = await tagRepository.getNoteIdsByTagId(tag.id)
        return {
          ...tag,
          noteCount: noteIds.length
        }
      })
    )

    return {
      success: true,
      data: tagsWithCounts
    }
  } catch (error) {
    console.error('Error getting tags with note counts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tags with note counts'
    }
  }
}

export async function getTagsByNoteId(noteId: number): Promise<TServiceResult<TTag[]>> {
  try {
    const tags = await tagRepository.getTagsByNoteId(noteId)

    return {
      success: true,
      data: tags
    }
  } catch (error) {
    console.error('Error getting tags for note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tags for note'
    }
  }
}

export async function addTagToNote(noteId: number, tagId: number): Promise<TServiceResult<TNoteTag>> {
  try {
    const noteTag = await tagRepository.addTagToNote(noteId, tagId)

    return {
      success: true,
      data: noteTag
    }
  } catch (error) {
    console.error('Error adding tag to note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add tag to note'
    }
  }
}

export async function removeTagFromNote(noteId: number, tagId: number): Promise<TServiceResult<void>> {
  try {
    await tagRepository.removeTagFromNote(noteId, tagId)

    return {
      success: true,
      data: undefined
    }
  } catch (error) {
    console.error('Error removing tag from note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove tag from note'
    }
  }
}

export async function searchTags(query: string): Promise<TServiceResult<TTag[]>> {
  try {
    if (!query.trim()) {
      return getAllTags()
    }

    const tags = await tagRepository.searchTags(query.trim())

    return {
      success: true,
      data: tags
    }
  } catch (error) {
    console.error('Error searching tags:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search tags'
    }
  }
}
