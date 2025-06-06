import { useState, useMemo } from 'react'
import { FolderTree } from '@/modules/folder-management/components/folder-tree'
import { useFolders } from '@/modules/folder-management/hooks/use-folders'
import { useFolderOperations } from '@/modules/folder-management/hooks/use-folder-operations'
import type { TFolder } from '@/types/notes'
import type { FolderTreeNode } from '@/modules/folder-management/types'
import { CreateNoteButton } from '@/modules/notes/components/create-note-button'
import { NoteList } from '@/modules/notes/components/note-list'
import { NoteEditor } from '@/modules/notes/components/note-editor'
import { useNotes } from '@/modules/notes/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/utilities'

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
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useNotes(selectedFolderId)

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

  const handleNoteContentChange = async (content: string) => {
    if (!selectedNote) return
    
    try {
      await updateNote({
        id: selectedNote.id,
        content
      })
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleNoteTitleChange = async (title: string) => {
    if (!selectedNote) return
    
    try {
      await updateNote({
        id: selectedNote.id,
        title
      })
    } catch (error) {
      console.error('Failed to save note title:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        'border-r border-border transition-all duration-300',
        sidebarCollapsed ? 'w-0' : 'w-80'
      )}>
        <div className={cn(
          'h-full flex flex-col',
          sidebarCollapsed && 'hidden'
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>
            
            <CreateNoteButton
              selectedFolderId={selectedFolderId}
              onCreateNote={handleCreateNote}
              className="w-full"
            />
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Folders</h3>
              {foldersLoading ? (
                <div className="text-sm text-muted-foreground">Loading folders...</div>
              ) : (
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
                  className="mb-4"
                />
              )}
            </div>

            {/* Notes in Selected Folder */}
            {selectedFolderId && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Notes in Folder
                </h3>
                {notesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading notes...</div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="p-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Note Editor */}
        <div className="flex-1">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              title={selectedNote.title}
              initialContent={selectedNote.content}
              onChange={handleNoteContentChange}
              onTitleChange={handleNoteTitleChange}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No note selected</h3>
                <p className="text-sm">
                  {selectedFolderId 
                    ? 'Select a note from the sidebar or create a new one'
                    : 'Select a folder first, then create or select a note'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
