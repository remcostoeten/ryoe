import { useQuery } from '@tanstack/react-query'
import { 
  getAllTags, 
  getTagById, 
  getTagsByNoteId, 
  getTagsWithNoteCounts,
  searchTags 
} from '@/services/tag-service'
import { TAG_QUERY_KEYS } from '@/mutations/tag-mutations'
import type { TTag } from '@/types/tags'

// Hook to get all tags
export function useTags() {
  return useQuery({
    queryKey: TAG_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await getAllTags()
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get tags with note counts
export function useTagsWithNoteCounts() {
  return useQuery({
    queryKey: [...TAG_QUERY_KEYS.lists(), 'with-counts'],
    queryFn: async () => {
      const response = await getTagsWithNoteCounts()
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get a single tag by ID
export function useTag(id: number | null) {
  return useQuery({
    queryKey: TAG_QUERY_KEYS.detail(id!),
    queryFn: async () => {
      if (!id) return null
      
      const response = await getTagById(id)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get tags for a specific note
export function useNoteTags(noteId: number | null) {
  return useQuery({
    queryKey: TAG_QUERY_KEYS.notesTags(noteId!),
    queryFn: async () => {
      if (!noteId) return []
      
      const response = await getTagsByNoteId(noteId)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter since tags on notes change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to search tags
export function useTagSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...TAG_QUERY_KEYS.lists(), 'search', query],
    queryFn: async () => {
      const response = await searchTags(query)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to get popular tags (tags with most notes)
export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: [...TAG_QUERY_KEYS.lists(), 'popular', limit],
    queryFn: async () => {
      const response = await getTagsWithNoteCounts()
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Sort by note count descending and take the top N
      return response.data!
        .sort((a, b) => b.noteCount - a.noteCount)
        .slice(0, limit)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (popular tags don't change often)
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// Hook to get recent tags (recently created)
export function useRecentTags(limit: number = 5) {
  return useQuery({
    queryKey: [...TAG_QUERY_KEYS.lists(), 'recent', limit],
    queryFn: async () => {
      const response = await getAllTags()
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      // Sort by creation date descending and take the top N
      return response.data!
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Custom hook for tag management operations
export function useTagOperations() {
  const { data: allTags = [], isLoading: isLoadingTags } = useTags()
  
  const findTagByName = (name: string): TTag | undefined => {
    return allTags.find(tag => 
      tag.name.toLowerCase() === name.toLowerCase()
    )
  }
  
  const findTagsByColor = (color: string): TTag[] => {
    return allTags.filter(tag => tag.color === color)
  }
  
  const getTagsByIds = (ids: number[]): TTag[] => {
    return allTags.filter(tag => ids.includes(tag.id))
  }
  
  const filterTagsByQuery = (query: string): TTag[] => {
    if (!query.trim()) return allTags
    
    const lowerQuery = query.toLowerCase()
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery) ||
      (tag.description && tag.description.toLowerCase().includes(lowerQuery))
    )
  }
  
  return {
    allTags,
    isLoadingTags,
    findTagByName,
    findTagsByColor,
    getTagsByIds,
    filterTagsByQuery
  }
}
