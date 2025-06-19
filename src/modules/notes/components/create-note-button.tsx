import { useState } from 'react'
import { Plus, FileText, Sparkles } from 'lucide-react'
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
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden',
        !selectedFolderId
          ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
          : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      variant="default"
      size="sm"
    >
      {/* Background shimmer effect */}
      {!disabled && selectedFolderId && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}

      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Creating...</span>
        </>
      ) : (
        <>
          <div className="relative">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            {selectedFolderId && (
              <Sparkles className="w-2 h-2 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-yellow-300" />
            )}
          </div>
          <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">New Note</span>
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
