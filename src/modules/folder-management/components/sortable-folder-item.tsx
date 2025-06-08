import React, { useEffect, useState } from 'react'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Edit2, GripVertical } from 'lucide-react'
import { cn } from '@/utilities'
import { useInlineEditing, validateFolderName } from '../hooks/use-inline-editing'
import { FolderDeleteConfirmation } from "@/components/ui/folder-delete-confirmation"
import { getFolderDeletionStats } from "@/services/folder-service"
import type { FolderItemProps } from '../types'
// import type { TFolder as FolderType } from '@/types/notes'

interface SortableFolderItemProps extends FolderItemProps {
  isDragOverlay?: boolean
  selectedFolderId?: number | null
  expandedFolderIds?: Set<number>
  editingFolderId?: number | null
  focusedId?: number | null
}

export function SortableFolderItem({
  folder,
  isSelected = false,
  isExpanded = false,
  isEditing = false,
  isFocused = false,
  onSelect,
  onExpand,
  onEdit,
  onRename,
  onDelete,
  onCreateChild,
  onMove,
  onStartEditing,
  onStopEditing,
  enableDragDrop = false,
  enableKeyboardNavigation = true,
  showContextMenu = true,
  isDragOverlay = false,
  selectedFolderId,
  expandedFolderIds,
  editingFolderId,
  focusedId
}: SortableFolderItemProps & { isFocused?: boolean }) {
  const hasChildren = folder.hasChildren
  const indentLevel = folder.depth * 16

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deletionStats, setDeletionStats] = useState<{ childFoldersCount: number; notesCount: number } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: folder.id.toString(),
    disabled: !enableDragDrop || isEditing
  })

  // Inline editing
  const {
    isEditing: inlineIsEditing,
    currentValue,
    isValid,
    error,
    isSaving,
    inputRef,
    startEditing,
    stopEditing,
    updateValue,
    handleKeyDown: handleEditKeyDown,
    handleBlur
  } = useInlineEditing({
    initialValue: folder.name,
    onSave: async (newName) => {
      if (onRename) {
        const success = await onRename(folder.id, newName)
        if (success && onStopEditing) {
          onStopEditing()
        }
        return success
      }
      return false
    },
    onCancel: onStopEditing,
    validateValue: validateFolderName
  })

  // Use external editing state if provided, otherwise use internal state
  const effectiveIsEditing = isEditing || inlineIsEditing

  // Start editing when external state changes
  useEffect(() => {
    if (isEditing && !inlineIsEditing) {
      startEditing()
    } else if (!isEditing && inlineIsEditing) {
      stopEditing()
    }
  }, [isEditing, inlineIsEditing, startEditing, stopEditing])

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren && onExpand) {
      onExpand(folder.id, !isExpanded)
    }
  }

  const handleSelect = () => {
    if (!effectiveIsEditing && onSelect) {
      onSelect(folder)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren && onExpand && !effectiveIsEditing) {
      onExpand(folder.id, !isExpanded)
    }
  }

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCreateChild) {
      onCreateChild(folder.id)
    }
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStartEditing) {
      onStartEditing(folder.id)
    } else {
      startEditing()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(folder)
    }
  }

  async function handleDeleteClick() {
    try {
      const stats = await getFolderDeletionStats(folder.id)
      if (stats.success && stats.data) {
        setDeletionStats(stats.data)
        setShowDeleteConfirmation(true)
      } else {
        // Fallback to simple confirm if stats fail
        if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
          handleDelete({ stopPropagation: () => {} } as React.MouseEvent)
        }
      }
    } catch (error) {
      // Fallback to simple confirm on error
      if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
        handleDelete({ stopPropagation: () => {} } as React.MouseEvent)
      }
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    try {
      await handleDelete({ stopPropagation: () => {} } as React.MouseEvent)
      setShowDeleteConfirmation(false)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleCancelDelete() {
    setShowDeleteConfirmation(false)
    setDeletionStats(null)
  }

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Create a simple context menu
    const options = [
      { label: 'Rename', action: () => handleStartEdit(e) },
      { label: 'Create Subfolder', action: () => handleCreateChild(e) },
      { label: 'Delete', action: () => {
        handleDeleteClick()
      }}
    ]

    // For now, show a simple menu using native browser methods
    const choice = prompt(
      `Choose action for "${folder.name}":\n` +
      options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n') +
      '\n\nEnter number (1-3):'
    )

    const choiceNum = parseInt(choice || '0')
    if (choiceNum >= 1 && choiceNum <= options.length) {
      options[choiceNum - 1].action()
    }
  }

  // Transform styles for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <div>
        {/* Folder Item */}
      <div
        ref={setNodeRef}
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200 relative",
          "hover:bg-accent/30 hover:scale-[1.01]",
          isSelected && "bg-gradient-to-r from-accent/15 to-accent/10 text-foreground shadow-sm",
          isFocused && "bg-accent/8 outline-none",
          effectiveIsEditing && "bg-accent/25 shadow-sm",
          isDragging && "z-50 shadow-lg bg-background/95 backdrop-blur-sm scale-105",
          isOver && "bg-accent/35 scale-[1.02]",
          isDragOverlay && "shadow-xl bg-background/95 backdrop-blur-sm scale-110"
        )}
        style={{
          paddingLeft: `${8 + indentLevel}px`,
          ...style
        }}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        onDragStart={(e) => {
          if (!enableDragDrop) {
            e.preventDefault()
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={folder.depth + 1}
        tabIndex={-1}
      >
        {/* Drag Handle */}
        {enableDragDrop && !effectiveIsEditing && (
          <button
            {...attributes}
            {...listeners}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-sm hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
              isDragging && "opacity-100"
            )}
            aria-label="Drag to reorder folder"
            tabIndex={-1}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onReset={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <GripVertical className="h-3 w-3" />
          </button>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggleExpand}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-sm hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary",
            !hasChildren && "invisible"
          )}
          aria-label={hasChildren ? (isExpanded ? "Collapse folder" : "Expand folder") : undefined}
          tabIndex={-1}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          )}
        </button>

        {/* Folder Icon */}
        <div className="flex h-4 w-4 items-center justify-center">
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-3 w-3" />
          ) : (
            <Folder className="h-3 w-3" />
          )}
        </div>

        {/* Folder Name / Edit Input */}
        <div className="flex-1 min-w-0">
          {effectiveIsEditing ? (
            <div className="space-y-1">
              <input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={(e) => updateValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleBlur}
                className={cn(
                  "w-full px-1 py-0.5 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary",
                  !isValid && "border-destructive focus:ring-destructive"
                )}
                disabled={isSaving}
                aria-label="Edit folder name"
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          ) : (
            <span className="truncate block">{folder.name}</span>
          )}
        </div>

        {/* Action Buttons */}
        {!effectiveIsEditing && showContextMenu && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCreateChild}
              className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Create child folder"
              tabIndex={-1}
            >
              <Plus className="h-3 w-3" />
            </button>
            
            <button
              onClick={handleStartEdit}
              className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Edit folder"
              tabIndex={-1}
            >
              <Edit2 className="h-3 w-3" />
            </button>
            
            <button
              onClick={handleMoreOptions}
              className="flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="More options"
              tabIndex={-1}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isSaving && (
          <div className="flex h-4 w-4 items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && folder.children && (
        <div className="space-y-1" role="group">
          {folder.children.map((child) => (
            <SortableFolderItem
              key={child.id}
              folder={child}
              isSelected={selectedFolderId === child.id}
              isExpanded={expandedFolderIds?.has(child.id) || false}
              isEditing={editingFolderId === child.id}
              isFocused={focusedId === child.id}
              onSelect={onSelect}
              onExpand={onExpand}
              onEdit={onEdit}
              onRename={onRename}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              onMove={onMove}
              onStartEditing={onStartEditing}
              onStopEditing={onStopEditing}
              enableDragDrop={enableDragDrop}
              enableKeyboardNavigation={enableKeyboardNavigation}
              showContextMenu={showContextMenu}
              selectedFolderId={selectedFolderId}
              expandedFolderIds={expandedFolderIds}
              editingFolderId={editingFolderId}
              focusedId={focusedId}
            />
          ))}
        </div>
      )}
      </div>

      <FolderDeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        folderName={folder.name}
        childFoldersCount={deletionStats?.childFoldersCount || 0}
        notesCount={deletionStats?.notesCount || 0}
        isLoading={isDeleting}
      />
    </>
  )
}
