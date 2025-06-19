import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Save, MoreHorizontal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoteEditor } from '@/modules/notes/components/note-editor'
import { useUpdateNote } from '@/mutations/note-mutations'
import { useFolderPath } from '@/queries/folder-queries'
import type { TNote } from '@/types/notes'

function useNote(noteId: number) {
  const [note, setNote] = useState<TNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNote() {
      try {
        setLoading(true)
        setError(null)

        // Import the service dynamically to avoid circular dependencies
        const { getNoteById } = await import('@/services/note-service')
        const response = await getNoteById(noteId)

        if (response.success && response.data) {
          const noteData: TNote = {
            id: response.data.id,
            title: response.data.title,
            content: response.data.content,
            folderId: response.data.folderId || null,
            position: response.data.position,
            isPublic: true, // Default value
            isFavorite: response.data.isFavorite || false,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
          }
          setNote(noteData)
        } else {
          setError(response.error || 'Note not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note')
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [noteId])

  return { note, loading, error, setNote }
}

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const noteIdNumber = noteId ? parseInt(noteId, 10) : null
  const { note, loading, error, setNote } = useNote(noteIdNumber!)
  const updateNoteMutation = useUpdateNote()

  // Get folder path for breadcrumbs
  const { data: folderPath = [] } = useFolderPath(note?.folderId || 0, {
    enabled: !!note?.folderId
  })

  const saveNote = async (title: string, content: string) => {
    if (!note) return

    try {
      await updateNoteMutation.mutateAsync({
        id: note.id,
        data: {
          title,
          content
        }
      })

      setNote(prev => prev ? { ...prev, title, content, updatedAt: new Date() } : null)
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleManualSave = () => {
    if (!note) return
    saveNote(note.title, note.content)
  }

  if (!noteIdNumber) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Invalid Note ID</h2>
          <Button onClick={() => navigate('/notes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Note Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The requested note could not be found.'}</p>
          <Button onClick={() => navigate('/notes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notes')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center text-sm text-muted-foreground">
              {folderPath.length > 0 ? (
                <>
                  {folderPath.map((folder, index) => (
                    <span key={folder.id} className="flex items-center">
                      <span className="text-muted-foreground/70">{folder.name}</span>
                      {index < folderPath.length - 1 && (
                        <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
                      )}
                    </span>
                  ))}
                  <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
                </>
              ) : null}
              <span className="font-medium text-foreground">{note.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600">Unsaved changes</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={!hasUnsavedChanges}
              className="text-muted-foreground hover:text-foreground"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1">
        {note ? (
          <NoteEditor
            key={note.id}
            noteId={note.id}
            readOnly={false}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Note not found</h3>
              <p className="text-sm">The note you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
