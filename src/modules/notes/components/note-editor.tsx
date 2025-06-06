import React, { useEffect, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'
import { cn } from '@/utilities/styling'

interface NoteEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  title?: string
  className?: string
  readOnly?: boolean
}

export function NoteEditor({
  initialContent = '',
  onChange,
  onTitleChange,
  title = 'Untitled',
  className,
  readOnly = false
}: NoteEditorProps) {
  const [noteTitle, setNoteTitle] = useState(title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  // Create the BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
  })

  // Handle content changes
  useEffect(() => {
    if (!onChange) return

    const handleChange = () => {
      const content = JSON.stringify(editor.document)
      onChange(content)
    }

    editor.onChange(handleChange)
  }, [editor, onChange])

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
        {isEditingTitle ? (
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold bg-transparent border-none outline-none w-full"
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1"
            onClick={() => !readOnly && setIsEditingTitle(true)}
          >
            {noteTitle}
          </h1>
        )}
      </div>

      {/* BlockNote Editor */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* BlockNote editor placeholder */}
          <textarea
            value={initialContent || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-full min-h-[400px] p-4 border-none outline-none resize-none"
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  )
}
