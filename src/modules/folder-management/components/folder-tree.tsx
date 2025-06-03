import React, { useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKeyboardNavigation } from '../hooks/use-keyboard-navigation'
import { useInlineEditing, validateFolderName } from '../hooks/use-inline-editing'
import { useFolderDragDrop, customCollisionDetection } from '../hooks/use-folder-drag-drop'
import { SortableFolderItem } from './sortable-folder-item'
import type { FolderTreeProps, FolderItemProps } from '../types'
import type { Folder as FolderType } from '@/types/notes'

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
  const treeRef = useRef<HTMLDivElement>(null)

  // Drag and drop functionality
  const {
    draggedFolder,
    isDragging,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    DndContextComponent,
    SortableContextComponent,
    DragOverlayComponent
  } = useFolderDragDrop({
    folders,
    onFoldersReorder: (reorderedFolders) => {
      // This will be handled by the parent component through onFolderMove
    },
    onFolderMove
  })

  // Keyboard navigation
  const {
    focusedId,
    handleKeyDown,
    focusFolder
  } = useKeyboardNavigation({
    folders,
    selectedId: selectedFolderId,
    expandedIds: expandedFolderIds,
    onSelect: (folderId) => {
      if (folderId && onFolderSelect) {
        const folder = findFolderById(folders, folderId)
        if (folder) onFolderSelect(folder)
      }
    },
    onExpand: (folderId) => {
      if (onFolderExpand) onFolderExpand(folderId, true)
    },
    onCollapse: (folderId) => {
      if (onFolderExpand) onFolderExpand(folderId, false)
    },
    onStartEditing,
    onDelete: (folderId) => {
      if (onFolderDelete) {
        const folder = findFolderById(folders, folderId)
        if (folder) onFolderDelete(folder)
      }
    },
    onCreateChild: onFolderCreate
  })

  // Focus management
  useEffect(() => {
    if (selectedFolderId && focusFolder) {
      focusFolder(selectedFolderId)
    }
  }, [selectedFolderId, focusFolder])
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

  // Get folder IDs for sortable context
  const getFolderIds = (folders: typeof folders): string[] => {
    const ids: string[] = []
    const traverse = (items: typeof folders) => {
      for (const item of items) {
        ids.push(item.id.toString())
        if (item.children) {
          traverse(item.children)
        }
      }
    }
    traverse(folders)
    return ids
  }

  const folderIds = getFolderIds(folders)

  if (enableDragDrop) {
    return (
      <DndContextComponent
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContextComponent items={folderIds} strategy={undefined}>
          <div
            ref={treeRef}
            className={cn("space-y-1 focus:outline-none", className)}
            tabIndex={enableKeyboardNavigation ? 0 : -1}
            onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
            role="tree"
            aria-label="Folder tree"
          >
            {folders.map((folder) => (
              <SortableFolderItem
                key={folder.id}
                folder={folder}
                isSelected={selectedFolderId === folder.id}
                isExpanded={expandedFolderIds.has(folder.id)}
                isEditing={editingFolderId === folder.id}
                isFocused={focusedId === folder.id}
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
              />
            ))}
          </div>
        </SortableContextComponent>

        <DragOverlayComponent>
          {draggedFolder && (
            <div className="bg-background border-2 border-primary rounded-md shadow-xl p-2">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span className="text-sm font-medium">{draggedFolder.name}</span>
              </div>
            </div>
          )}
        </DragOverlayComponent>
      </DndContextComponent>
    )
  }

  return (
    <div
      ref={treeRef}
      className={cn("space-y-1 focus:outline-none", className)}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
      role="tree"
      aria-label="Folder tree"
    >
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isSelected={selectedFolderId === folder.id}
          isExpanded={expandedFolderIds.has(folder.id)}
          isEditing={editingFolderId === folder.id}
          isFocused={focusedId === folder.id}
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
  showContextMenu = true
}: FolderItemProps & { isFocused?: boolean }) {
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

  return (
    <div>
      {/* Folder Item */}
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors",
          isSelected && "bg-accent text-accent-foreground",
          isFocused && "ring-2 ring-primary ring-offset-1",
          effectiveIsEditing && "bg-accent",
          enableDragDrop && "draggable"
        )}
        style={{ paddingLeft: `${8 + indentLevel}px` }}
        onClick={handleSelect}
        draggable={enableDragDrop}
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

            {showContextMenu && (
              <div className="relative">
                <button
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
              isSelected={isSelected}
              isExpanded={isExpanded}
              isEditing={false} // Children inherit editing state separately
              isFocused={false} // Children inherit focus state separately
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to find folder by ID in tree
function findFolderById(folders: FolderTreeNode[], id: number): FolderTreeNode | null {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder
    }
    if (folder.children) {
      const found = findFolderById(folder.children, id)
      if (found) return found
    }
  }
  return null
}
