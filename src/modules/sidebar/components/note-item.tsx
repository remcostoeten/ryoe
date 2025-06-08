"use client"

import { useState } from "react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
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
  className,
  trigger
}: {
  note: TNote
  onEdit?: (note: TNote) => void
  onDelete?: (note: TNote) => void
  onDuplicate?: (note: TNote) => void
  onMove?: (note: TNote) => void
  onToggleVisibility?: (note: TNote) => void
  onToggleFavorite?: (note: TNote) => void
  className?: string
  trigger?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const menuItems = [
    {
      group: "primary",
      items: [
        {
          icon: Edit2,
          label: "Rename",
          onClick: () => onEdit?.(note),
          disabled: !onEdit
        }
      ]
    },
    {
      group: "secondary",
      items: [
        {
          icon: Copy,
          label: "Duplicate",
          onClick: () => onDuplicate?.(note),
          disabled: !onDuplicate
        },
        {
          icon: Move,
          label: "Move",
          onClick: () => onMove?.(note),
          disabled: !onMove
        },
        {
          icon: Star,
          label: note.isFavorite ? "Remove from favorites" : "Add to favorites",
          onClick: () => onToggleFavorite?.(note),
          disabled: !onToggleFavorite
        },
        {
          icon: note.isPublic ? EyeOff : Eye,
          label: note.isPublic ? "Make Private" : "Make Public",
          onClick: () => onToggleVisibility?.(note),
          disabled: !onToggleVisibility
        }
      ]
    },
    {
      group: "danger",
      items: [
        {
          icon: Trash2,
          label: "Delete",
          onClick: () => {
            if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
              onDelete?.(note)
            }
          },
          disabled: !onDelete,
          dangerous: true
        }
      ]
    }
  ]

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
      onClick={(e) => {
        e.stopPropagation()
        setIsOpen(true)
      }}
      title="More options"
    >
      <MoreHorizontal className="h-3 w-3" />
    </Button>
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-48 p-1", className)}
        align="start"
        side="right"
        sideOffset={5}
      >
        <div className="space-y-1">
          {menuItems.map((group, groupIndex) => (
            <div key={group.group}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-8 px-2 text-xs font-normal",
                      item.dangerous && "text-destructive hover:text-destructive hover:bg-destructive/10",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !item.disabled && handleAction(item.onClick)}
                    disabled={item.disabled}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
              {groupIndex < menuItems.length - 1 && (
                <Separator className="my-1" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
    if (editingTitle.trim() && editingTitle !== note.title) {
      onUpdate?.(note, editingTitle.trim())
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
        
        {/* Context Menu */}
        <NoteContextMenu
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onMove={onMove}
          onToggleVisibility={onToggleVisibility}
          onToggleFavorite={onToggleFavorite}
        />
      </Button>
    </div>
  )
}
