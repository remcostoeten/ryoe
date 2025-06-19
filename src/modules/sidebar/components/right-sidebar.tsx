"use client"

import { memo, useState, useEffect } from "react"
import { useLocation, useParams } from "react-router"
import { BookOpen, FileText, Hash, Clock, User, Calendar } from "lucide-react"
import { cn } from '@/shared/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToc } from "@/hooks/use-toc"
import { NoteMetadataSidebar } from '@/application/features/workspace/modules/notes/components/note-metadata-sidebar'
import { useToggleNoteFavorite } from "@/mutations/use-toggle-note-favorite"
import type { TNote } from '@/domain/entities/workspace'

type TocItem = {
  id: string
  title: string
  level: number
}

// Table of Contents component for docs and markdown content
const TableOfContents = memo(({ toc }: { toc: TocItem[] }) => {
  if (toc.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No headings found in this document.
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
        <BookOpen className="h-3 w-3" />
        ON THIS PAGE
      </h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <ul className="space-y-1 pr-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md hover:bg-accent",
                  item.level === 2 && "pl-2",
                  item.level === 3 && "pl-4",
                  item.level === 4 && "pl-6",
                  item.level >= 5 && "pl-8"
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
})

TableOfContents.displayName = "TableOfContents"

// Document metadata component
const DocumentMetadata = memo(({ documentTitle }: { documentTitle: string }) => (
  <div className="p-4 border-t border-border">
    <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
      <FileText className="h-3 w-3" />
      DOCUMENT INFO
    </h3>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Hash className="h-3 w-3" />
        <span className="truncate">{documentTitle}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Last modified: Today</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-3 w-3" />
        <span>Author: You</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Created: Today</span>
      </div>
    </div>
  </div>
))

DocumentMetadata.displayName = "DocumentMetadata"

// Quick actions component
const QuickActions = memo(() => (
  <div className="p-4 border-t border-border">
    <h3 className="text-sm font-medium mb-3 text-muted-foreground">
      QUICK ACTIONS
    </h3>
    <div className="space-y-1">
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Export as PDF
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Share document
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Print document
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        View history
      </button>
    </div>
  </div>
))

QuickActions.displayName = "QuickActions"

// Hook to load note data for individual note pages
function useNoteData(noteId: number | null) {
  const [note, setNote] = useState<TNote | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!noteId) {
      setNote(null)
      return
    }

    async function loadNote() {
      try {
        setLoading(true)
        const { getNoteById } = await import('@/services/note-service')
        const response = await getNoteById(noteId!)

        if (response.success && response.data) {
          const noteData: TNote = {
            id: response.data.id,
            title: response.data.title,
            content: response.data.content,
            folderId: response.data.folderId || null,
            position: response.data.position,
            isPublic: true,
            isFavorite: response.data.isFavorite || false,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
          }
          setNote(noteData)
        }
      } catch (error) {
        console.error('Failed to load note for sidebar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [noteId])

  return { note, loading }
}

// Main right sidebar component
export function RightSidebar({ documentTitle = "Untitled Document" }: { documentTitle?: string }) {
  const location = useLocation()
  const params = useParams<{ noteId: string }>()
  const { toc, isLoading } = useToc()
  const toggleNoteFavoriteMutation = useToggleNoteFavorite()

  const isDocsPage = location.pathname.startsWith('/docs')
  const isNotesPage = location.pathname.startsWith('/notes')
  const isIndividualNotePage = location.pathname.match(/^\/notes\/\d+$/)

  const noteId = params.noteId ? parseInt(params.noteId, 10) : null
  const { note, loading: noteLoading } = useNoteData(noteId)

  const handleToggleFavorite = async (note: TNote) => {
    try {
      await toggleNoteFavoriteMutation.mutateAsync(note.id)
      console.log('Note favorite status toggled:', note.title)
    } catch (error) {
      console.error('Failed to toggle note favorite:', error)
    }
  }

  const handleToggleVisibility = (note: TNote) => {
    // TODO: Implement visibility toggle when isPublic field is properly implemented
    console.log('Toggle visibility:', note.id, 'Current:', note.isPublic)
  }

  // If this is an individual note page, show the note metadata sidebar
  if (isIndividualNotePage && note) {
    return (
      <NoteMetadataSidebar
        note={note}
        onToggleFavorite={handleToggleFavorite}
        onToggleVisibility={handleToggleVisibility}
        onClose={() => { }}
      />
    )
  }

  // If loading note data for individual note page
  if (isIndividualNotePage && noteLoading) {
    return (
      <aside className="w-64 border-l border-border bg-background flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Note Details</h2>
          <p className="text-xs text-muted-foreground mt-1">⌘⇧B to toggle</p>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
            <div className="h-3 bg-muted rounded w-28"></div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 border-l border-border bg-background flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Right Sidebar</h2>
        <p className="text-xs text-muted-foreground mt-1">⌘⇧B to toggle</p>
      </div>

      {/* Table of Contents - show for docs and notes pages */}
      {(isDocsPage || isNotesPage) && (
        <>
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
                <div className="h-3 bg-muted rounded w-36"></div>
              </div>
            </div>
          ) : (
            <TableOfContents toc={toc} />
          )}
        </>
      )}

      {/* Document metadata */}
      <DocumentMetadata documentTitle={documentTitle} />

      {/* Quick actions */}
      <QuickActions />

      {/* Spacer to push content to top */}
      <div className="flex-1" />
    </aside>
  )
}
