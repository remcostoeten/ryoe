import React, { useState } from 'react'
import { FolderTree } from '@/modules/folder-management/components/folder-tree'
import { useFolders } from '@/modules/folder-management/hooks/use-folders'
import { useFolderOperations } from '@/modules/folder-management/hooks/use-folder-operations'
import { CreateNoteButton } from '@/modules/notes/components/create-note-button'
import { NoteList } from '@/modules/notes/components/note-list'
import { NoteEditor } from '@/modules/notes/components/note-editor'
import { useNotes } from '@/modules/notes/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // Note management
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useNotes(selectedFolderId)

  // Get the selected note
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const handleFolderSelect = (folderId: number) => {
    setSelectedFolderId(folderId)
    setSelectedNoteId(null) // Clear note selection when folder changes
  }

  const handleFolderExpand = (folderId: number) => {
    setExpandedFolderIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleCreateNote = async (noteData: any) => {
    const newNote = await createNote(noteData)
    setSelectedNoteId(newNote.id)
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
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  expandedFolderIds={expandedFolderIds}
                  onFolderSelect={handleFolderSelect}
                  onFolderExpand={handleFolderExpand}
                  onFolderCreate={createFolder}
                  onFolderRename={updateFolder}
                  onFolderDelete={deleteFolder}
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
                    notes={notes}
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
