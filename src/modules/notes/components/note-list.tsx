import React from 'react'
import { FileText, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Note } from '@/types/notes'

interface NoteListProps {
  notes: Note[]
  selectedNoteId?: number | null
  onNoteSelect: (noteId: number) => void
  onNoteEdit?: (noteId: number) => void
  onNoteDelete?: (noteId: number) => void
  className?: string
}

export function NoteList({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteEdit,
  onNoteDelete,
  className
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No notes in this folder</p>
        <p className="text-sm">Create a new note to get started</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isSelected={selectedNoteId === note.id}
          onSelect={() => onNoteSelect(note.id)}
          onEdit={onNoteEdit ? () => onNoteEdit(note.id) : undefined}
          onDelete={onNoteDelete ? () => onNoteDelete(note.id) : undefined}
        />
      ))}
    </div>
  )
}

interface NoteItemProps {
  note: Note
  isSelected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function NoteItem({ note, isSelected, onSelect, onEdit, onDelete }: NoteItemProps) {
  const [showActions, setShowActions] = React.useState(false)

  // Extract preview text from BlockNote content
  const getPreviewText = (content: string): string => {
    try {
      const blocks = JSON.parse(content)
      if (Array.isArray(blocks) && blocks.length > 0) {
        const firstBlock = blocks[0]
        if (firstBlock.content && Array.isArray(firstBlock.content)) {
          return firstBlock.content
            .map((item: any) => item.text || '')
            .join('')
            .slice(0, 100)
        }
      }
    } catch (error) {
      // Fallback for non-JSON content
      return content.slice(0, 100)
    }
    return 'Empty note'
  }

  const previewText = getPreviewText(note.content)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-muted border border-border'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{note.title}</h4>
        {previewText && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {previewText}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          {note.isPublic && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              Public
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {(showActions || isSelected) && (onEdit || onDelete) && (
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 hover:bg-muted rounded"
              title="Edit note"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to delete this note?')) {
                  onDelete()
                }
              }}
              className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
              title="Delete note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
