import { useState, useMemo, lazy, Suspense } from 'react'
import { useFolders } from '@/modules/folder-management/hooks/use-folders'
import { useFolderOperations } from '@/modules/folder-management/hooks/use-folder-operations'
import type { TFolder } from '@/types/notes'
import type { FolderTreeNode } from '@/modules/folder-management/types'
import { CreateNoteButton } from '@/modules/notes/components/create-note-button'
import { NoteEditor } from '@/modules/notes/components/note-editor'
import { useNotes } from '@/modules/notes/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { cn } from '@/utilities'

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
    <div className="flex h-screen bg-gradient-to-br from-background to-background/95">
      {/* Sidebar */}
      <div className={cn(
        'border-r border-border/60 transition-all duration-300 backdrop-blur-sm bg-background/80',
        sidebarCollapsed ? 'w-0' : 'w-80'
      )}>
        <div className={cn(
          'h-full flex flex-col',
          sidebarCollapsed && 'hidden'
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border/40 bg-gradient-to-r from-background to-background/90">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Notes</h2>
                <p className="text-sm text-muted-foreground/80">Organize your thoughts</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="hover:bg-accent/50 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            <CreateNoteButton
              selectedFolderId={selectedFolderId}
              onCreateNote={handleCreateNote}
              className="w-full shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            />
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Folders</h3>
              {foldersLoading ? (
                <div className="text-sm text-muted-foreground">Loading folders...</div>
              ) : (
                <Suspense fallback={
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted/60 rounded-md w-3/4"></div>
                    <div className="h-4 bg-muted/60 rounded-md w-1/2"></div>
                    <div className="h-4 bg-muted/60 rounded-md w-2/3"></div>
                  </div>
                }>
                  <FolderTree
                    folders={folderTree}
                    selectedFolderId={selectedFolderId}
                    expandedFolderIds={expandedFolderIds}
                    onFolderSelect={handleFolderSelect}
                    onFolderExpand={handleFolderExpand}
                    onFolderCreate={handleFolderCreate}
                    onFolderRename={handleFolderRename}
                    onFolderDelete={handleFolderDelete}
                    onFolderMove={moveFolder}
                    enableDragDrop={true}
                    className="mb-6"
                  />
                </Suspense>
              )}
            </div>

            {/* Notes in Selected Folder */}
            {selectedFolderId && (
              <div className="bg-accent/10 rounded-lg p-4 border border-border/40">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Notes in Folder
                </h3>
                {notesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading notes...</div>
                ) : (
                  <Suspense fallback={
                    <div className="animate-pulse space-y-3">
                      <div className="h-8 bg-muted/60 rounded-md"></div>
                      <div className="h-8 bg-muted/60 rounded-md"></div>
                      <div className="h-8 bg-muted/60 rounded-md"></div>
                    </div>
                  }>
                    <NoteList
                      notes={notes.map(note => ({
                        ...note,
                        folderId: note.folderId ?? undefined,
                        wordCount: 0,
                        characterCount: note.content?.length || 0,
                        readingTime: Math.ceil((note.content?.length || 0) / 1000),
                        lastModified: note.updatedAt.toISOString(),
                        createdAt: note.createdAt.getTime(),
                        updatedAt: note.updatedAt.getTime()
                      }))}
                      selectedNoteId={selectedNoteId}
                      onNoteSelect={setSelectedNoteId}
                      onNoteDelete={deleteNote}
                    />
                  </Suspense>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-background/98">
        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="p-3 border-b border-border/40 bg-background/90 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="hover:bg-accent/50 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Note Editor */}
        <div className="flex-1 relative">
          {selectedNote ? (
            <div className="h-full bg-gradient-to-br from-background to-background/95 shadow-inner">
              <NoteEditor
                key={selectedNote.id}
                noteId={selectedNote.id}
                readOnly={false}
                className="h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/80 bg-gradient-to-br from-background via-background/95 to-accent/5">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-primary/60" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">No note selected</h3>
                <p className="text-muted-foreground/70 leading-relaxed">
                  {selectedFolderId
                    ? 'Select a note from the sidebar or create a new one to get started with your writing journey.'
                    : 'Select a folder first, then create or select a note to begin organizing your thoughts.'
                  }
                </p>
                {selectedFolderId && (
                  <div className="mt-6">
                    <CreateNoteButton
                      selectedFolderId={selectedFolderId}
                      onCreateNote={handleCreateNote}
                      className="shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
