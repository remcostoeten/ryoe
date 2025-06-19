import React from 'react'
import { FileText, Edit2, Trash2, Clock } from 'lucide-react'
import { cn } from '@/utilities/styling'
import type { TNoteWithMetadata } from '@/services/types'

export type Note = TNoteWithMetadata

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
      <div className={cn('p-6 text-center text-muted-foreground/70', className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
          <FileText className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No notes in this folder</h3>
        <p className="text-sm leading-relaxed">Create a new note to get started with your writing journey</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
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
  const formattedDate = new Date(note.updatedAt * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div
      className={cn(
        'group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md',
        isSelected
          ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-sm'
          : 'bg-background/60 border-border/40 hover:bg-accent/30 hover:border-border/60'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className={cn(
              "w-4 h-4 flex-shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground/60"
            )} />
            <h3 className={cn(
              "font-medium truncate",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {note.title}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-3 line-clamp-2">
            {previewText}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>{Math.ceil(note.content.length / 500)} min read</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className={cn(
          "flex items-center gap-1 transition-opacity duration-200",
          showActions ? "opacity-100" : "opacity-0"
        )}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Edit note"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
      )}
    </div>
  )
}
