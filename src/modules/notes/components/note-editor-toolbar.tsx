import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoteEditorToolbarProps {
  noteId: number
  readOnly?: boolean
  onToggleMetadata: (show?: boolean) => void
}

export function NoteEditorToolbar({ noteId, readOnly = false, onToggleMetadata }: NoteEditorToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2 p-2 border-b">
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleMetadata()}
          title="Toggle metadata"
        >
          <Info className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 