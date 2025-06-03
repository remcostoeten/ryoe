import React from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FolderTreeProps, FolderItemProps } from '../types'
import type { Folder as FolderType } from '@/types/notes'

export function FolderTree({
  folders = [],
  selectedFolderId,
  expandedFolderIds = new Set(),
  onFolderSelect,
  onFolderExpand,
  onFolderCreate,
  onFolderEdit,
  onFolderDelete,
  onFolderMove,
  enableDragDrop = false,
  showContextMenu = true,
  className
}: FolderTreeProps) {
  if (folders.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <Folder className="mx-auto mb-2 h-8 w-8" />
        <p className="text-sm">No folders yet</p>
        {onFolderCreate && (
          <button
            onClick={() => onFolderCreate(null)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" />
            Create your first folder
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isSelected={selectedFolderId === folder.id}
          isExpanded={expandedFolderIds.has(folder.id)}
          onSelect={onFolderSelect}
          onExpand={onFolderExpand}
          onEdit={onFolderEdit}
          onDelete={onFolderDelete}
          onCreateChild={onFolderCreate}
          onMove={onFolderMove}
          enableDragDrop={enableDragDrop}
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
  onSelect,
  onExpand,
  onEdit,
  onDelete,
  onCreateChild,
  onMove,
  enableDragDrop = false,
  showContextMenu = true
}: FolderItemProps) {
  const hasChildren = folder.hasChildren
  const indentLevel = folder.depth * 16

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren && onExpand) {
      onExpand(folder.id, !isExpanded)
    }
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(folder)
    }
  }

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCreateChild) {
      onCreateChild(folder.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(folder)
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
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
          isSelected && "bg-accent text-accent-foreground",
          enableDragDrop && "draggable"
        )}
        style={{ paddingLeft: `${8 + indentLevel}px` }}
        onClick={handleSelect}
        draggable={enableDragDrop}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggleExpand}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-sm hover:bg-accent-foreground/10",
            !hasChildren && "invisible"
          )}
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

        {/* Folder Name */}
        <span className="flex-1 truncate">{folder.name}</span>

        {/* Privacy Indicator */}
        {folder.isPublic && (
          <span className="text-xs text-green-600 opacity-60">Public</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {onCreateChild && (
            <button
              onClick={handleCreateChild}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10"
              title="Create subfolder"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}

          {showContextMenu && (
            <div className="relative">
              <button
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10"
                title="More options"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
              {/* Context menu would be implemented here */}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && folder.children && (
        <div className="space-y-1">
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              isSelected={isSelected}
              isExpanded={isExpanded}
              onSelect={onSelect}
              onExpand={onExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              onMove={onMove}
              enableDragDrop={enableDragDrop}
              showContextMenu={showContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}
