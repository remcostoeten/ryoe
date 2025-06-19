"use client"

import { useState, useMemo } from "react"
import { Star, Folder, FileText, X, Search } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/shared/utils'
import { useFavorites } from "@/queries/use-favorites"
import type { TNote } from '@/domain/entities/workspace'
import type { TNoteWithMetadata } from '@/domain/entities/workspace'

type TFavoritesPanelProps = {
  isOpen: boolean
  onClose: () => void
  onFolderSelect?: (folderId: number) => void
  onNoteSelect?: (note: TNote) => void
  className?: string
}

export function FavoritesPanel({
  isOpen,
  onClose,
  onFolderSelect,
  onNoteSelect,
  className
}: TFavoritesPanelProps) {
  const { folders, notes, isLoading, error } = useFavorites()
  const [activeTab, setActiveTab] = useState<'all' | 'folders' | 'notes'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Filter by search query and active tab
  const filteredFolders = useMemo(() => {
    if (activeTab === 'notes') return []
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [folders, activeTab, searchQuery])

  const filteredNotes = useMemo(() => {
    if (activeTab === 'folders') return []
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [notes, activeTab, searchQuery])

  function handleFolderClick(folderId: number) {
    onFolderSelect?.(folderId)
    onClose()
  }

  function handleNoteClick(note: TNoteWithMetadata) {
    // Convert TNoteWithMetadata to TNote for the callback
    const noteForCallback: TNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      folderId: note.folderId || null,
      position: note.position,
      isPublic: true, // Default value
      isFavorite: note.isFavorite,
      createdAt: new Date(note.createdAt * 1000),
      updatedAt: new Date(note.updatedAt * 1000)
    }

    onNoteSelect?.(noteForCallback)
    onClose()
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="fixed right-4 top-16 w-80 max-h-[80vh] bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <h2 className="font-semibold">Favorites</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === 'all'
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('all')}
          >
            All ({folders.length + notes.length})
          </button>
          <button
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === 'folders'
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('folders')}
          >
            Folders ({folders.length})
          </button>
          <button
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === 'notes'
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({notes.length})
          </button>
        </div>

        {/* Search */}
        {(folders.length > 0 || notes.length > 0) && (
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading favorites...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              <X className="h-4 w-4 mx-auto mb-2" />
              Failed to load favorites
              <button
                onClick={() => window.location.reload()}
                className="block mx-auto mt-2 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : (filteredFolders.length === 0 && filteredNotes.length === 0) ? (
            <div className="p-4 text-center text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No favorites yet</p>
              <p className="text-xs mt-1">Right-click on folders or notes to add them to favorites</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <button
                  key={`folder-${folder.id}`}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{folder.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {folder.noteCount || 0}
                  </span>
                </button>
              ))}

              {/* Separator if both folders and notes exist */}
              {filteredFolders.length > 0 && filteredNotes.length > 0 && (
                <Separator className="my-2" />
              )}

              {/* Notes */}
              {filteredNotes.map((note) => (
                <button
                  key={`note-${note.id}`}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                  onClick={() => handleNoteClick(note)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
