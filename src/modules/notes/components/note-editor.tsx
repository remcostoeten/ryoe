import React, { useState, lazy, Suspense, memo } from 'react'
import { Type, FileText } from 'lucide-react'
import { cn } from '@/utilities/styling'

// Lazy load the heavy BlockNote editor
const BlockNoteEditor = lazy(() => import('./BlockNoteEditor'))

interface NoteEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  title?: string
  className?: string
  readOnly?: boolean
  useRichEditor?: boolean
}

export const NoteEditor = memo(function NoteEditor({
  initialContent = '',
  onChange,
  onTitleChange,
  title = 'Untitled',
  className,
  readOnly = false,
  useRichEditor = false
}: NoteEditorProps) {
  const [noteTitle, setNoteTitle] = useState(title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isRichEditor, setIsRichEditor] = useState(useRichEditor)

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
    onTitleChange?.(noteTitle)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    }
    if (e.key === 'Escape') {
      setNoteTitle(title)
      setIsEditingTitle(false)
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Note Title */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="text-2xl font-bold bg-transparent border-none outline-none flex-1"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 flex-1"
              onClick={() => !readOnly && setIsEditingTitle(true)}
            >
              {noteTitle}
            </h1>
          )}

          {/* Editor Mode Toggle */}
          {!readOnly && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setIsRichEditor(false)}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  !isRichEditor
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
                title="Simple Editor"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsRichEditor(true)}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  isRichEditor
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
                title="Rich Text Editor"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isRichEditor ? (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }>
            <BlockNoteEditor
              initialContent={initialContent}
              onChange={onChange}
              readOnly={readOnly}
            />
          </Suspense>
        ) : (
          <div className="min-h-full">
            <textarea
              value={initialContent || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 border-none outline-none resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="Start writing..."
              readOnly={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  )
})
