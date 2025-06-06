import React, { useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/utilities'
import { useInlineEditing, validateFolderName } from '../hooks/use-inline-editing'

import type { FolderTreeProps, FolderItemProps } from '../types'
// import type { TFolder as FolderType } from '@/types/notes'

export function FolderTree({
  folders = [],
  selectedFolderId,
  expandedFolderIds = new Set(),
  editingFolderId,
  onFolderSelect,
  onFolderExpand,
  onFolderCreate,
  onFolderEdit,
  onFolderRename,
  onFolderDelete,
  onFolderMove,
  onStartEditing,
  onStopEditing,
  enableDragDrop = false,
  enableKeyboardNavigation = true,
  showContextMenu = true,
  className
}: FolderTreeProps) {
  // Simplified without drag/drop and keyboard navigation
  if (folders.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <Folder className="mx-auto mb-2 h-8 w-8" />
        <p className="text-sm">No folders yet</p>
        {onFolderCreate && (
          <button
            onClick={() => onFolderCreate(null)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <Plus className="h-3 w-3" />
            Create your first folder
          </button>
        )}
      </div>
    )
  }





  return (
    <div
      className={cn("space-y-1 focus:outline-none", className)}
      role="tree"
      aria-label="Folder tree"
    >
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isSelected={selectedFolderId === folder.id}
          isExpanded={expandedFolderIds?.has(folder.id) || false}
          isEditing={editingFolderId === folder.id}
          isFocused={false}
          onSelect={onFolderSelect}
          onExpand={onFolderExpand}
          onEdit={onFolderEdit}
          onRename={onFolderRename}
          onDelete={onFolderDelete}
          onCreateChild={onFolderCreate}
          onMove={onFolderMove}
          onStartEditing={onStartEditing}
          onStopEditing={onStopEditing}
          enableDragDrop={enableDragDrop}
          enableKeyboardNavigation={enableKeyboardNavigation}
          showContextMenu={showContextMenu}
          selectedFolderId={selectedFolderId}
          expandedFolderIds={expandedFolderIds}
          editingFolderId={editingFolderId}
          focusedId={null}
        />
      ))}
    </div>
  )
}

function FolderItem({
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
  // Add these props to pass down to children
  selectedFolderId,
  expandedFolderIds,
  editingFolderId,
  focusedId
}: FolderItemProps & {
  isFocused?: boolean
  selectedFolderId?: number | null
  expandedFolderIds?: Set<number>
  editingFolderId?: number | null
  focusedId?: number | null
}) {
  const hasChildren = folder.hasChildren
  const indentLevel = folder.depth * 16

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

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Create a simple context menu
    const options = [
      { label: 'Rename', action: () => handleStartEdit(e) },
      { label: 'Create Subfolder', action: () => handleCreateChild(e) },
      { label: 'Delete', action: () => {
        if (confirm(`Delete folder "${folder.name}"?`)) {
          handleDelete(e)
        }
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

  return (
    <div>
      {/* Folder Item */}
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200",
          "hover:bg-accent/30 hover:scale-[1.01]",
          isSelected && "bg-gradient-to-r from-accent/15 to-accent/10 text-foreground shadow-sm",
          isFocused && "bg-accent/8 outline-none",
          effectiveIsEditing && "bg-accent/25 shadow-sm",
          enableDragDrop && "draggable"
        )}
        style={{ paddingLeft: `${8 + indentLevel}px` }}
        onClick={handleSelect}
        draggable={enableDragDrop}
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
          {isExpanded ? (
            <FolderOpen className="h-3 w-3 text-blue-500" />
          ) : (
            <Folder className="h-3 w-3 text-blue-500" />
          )}
        </div>

        {/* Folder Name - Inline Editing */}
        <div className="flex-1 min-w-0">
          {effectiveIsEditing ? (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={(e) => updateValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleBlur}
                className={cn(
                  "w-full px-1 py-0 text-sm bg-background border rounded focus:outline-none focus:ring-2 focus:ring-primary",
                  !isValid && "border-destructive focus:ring-destructive"
                )}
                disabled={isSaving}
                aria-label="Edit folder name"
              />
              {error && (
                <div className="absolute top-full left-0 mt-1 text-xs text-destructive bg-background border border-destructive rounded px-2 py-1 shadow-md z-10">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <span
              className="truncate block"
              onDoubleClick={handleStartEdit}
              title={folder.name}
            >
              {folder.name}
            </span>
          )}
        </div>

        {/* Privacy Indicator */}
        {!effectiveIsEditing && folder.isPublic && (
          <span className="text-xs text-green-600 opacity-60 flex-shrink-0">Public</span>
        )}

        {/* Actions */}
        {!effectiveIsEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <button
              onClick={handleStartEdit}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
              title="Rename folder (F2)"
              tabIndex={-1}
            >
              <Edit2 className="h-3 w-3" />
            </button>

            {onCreateChild && (
              <button
                onClick={handleCreateChild}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
                title="Create subfolder (Insert)"
                tabIndex={-1}
              >
                <Plus className="h-3 w-3" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Are you sure you want to delete the folder "${folder.name}"?\n\nThis action cannot be undone.`)) {
                    handleDelete(e)
                  }
                }}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
                title="Delete folder (Delete key)"
                tabIndex={-1}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}

            {showContextMenu && (
              <div className="relative">
                <button
                  onClick={handleMoreOptions}
                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary"
                  title="More options"
                  tabIndex={-1}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
                {/* Context menu would be implemented here */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && folder.children && (
        <div className="space-y-1" role="group">
          {folder.children.map((child) => (
            <FolderItem
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
  )
}


