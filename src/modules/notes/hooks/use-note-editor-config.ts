import { useState, useCallback } from 'react'

export function useNoteEditorConfig() {
  const [showMetadata, setShowMetadata] = useState(false)

  const toggleMetadata = useCallback((show?: boolean) => {
    setShowMetadata(prev => typeof show === 'boolean' ? show : !prev)
  }, [])

  return {
    showMetadata,
    toggleMetadata
  }
} 