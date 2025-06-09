import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import { ChevronDown, ChevronRight, Folder, FolderOpen, Edit, Trash2, FileText, FolderPlus, Move, Star } from "lucide-react"
import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { useFolderContext } from "@/modules/folder-management"
import { NoteItem } from "./note-item"
import { useFolderNotes } from "../hooks/use-folder-notes"
import { useMoveFolder, useDeleteFolder } from "@/mutations/folder-mutations"
import { useUpdateNote } from "@/mutations/note-mutations"
import { useToggleFolderFavorite } from "@/mutations/use-toggle-folder-favorite"
import { useToggleNoteFavorite } from "@/mutations/use-toggle-note-favorite"
import { useDeleteNote } from "@/mutations/note-mutations"
import { useKeyboardShortcut, KeyboardDebugger } from "@/hooks/use-keyboard-shortcut"
import { cn } from "@/utilities"
import type { TNote } from "@/types/notes"



type TFolderSidebarProps = {
  searchFilter: string
  enableDragDrop?: boolean
  showNotes?: boolean
  onNoteSelect?: (note: TNote) => void
  selectedNoteId?: number | null
}

type ContextMenuState = {
  visible: boolean
  x: number
  y: number
  folder: any | null
}

// Enhanced Context Menu Component with proper styling
const CustomContextMenu = ({
  contextMenu,
  onClose,
  onEdit,
  onCreateChild,
  onCreateNote,
  onDelete,
  onMove,
  onToggleFavorite,
  showNotes
}: {
  contextMenu: ContextMenuState
  onClose: () => void
  onEdit: (folder: any) => void
  onCreateChild: (folderId: number) => void
  onCreateNote?: (folderId: number) => void
  onDelete: (folder: any) => void
  onMove: (folder: any) => void
  onToggleFavorite: (folder: any) => void
  showNotes: boolean
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts for context menu actions
  useKeyboardShortcut(
    { key: "n" },
    () => {
      console.log('N key pressed, contextMenu:', contextMenu, 'showNotes:', showNotes, 'onCreateNote:', !!onCreateNote)
      if (contextMenu.visible && contextMenu.folder && showNotes && onCreateNote) {
        onCreateNote(contextMenu.folder.id)
        onClose()
      }
    },
    { enabled: contextMenu.visible && showNotes && !!onCreateNote }
  )

  // Handle both "F" and "Shift+F" for new folder creation
  useKeyboardShortcut(
    [
      { key: "f" },
      { key: "f", shiftKey: true }
    ],
    () => {
      console.log('F key pressed (with or without shift), contextMenu:', contextMenu)
      if (contextMenu.visible && contextMenu.folder) {
        onCreateChild(contextMenu.folder.id)
        onClose()
      }
    },
    { enabled: contextMenu.visible, debug: true }
  )

  useKeyboardShortcut(
    { key: "r" },
    () => {
      console.log('R key pressed, contextMenu:', contextMenu)
      if (contextMenu.visible && contextMenu.folder) {
        onEdit(contextMenu.folder)
        onClose()
      }
    },
    { enabled: contextMenu.visible }
  )

  useKeyboardShortcut(
    { key: "m" },
    () => {
      console.log('M key pressed, contextMenu:', contextMenu)
      if (contextMenu.visible && contextMenu.folder) {
        onMove(contextMenu.folder)
        onClose()
      }
    },
    { enabled: contextMenu.visible }
  )

  useKeyboardShortcut(
    { key: "s" },
    () => {
      console.log('S key pressed (favorite), contextMenu:', contextMenu)
      if (contextMenu.visible && contextMenu.folder) {
        onToggleFavorite(contextMenu.folder)
        onClose()
      }
    },
    { enabled: contextMenu.visible }
  )

  useKeyboardShortcut(
    { key: "Escape" },
    () => {
      if (contextMenu.visible) {
        onClose()
      }
    },
    { enabled: contextMenu.visible }
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus the context menu to ensure it can receive keyboard events
      setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.focus()
          console.log('Context menu focused programmatically')
        }
      }, 10)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.visible, onClose])

  if (!contextMenu.visible || !contextMenu.folder) return null

  const menuItems = [
    {
      icon: FileText,
      label: "New note",
      shortcut: "N",
      action: () => onCreateNote?.(contextMenu.folder.id),
      show: showNotes && onCreateNote
    },
    {
      icon: FolderPlus,
      label: "New folder",
      shortcut: "F",
      action: () => {
        console.log('Context menu: New folder clicked for folder ID:', contextMenu.folder.id)
        onCreateChild(contextMenu.folder.id)
      },
      show: true
    },
    {
      icon: Edit,
      label: "Rename",
      shortcut: "R",
      action: () => onEdit(contextMenu.folder),
      show: true
    },
    {
      icon: Star,
      label: contextMenu.folder?.isFavorite ? "Remove from favorites" : "Add to favorites",
      shortcut: "S",
      action: () => onToggleFavorite(contextMenu.folder),
      show: true
    },
    {
      icon: Move,
      label: "Move folder to...",
      shortcut: "M",
      action: () => {
        onMove(contextMenu.folder)
      },
      show: true,
      hasArrow: true
    },
    {
      icon: Trash2,
      label: "Delete",
      shortcut: "⌘⌫",
      action: () => onDelete(contextMenu.folder),
      show: true,
      isDanger: true,
      separator: true
    }
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] overflow-hidden rounded-lg border border-border bg-card/95 backdrop-blur-sm p-1 text-card-foreground shadow-2xl"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
      tabIndex={-1}
      onFocus={() => console.log('Context menu focused')}
      onBlur={() => console.log('Context menu blurred')}
    >
      {menuItems.map((item, index) => {
        if (!item.show) return null
        
        return (
          <React.Fragment key={index}>
            {item.separator && <div className="h-px my-1 bg-border" />}
            <div
              className={cn(
                "flex cursor-pointer select-none items-center justify-between rounded-md px-3 py-2 text-sm outline-none transition-colors",
                item.isDanger
                  ? "hover:bg-destructive/20 hover:text-destructive text-destructive"
                  : "hover:bg-muted hover:text-accent-foreground"
              )}
              onClick={() => {
                item.action()
                onClose()
              }}
            >
              <div className="flex items-center">
                <item.icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.shortcut}
                  </span>
                )}
                {item.hasArrow && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function FolderSidebar({
  searchFilter,
  enableDragDrop = true,
  showNotes = true,
  onNoteSelect,
  selectedNoteId
}: TFolderSidebarProps) {
  const navigate = useNavigate()

  const {
    treeData,
    toggleFolder,
    expandedFolderIds,
    selectedFolderId,
    selectFolder,
    filteredTreeData,
    startEditing,
    stopEditing,
    editingFolderId,
    renameFolder,
    createFolder: createFolderFromContext,
    refreshFolders
  } = useFolderContext()



  const moveFolderMutation = useMoveFolder()
  const deleteFolderMutation = useDeleteFolder()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()
  const toggleFolderFavoriteMutation = useToggleFolderFavorite()
  const toggleNoteFavoriteMutation = useToggleNoteFavorite()



  const [editingName, setEditingName] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    folder: null
  })

  const displayFolders = searchFilter ? filteredTreeData : treeData

  // Get all folder IDs for notes loading
  const allFolderIds = React.useMemo(() => {
    const collectFolderIds = (folders: any[]): number[] => {
      const ids: number[] = []
      folders.forEach(folder => {
        ids.push(folder.id)
        if (folder.children) {
          ids.push(...collectFolderIds(folder.children))
        }
      })
      return ids
    }
    return collectFolderIds(displayFolders)
  }, [displayFolders])

  // Load notes for all folders
  const {
    getNotesForFolder,
    addNoteToFolder,
    updateNoteInFolder,
    removeNoteFromFolder
  } = useFolderNotes(showNotes ? allFolderIds : [])

  // Context menu handlers
  const handleRightClick = (e: React.MouseEvent, folder: any) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Right-click on folder:', folder.name, 'at position:', e.clientX, e.clientY)

    // Adjust menu position to prevent it from going off screen
    const menuWidth = 200
    const menuHeight = 250
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = e.clientX
    let y = e.clientY

    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10
    }

    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10
    }

    setContextMenu({
      visible: true,
      x,
      y,
      folder
    })

    console.log('Context menu set to visible with folder:', folder.name)
  }

  const handleCloseContextMenu = () => {
    console.log('Closing context menu')
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      folder: null
    })
  }

  const handleEdit = (folder: any) => {
    console.log('Starting edit for folder:', folder.name)
    startEditing(folder.id)
    setEditingName(folder.name)
  }

  const handleDelete = async (folder: any) => {
    try {
      await deleteFolderMutation.mutateAsync({ id: folder.id, force: true })
      console.log('Folder deleted successfully:', folder.name)
      // Force refresh the folder tree data
      await refreshFolders()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete folder: ${errorMessage}. Please try again.`)
    }
  }

  const handleMoveFolder = (folder: any) => {
    // Simple implementation - show available folders to move to
    const availableFolders = treeData.filter(f => f.id !== folder.id)
    const folderNames = availableFolders.map(f => `${f.id}: ${f.name}`).join('\n')
    const targetId = prompt(`Move "${folder.name}" to which folder?\n\nAvailable folders:\n${folderNames}\n\nEnter folder ID (or leave empty for root):`)

    if (targetId !== null) {
      const newParentId = targetId.trim() === '' ? null : parseInt(targetId.trim())

      if (newParentId && !availableFolders.some(f => f.id === newParentId)) {
        alert('Invalid folder ID')
        return
      }

      moveFolderMutation.mutateAsync({
        id: folder.id,
        newParentId,
        newPosition: 0
      }).catch(error => {
        console.error('Failed to move folder:', error)
        alert('Failed to move folder. Please try again.')
      })
    }
  }

  const handleToggleFavorite = async (folder: any) => {
    try {
      await toggleFolderFavoriteMutation.mutateAsync(folder.id)
      console.log('Folder favorite status toggled successfully:', folder.name)
    } catch (error) {
      console.error('Failed to toggle folder favorite:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to toggle favorite status: ${errorMessage}. Please try again.`)
    }
  }

  const handleToggleNoteFavorite = async (note: TNote) => {
    try {
      await toggleNoteFavoriteMutation.mutateAsync(note.id)
      console.log('Note favorite status toggled successfully:', note.title)
    } catch (error) {
      console.error('Failed to toggle note favorite:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to toggle favorite status: ${errorMessage}. Please try again.`)
    }
  }

  const handleNoteDuplicate = async (note: TNote) => {
    try {
      const { createNoteWithValidation } = await import('@/services/note-service')
      const response = await createNoteWithValidation({
        title: `${note.title} (Copy)`,
        content: note.content,
        folderId: note.folderId || undefined
      })

      if (response.success && response.data) {
        const duplicatedNote: TNote = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          folderId: response.data.folderId || null,
          position: response.data.position,
          isPublic: note.isPublic,
          isFavorite: false,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        if (note.folderId) {
          addNoteToFolder(note.folderId, duplicatedNote)
        }
        console.log('Note duplicated successfully:', duplicatedNote.title)
      }
    } catch (error) {
      console.error('Failed to duplicate note:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to duplicate note: ${errorMessage}. Please try again.`)
    }
  }

  const handleNoteMove = (note: TNote) => {
    // Simple implementation - show available folders to move to
    const availableFolders = treeData.filter(f => f.id !== note.folderId)
    const folderNames = availableFolders.map(f => `${f.id}: ${f.name}`).join('\n')
    const targetId = prompt(`Move "${note.title}" to which folder?\n\nAvailable folders:\n${folderNames}\n\nEnter folder ID:`)

    if (targetId !== null && targetId.trim() !== '') {
      const newFolderId = parseInt(targetId.trim())

      if (!availableFolders.some(f => f.id === newFolderId)) {
        alert('Invalid folder ID')
        return
      }

      // TODO: Implement note move mutation
      console.log('Moving note to folder:', newFolderId)
      alert('Note move functionality not yet implemented')
    }
  }

  const handleNoteToggleVisibility = async (note: TNote) => {
    // TODO: Implement visibility toggle when isPublic is added to mutation types
    console.log('Toggle visibility for note:', note.title, 'Current isPublic:', note.isPublic)
    alert('Note visibility toggle functionality not yet implemented')
  }

  const handleCreateChild = async (parentId: number) => {
    console.log('Creating child folder for parent ID:', parentId)
    console.log('Current treeData:', treeData)
    console.log('Parent folder exists:', treeData.some(f => f.id === parentId || findFolderInTree(f, parentId)))

    try {
      // Use the context's createFolder function which handles all the coordination
      const result = await createFolderFromContext({
        name: "Untitled",
        parentId
      })

      if (result) {
        console.log('Child folder creation completed successfully:', result)
        // Expand the parent folder to show the new child
        if (!expandedFolderIds.has(parentId)) {
          toggleFolder(parentId)
        }
        // Start editing the newly created folder after a short delay
        setTimeout(() => {
          startEditing(result.id)
          setEditingName("Untitled")
          console.log('Started editing new folder with name "Untitled"')
        }, 150) // Slightly longer delay to ensure DOM is updated
      } else {
        console.error('Failed to create child folder: No result returned')
        alert('Failed to create folder. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create child folder:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
      // Show user-friendly error message
      alert(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper function to find folder in tree
  const findFolderInTree = (folder: any, targetId: number): boolean => {
    if (folder.id === targetId) return true
    if (folder.children) {
      return folder.children.some((child: any) => findFolderInTree(child, targetId))
    }
    return false
  }

  const handleRename = async (folderId: number, newName: string) => {
    const trimmedName = newName.trim()
    if (trimmedName) {
      // Find the folder to get its current name
      const findFolder = (folders: any[]): any => {
        for (const folder of folders) {
          if (folder.id === folderId) return folder
          if (folder.children) {
            const found = findFolder(folder.children)
            if (found) return found
          }
        }
        return null
      }

      const folder = findFolder(displayFolders)

      // Only rename if the name has actually changed
      if (folder && trimmedName !== folder.name) {
        try {
          await renameFolder(folderId, trimmedName)
          console.log('Folder renamed successfully:', folder.name, '->', trimmedName)
        } catch (error) {
          console.error('Failed to rename folder:', error)
          alert('Failed to rename folder. Please try again.')
        }
      }
    }
    stopEditing()
    setEditingName("")
  }

  const handleCancelEdit = () => {
    console.log('Cancelling edit')
    stopEditing()
    setEditingName("")
  }

  // Note handlers
  const handleNoteSelect = (note: TNote) => {
    // Navigate to individual note page
    navigate(`/notes/${note.id}`)
    onNoteSelect?.(note)
  }

  const handleNoteEdit = (note: TNote) => {
    setEditingNoteId(note.id)
  }

  const handleNoteUpdate = async (note: TNote, newTitle: string) => {
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle || (trimmedTitle === note.title && note.title !== "Untitled")) {
      setEditingNoteId(null)
      return
    }

    try {
      await updateNoteMutation.mutateAsync({
        id: note.id,
        title: trimmedTitle
      })

      // Update the local state to reflect the change immediately
      if (note.folderId) {
        const updatedNote = { ...note, title: trimmedTitle, updatedAt: new Date() }
        updateNoteInFolder(note.folderId, updatedNote)
      }

      console.log('Note title updated successfully:', note.title, '->', trimmedTitle)
    } catch (error) {
      console.error('Failed to update note title:', error)
      alert('Failed to update note title. Please try again.')
    } finally {
      setEditingNoteId(null)
    }
  }

  const handleNoteCancelEdit = () => {
    setEditingNoteId(null)
  }

  const handleNoteDelete = async (note: TNote) => {
    try {
      await deleteNoteMutation.mutateAsync({ id: note.id })

      // Update the local state to reflect the deletion immediately
      if (note.folderId) {
        removeNoteFromFolder(note.folderId, note.id)
      }

      // Clear selection if the deleted note was selected
      if (selectedNoteId === note.id) {
        onNoteSelect?.(null as any) // Clear selection
      }

      console.log('Note deleted successfully:', note.title)
    } catch (error) {
      console.error('Failed to delete note:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete note: ${errorMessage}. Please try again.`)
    }
  }

  const handleCreateNote = async (folderId: number) => {
    console.log('Creating note for folder ID:', folderId)

    try {
      // First, ensure the parent folder is expanded so the new note is visible
      if (!expandedFolderIds.has(folderId)) {
        toggleFolder(folderId) // Expand the folder
      }

      const { createNoteWithValidation } = await import('@/services/note-service')
      const response = await createNoteWithValidation({
        title: "Untitled",
        content: JSON.stringify([
          {
            id: 'initial-block',
            type: 'paragraph',
            content: []
          }
        ]),
        folderId
      })

      if (response.success && response.data) {
        const note: TNote = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          folderId: response.data.folderId || null,
          position: response.data.position,
          isPublic: true,
          isFavorite: false,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        addNoteToFolder(folderId, note)
        onNoteSelect?.(note)

        // Start editing the newly created note after a short delay
        setTimeout(() => {
          setEditingNoteId(note.id)
          console.log('Started editing new note with title "Untitled"')
        }, 150)

        console.log('Note created successfully:', note.title, 'in folder:', folderId)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('Failed to create note. Please try again.')
    }
  }



  // Drag and drop handlers
  const [draggedFolder, setDraggedFolder] = useState<any>(null)
  const [dragOverFolder, setDragOverFolder] = useState<number | null>(null)

  const handleDragStart = (folder: any) => {
    setDraggedFolder(folder)
    console.log('Started dragging folder:', folder.name)
  }

  const handleDragEnd = () => {
    console.log('Ended dragging folder')
    setDraggedFolder(null)
    setDragOverFolder(null)
  }

  const handleDragOver = (e: React.DragEvent, targetFolder: any) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverFolder(targetFolder.id)
  }

  const handleDragLeave = () => {
    setDragOverFolder(null)
  }

  const handleDrop = async (e: React.DragEvent, targetFolder: any) => {
    e.preventDefault()
    setDragOverFolder(null)

    if (!draggedFolder || draggedFolder.id === targetFolder.id) {
      return
    }

    console.log('Dropping folder:', draggedFolder.name, 'into:', targetFolder.name)

    try {
      // Use optimistic mutation for immediate UI feedback
      await moveFolderMutation.mutateAsync({
        id: draggedFolder.id,
        newParentId: targetFolder.id,
        newPosition: 0 // Move to beginning of target folder
      })
      console.log('Folder moved successfully')
    } catch (error) {
      console.error('Failed to move folder:', error)
      alert('Failed to move folder. Please try again.')
    }
  }

  const renderFolder = (folder: any, level = 0) => {
    const isExpanded = expandedFolderIds.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const isEditing = editingFolderId === folder.id
    const hasChildren = folder.children && folder.children.length > 0
    const indentLevel = level * 16 // 16px per level

    // Choose the appropriate folder icon based on expanded state
    const FolderIcon = isExpanded ? FolderOpen : Folder

    const FolderButton = ({ children, ...props }: any) => (
      <Button
        variant="ghost"
        onClick={() => {
          selectFolder(folder.id)
          toggleFolder(folder.id)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          handleEdit(folder)
        }}
        onContextMenu={(e) => handleRightClick(e, folder)}
        draggable={enableDragDrop}
        onDragStart={(e) => {
          if (enableDragDrop) {
            handleDragStart(folder)
            e.dataTransfer.setData("text/plain", folder.id.toString())
            e.dataTransfer.effectAllowed = "move"
          }
        }}
        onDragEnd={handleDragEnd}
        className={`w-full justify-between h-7 px-1 mx-0 text-xs font-normal overflow-hidden transition-colors ${
          isSelected
            ? "bg-background AAA-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
        } ${draggedFolder?.id === folder.id ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${indentLevel + 4}px` }}
        {...props}
      >
        {children}
      </Button>
    )

    const FolderContent = () => (
      <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFolder(folder.id)
          }}
          className="flex items-center justify-center h-3 w-3 hover:bg-sidebar-accent rounded-sm"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
            )
          ) : (
            <div className="w-3" />
          )}
        </button>

        <FolderIcon className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />

        {folder.isFavorite && (
          <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
        )}

        {isEditing ? (
          <input
            key={`edit-${folder.id}`}
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => handleRename(folder.id, editingName)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename(folder.id, editingName)
              } else if (e.key === "Escape") {
                handleCancelEdit()
              }
            }}
            onFocus={(e) => {
              const input = e.target as HTMLInputElement
              // Select all text for easy replacement when creating new folders
              if (editingName === "Untitled") {
                input.select()
              } else {
                // For existing folders, position cursor at the end
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
          <span className="truncate text-xs">{folder.name}</span>
        )}
      </div>
    )

    return (
      <div key={folder.id}>
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleFolder(folder.id)}
        >
          <div
            className={cn(
              "group relative transition-colors",
              dragOverFolder === folder.id && "bg-accent/20 rounded-md"
            )}
            onDragOver={(e) => handleDragOver(e, folder)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, folder)}
          >
            <CollapsibleTrigger asChild>
              <FolderButton>
                <FolderContent />
                <div className="flex items-center gap-1">
                  <span className="text-sidebar-foreground/60 text-xs flex-shrink-0">
                    {(folder.children?.length || 0) + (showNotes ? getNotesForFolder(folder.id).length : 0)}
                  </span>
                </div>
              </FolderButton>
            </CollapsibleTrigger>
          </div>

          {hasChildren && (
            <CollapsibleContent className="space-y-1">
              {folder.children.map((childFolder: any) =>
                renderFolder(childFolder, level + 1)
              )}
            </CollapsibleContent>
          )}
        </Collapsible>

        {/* Notes for this folder - only show when folder is expanded */}
        {showNotes && isExpanded && (() => {
          const folderNotes = getNotesForFolder(folder.id)
          return folderNotes.length > 0 && (
            <div className="space-y-1" style={{ paddingLeft: `${indentLevel + 20}px` }}>
              {folderNotes.map((note) => (
                <NoteItem
                  key={`note-${note.id}`}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  isEditing={editingNoteId === note.id}
                  onSelect={handleNoteSelect}
                  onEdit={handleNoteEdit}
                  onUpdate={handleNoteUpdate}
                  onCancelEdit={handleNoteCancelEdit}
                  onDelete={handleNoteDelete}
                  onDuplicate={handleNoteDuplicate}
                  onMove={handleNoteMove}
                  onToggleVisibility={handleNoteToggleVisibility}
                  onToggleFavorite={handleToggleNoteFavorite}
                  enableDragDrop={enableDragDrop}
                />
              ))}
            </div>
          )
        })()}
      </div>
    )
  }

  const handleDropOnRoot = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverFolder(null)

    if (!draggedFolder) {
      return
    }

    console.log('Dropping folder on root:', draggedFolder.name)

    try {
      // Move folder to root level (no parent)
      await moveFolderMutation.mutateAsync({
        id: draggedFolder.id,
        newParentId: null,
        newPosition: 0
      })
      console.log('Folder moved to root successfully')
    } catch (error) {
      console.error('Failed to move folder to root:', error)
      alert('Failed to move folder. Please try again.')
    }
  }

  return (
    <>
      <SidebarGroup className="px-0 py-0">
        <SidebarGroupContent>
          <div
            className={cn(
              "space-y-1 min-h-[200px]",
              draggedFolder && "border-2 border-dashed border-transparent",
              dragOverFolder === -1 && "border-accent/50 bg-accent/10"
            )}
            onDragOver={(e) => {
              if (draggedFolder) {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                setDragOverFolder(-1) // Use -1 to indicate root level
              }
            }}
            onDragLeave={() => setDragOverFolder(null)}
            onDrop={handleDropOnRoot}
          >
            {displayFolders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No folders yet</p>
              </div>
            ) : (
              displayFolders.map((folder) => renderFolder(folder, 0))
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Enhanced Context Menu */}
      <CustomContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        onEdit={handleEdit}
        onCreateChild={handleCreateChild}
        onCreateNote={showNotes ? handleCreateNote : undefined}
        onDelete={handleDelete}
        onMove={handleMoveFolder}
        onToggleFavorite={handleToggleFavorite}
        showNotes={showNotes}
      />

      {/* Temporary keyboard debugger for testing */}
      {contextMenu.visible && <KeyboardDebugger visible={true} />}

      {/* Debug buttons for testing deletion */}
      {process.env.NODE_ENV === 'development' && treeData.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-background border rounded p-2 space-y-2 z-50">
          <div className="text-xs text-muted-foreground mb-2">Debug Controls</div>
          <button
            onClick={async () => {
              const firstFolder = treeData[0]
              if (firstFolder) {
                console.log('Testing folder deletion:', firstFolder)
                try {
                  console.log('Calling deleteFolderMutation.mutateAsync directly...')
                  const result = await deleteFolderMutation.mutateAsync({ id: firstFolder.id, force: true })
                  console.log('Direct mutation result:', result)
                  alert('Folder deleted successfully!')
                } catch (error) {
                  console.error('Direct mutation error:', error)
                  alert('Failed to delete folder: ' + (error instanceof Error ? error.message : 'Unknown error'))
                }
              } else {
                alert('No folders to delete')
              }
            }}
            className="block w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Test Delete First Folder
          </button>
          <button
            onClick={async () => {
              const firstFolder = treeData[0]
              if (firstFolder) {
                const notes = getNotesForFolder(firstFolder.id)
                const firstNote = notes[0]
                if (firstNote) {
                  console.log('Testing note deletion:', firstNote)
                  try {
                    console.log('Calling deleteNoteMutation.mutateAsync directly...')
                    const result = await deleteNoteMutation.mutateAsync({ id: firstNote.id })
                    console.log('Direct note mutation result:', result)

                    // Update local state
                    if (firstNote.folderId) {
                      removeNoteFromFolder(firstNote.folderId, firstNote.id)
                    }

                    alert('Note deleted successfully!')
                  } catch (error) {
                    console.error('Direct note mutation error:', error)
                    alert('Failed to delete note: ' + (error instanceof Error ? error.message : 'Unknown error'))
                  }
                } else {
                  alert('No notes to delete in first folder')
                }
              } else {
                alert('No folders available')
              }
            }}
            className="block w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Test Delete First Note
          </button>
        </div>
      )}
    </>
  )
}
