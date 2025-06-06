import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/styling'
// import type { TCreateNoteInput } from '@/types/notes'

interface CreateNoteButtonProps {
  selectedFolderId?: number | null
  onCreateNote: (noteData: any) => Promise<void>
  className?: string
  disabled?: boolean
}

export function CreateNoteButton({
  selectedFolderId,
  onCreateNote,
  className,
  disabled = false
}: CreateNoteButtonProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNote = async () => {
    if (!selectedFolderId) {
      // Show a message that a folder must be selected
      alert('Please select a folder first. Notes must be created inside folders.')
      return
    }

    setIsCreating(true)
    try {
      await onCreateNote({
        title: 'Untitled',
        content: JSON.stringify([
          {
            id: 'initial-block',
            type: 'paragraph',
            content: []
          }
        ]),
        folderId: selectedFolderId,
        isPublic: false
      })
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('Failed to create note. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button
      onClick={handleCreateNote}
      disabled={disabled || isCreating || !selectedFolderId}
      className={cn(
        'flex items-center gap-2',
        !selectedFolderId && 'opacity-50 cursor-not-allowed',
        className
      )}
      variant="default"
      size="sm"
    >
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          New Note
        </>
      )}
    </Button>
  )
}

interface CreateNoteInFolderProps {
  folderId: number
  folderName: string
  onCreateNote: (noteData: any) => Promise<void>
  className?: string
}

export function CreateNoteInFolder({
  folderId,
  folderName,
  onCreateNote,
  className
}: CreateNoteInFolderProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNote = async () => {
    setIsCreating(true)
    try {
      await onCreateNote({
        title: 'Untitled',
        content: JSON.stringify([
          {
            id: 'initial-block',
            type: 'paragraph',
            content: []
          }
        ]),
        folderId,
        isPublic: false
      })
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('Failed to create note. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleCreateNote}
      disabled={isCreating}
      className={cn(
        'flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors',
        isCreating && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={`Create note in ${folderName}`}
    >
      <Plus className="w-3 h-3" />
      <FileText className="w-3 h-3" />
    </button>
  )
}
