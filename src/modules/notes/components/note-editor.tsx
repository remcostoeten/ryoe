import BlockNoteEditor from './BlockNoteEditor'
import { NoteEditorToolbar } from './note-editor-toolbar'
import { NoteMetadataSidebar } from './note-metadata-sidebar'
import { NoteTitle } from './note-title'
import { useNoteContent } from '../hooks/use-note-content'
import { useNoteTitle } from '../hooks/use-note-title'
import { useNoteEditorConfig } from '../hooks/use-note-editor-config'
import { cn } from '@/utilities/styling'
import { useQuery } from '@tanstack/react-query'
import { getNoteById } from '@/services/note-service'
import type { TNote } from '@/types/notes'

interface NoteEditorProps {
  noteId: number
  readOnly?: boolean
  className?: string
}

export function NoteEditor({ noteId, readOnly = false, className }: NoteEditorProps) {
  const { title, updateTitle } = useNoteTitle(noteId)
  const { content, updateContent } = useNoteContent(noteId)
  const { showMetadata, toggleMetadata } = useNoteEditorConfig()

  // Get the full note data for the sidebar
  const { data: noteResult } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId)
  })

  // Convert TNoteWithMetadata to TNote
  const note: TNote | undefined = noteResult?.success && noteResult.data ? {
    id: noteResult.data.id,
    title: noteResult.data.title,
    content: noteResult.data.content,
    folderId: noteResult.data.folderId || null,
    position: noteResult.data.position,
    isPublic: false, // Default to private since TNoteWithMetadata doesn't have this field
    isFavorite: noteResult.data.isFavorite,
    createdAt: new Date(noteResult.data.createdAt * 1000),
    updatedAt: new Date(noteResult.data.updatedAt * 1000)
  } : undefined

  return (
    <div className={cn('flex h-full', className)}>
      <div className="flex-1 flex flex-col">
        <NoteEditorToolbar
          noteId={noteId}
          readOnly={readOnly}
          onToggleMetadata={toggleMetadata}
        />
        <div className="flex-1 overflow-auto p-4">
          <NoteTitle
            title={title}
            onChange={updateTitle}
            readOnly={readOnly}
          />
          <BlockNoteEditor
            initialContent={content}
            onChange={updateContent}
            readOnly={readOnly}
            className="mt-4"
          />
        </div>
      </div>
      {showMetadata && note && (
        <NoteMetadataSidebar
          note={note}
          onClose={() => toggleMetadata(false)}
        />
      )}
    </div>
  )
}
