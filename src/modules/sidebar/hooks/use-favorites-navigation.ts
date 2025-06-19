import { useFolderContext } from '@/application/features/workspace'
import type { TNote } from '@/domain/entities/workspace'

export function useFavoritesNavigation() {
  const { selectFolder, expandFolder } = useFolderContext()

  function navigateToFolder(folderId: number) {
    // Select the folder and expand it to show its contents
    selectFolder(folderId)
    expandFolder(folderId)
  }

  function navigateToNote(note: TNote) {
    // If the note has a folder, navigate to that folder first
    if (note.folderId) {
      selectFolder(note.folderId)
      expandFolder(note.folderId)
    }
    
    // Here you could also trigger note selection if there's a note selection context
    // For now, we'll just navigate to the folder containing the note
    console.log('Navigating to note:', note.title, 'in folder:', note.folderId)
  }

  return {
    navigateToFolder,
    navigateToNote
  }
}
