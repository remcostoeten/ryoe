"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { cn } from "@/utilities"
import type { TNote } from "@/types/notes"

type TNoteItemProps = {
  note: TNote
  isSelected?: boolean
  isEditing?: boolean
  onSelect?: (note: TNote) => void
  onEdit?: (note: TNote) => void
  onUpdate?: (note: TNote, newTitle: string) => void
  onCancelEdit?: () => void
  onDelete?: (note: TNote) => void
  onDuplicate?: (note: TNote) => void
  onMove?: (note: TNote) => void
  onToggleVisibility?: (note: TNote) => void
  onToggleFavorite?: (note: TNote) => void
  enableDragDrop?: boolean
  onDragStart?: (note: TNote) => void
  onDragEnd?: () => void
  className?: string
}

// Note Context Menu Component
function NoteContextMenu({
  note,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onToggleVisibility,
  onToggleFavorite,
  children
}: {
  note: TNote
  onEdit?: (note: TNote) => void
  onDelete?: (note: TNote) => void
  onDuplicate?: (note: TNote) => void
  onMove?: (note: TNote) => void
  onToggleVisibility?: (note: TNote) => void
  onToggleFavorite?: (note: TNote) => void
  children: React.ReactNode
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={() => onEdit?.(note)}
          disabled={!onEdit}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Rename
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => onDuplicate?.(note)}
          disabled={!onDuplicate}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => onMove?.(note)}
          disabled={!onMove}
        >
          <Move className="h-4 w-4 mr-2" />
          Move
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => onToggleFavorite?.(note)}
          disabled={!onToggleFavorite}
        >
          <Star className="h-4 w-4 mr-2" />
          {note.isFavorite ? "Remove from favorites" : "Add to favorites"}
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => onToggleVisibility?.(note)}
          disabled={!onToggleVisibility}
        >
          {note.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {note.isPublic ? "Make Private" : "Make Public"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => onDelete?.(note)}
          disabled={!onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Main Note Item Component
export function NoteItem({
  note,
  isSelected = false,
  isEditing = false,
  onSelect,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  onDuplicate,
  onMove,
  onToggleVisibility,
  onToggleFavorite,
  enableDragDrop = false,
  onDragStart,
  onDragEnd,
  className
}: TNoteItemProps) {
  const [editingTitle, setEditingTitle] = useState(note.title)
  const [isDragging, setIsDragging] = useState(false)

  // Sync editingTitle with note.title when note changes
  useEffect(() => {
    setEditingTitle(note.title)
  }, [note.title])

  const handleDragStart = (e: React.DragEvent) => {
    if (!enableDragDrop) {
      e.preventDefault()
      return
    }
    
    setIsDragging(true)
    e.dataTransfer.setData("text/plain", `note:${note.id}`)
    e.dataTransfer.effectAllowed = "move"
    onDragStart?.(note)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  const handleTitleSubmit = () => {
    const trimmedTitle = editingTitle.trim()
    if (trimmedTitle && (trimmedTitle !== note.title || note.title === "Untitled")) {
      onUpdate?.(note, trimmedTitle)
    } else {
      onCancelEdit?.()
    }
  }

  const handleTitleCancel = () => {
    setEditingTitle(note.title)
    onCancelEdit?.()
  }

  return (
    <div
      className={cn(
        "group relative transition-colors",
        isDragging && "opacity-50",
        className
      )}
      draggable={enableDragDrop}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <NoteContextMenu
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onMove={onMove}
        onToggleVisibility={onToggleVisibility}
        onToggleFavorite={onToggleFavorite}
      >
        <Button
          variant="ghost"
          onClick={() => onSelect?.(note)}
          className={cn(
            "w-full justify-between h-6 px-2 text-xs font-normal overflow-hidden transition-colors",
            isSelected
              ? "bg-background AAA-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
            <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />

            {note.isFavorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
            )}

            {/* Inline editing or display title */}
            {isEditing ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleSubmit()
                  } else if (e.key === "Escape") {
                    handleTitleCancel()
                  }
                }}
                onFocus={(e) => {
                  const input = e.target as HTMLInputElement
                  // Select all text for easy replacement when creating new notes
                  if (editingTitle === "Untitled") {
                    input.select()
                  } else {
                    // For existing notes, position cursor at the end
                    setTimeout(() => {
                      input.setSelectionRange(input.value.length, input.value.length)
                    }, 0)
                  }
                }}
                className="bg-transparent border-none outline-none text-xs flex-1 min-w-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate text-xs" title={note.title}>
                {note.title}
              </span>
            )}
          </div>

          {/* Three dots menu for hover/click access */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
          </div>
        </Button>
      </NoteContextMenu>
    </div>
  )
}
