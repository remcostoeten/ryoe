import { useState, useMemo, lazy, Suspense } from 'react'
import { useFolders } from '@/application/features/workspace/modules/folder-management/hooks/use-folders'
import { useFolderOperations } from '@/application/features/workspace/modules/folder-management/hooks/use-folder-operations'
import type { TFolder } from '@/domain/entities/workspace'
import type { FolderTreeNode } from '@/domain/entities/workspace'
import { CreateNoteButton } from '@/application/features/workspace/modules/notes/components/create-note-button'
import { NoteEditor } from '@/application/features/workspace/modules/notes/components/note-editor'
import { useNotes } from '@/application/features/workspace/modules/notes/hooks/use-notes'
import { Button } from '@/presentation/components/ui/components/ui/button'
import { FileText } from 'lucide-react'
import { cn } from '@/shared/utils'
import { FolderSidebar } from '@/modules/sidebar/components/folder-sidebar'

// Lazy load heavy components
const FolderTree = lazy(() => import('@/modules/folder-management/components/folder-tree').then(module => ({ default: module.FolderTree })))
const NoteList = lazy(() => import('@/modules/notes/components/note-list').then(module => ({ default: module.NoteList })))
import { PanelLeftClose, PanelLeft } from 'lucide-react'

// Helper function to convert TFolder[] to FolderTreeNode[]
function buildFolderTree(folders: TFolder[]): FolderTreeNode[] {
  const folderMap = new Map<number, FolderTreeNode>()
  const rootFolders: FolderTreeNode[] = []

  // First pass: create all nodes
  folders.forEach(folder => {
    const node: FolderTreeNode = {
      ...folder,
      children: [],
      depth: 0,
      hasChildren: false
    }
    folderMap.set(folder.id, node)
  })

  // Second pass: build tree structure
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)!
    if (folder.parentId === null) {
      rootFolders.push(node)
    } else {
      const parent = folderMap.get(folder.parentId)
      if (parent) {
        parent.children.push(node)
        parent.hasChildren = true
        node.depth = parent.depth + 1
      }
    }
  })

  return rootFolders
}

export default function NotesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set([1]))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Folder management
  const { folders, loading: foldersLoading } = useFolders()
  const {
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder
  } = useFolderOperations()

  // Convert folders to tree nodes
  const folderTree = useMemo(() => buildFolderTree(folders), [folders])

  // Note management
  const { notes, loading: notesLoading, createNote, deleteNote } = useNotes(selectedFolderId)

  // Get the selected note
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const handleFolderSelect = (folder: TFolder) => {
    setSelectedFolderId(folder.id)
    setSelectedNoteId(null) // Clear note selection when folder changes
  }

  const handleNoteSelect = (note: any) => {
    setSelectedNoteId(note.id)
  }

  const handleFolderExpand = (folderId: number, isExpanded: boolean) => {
    setExpandedFolderIds(prev => {
      const newSet = new Set(prev)
      if (isExpanded) {
        newSet.add(folderId)
      } else {
        newSet.delete(folderId)
      }
      return newSet
    })
  }

  const handleFolderCreate = (parentId: number | null) => {
    // Create a new folder with a default name
    createFolder({
      name: 'New Folder',
      parentId: parentId || undefined
    })
  }

  const handleFolderRename = async (folderId: number, newName: string): Promise<boolean> => {
    try {
      const result = await updateFolder({
        id: folderId,
        name: newName
      })
      return result !== null
    } catch (error) {
      console.error('Failed to rename folder:', error)
      return false
    }
  }

  const handleFolderDelete = (folder: TFolder) => {
    if (confirm(`Delete folder "${folder.name}"?`)) {
      deleteFolder(folder.id)
    }
  }

  const handleCreateNote = async (noteData: any) => {
    const newNote = await createNote(noteData)
    if (newNote) {
      setSelectedNoteId(newNote.id)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/98 to-muted/5">
      {/* Sidebar */}
      <div className={cn(
        'border-r border-border/40 transition-all duration-300 backdrop-blur-sm bg-card/30',
        sidebarCollapsed ? 'w-0' : 'w-80'
      )}>
        <div className={cn(
          'h-full flex flex-col',
          sidebarCollapsed && 'hidden'
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border/30 bg-gradient-to-r from-card/80 via-card/90 to-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Notes</h2>
                <p className="text-sm text-muted-foreground/70 mt-1">Organize your thoughts</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="hover:bg-accent/40 transition-all duration-200 h-8 w-8 p-0 border border-transparent hover:border-border/30"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            <CreateNoteButton
              selectedFolderId={selectedFolderId}
              onCreateNote={handleCreateNote}
              className="w-full shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg h-10"
            />
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-hidden">
            <FolderSidebar
              searchFilter=""
              enableDragDrop={true}
              showNotes={true}
              onNoteSelect={handleNoteSelect}
              selectedNoteId={selectedNoteId}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-background/95 to-card/20">
        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="p-4 border-b border-border/30 bg-card/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="hover:bg-accent/40 transition-all duration-200 h-8 w-8 p-0 border border-transparent hover:border-border/30"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Note Editor */}
        <div className="flex-1 relative">
          {selectedNote ? (
            <div className="h-full bg-gradient-to-br from-background via-background/98 to-card/10 shadow-inner">
              <NoteEditor
                key={selectedNote.id}
                noteId={selectedNote.id}
                readOnly={false}
                className="h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-background via-card/10 to-muted/5">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center border border-border/30">
                  <FileText className="w-10 h-10 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold text-foreground/90 mb-3">Select a note to start writing</h3>
                <p className="text-muted-foreground/70 leading-relaxed mb-6">
                  Choose a note from the sidebar or create a new one to begin your writing journey
                </p>
                <div className="flex flex-col gap-3">
                  <CreateNoteButton
                    selectedFolderId={selectedFolderId}
                    onCreateNote={handleCreateNote}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg h-10 shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={!selectedFolderId}
                  />
                  {!selectedFolderId && (
                    <p className="text-xs text-muted-foreground/60">
                      Please select a folder first to create a note
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
