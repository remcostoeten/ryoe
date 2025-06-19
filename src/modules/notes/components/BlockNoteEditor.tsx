import { useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

interface BlockNoteEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  readOnly?: boolean
  className?: string
}

export default function BlockNoteEditor({
  initialContent = '',
  onChange,
  readOnly = false,
  className
}: BlockNoteEditorProps) {
  // Create a new editor instance with default theme
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    defaultStyles: true,
    trailingBlock: true
  })

  // Handle content changes
  const handleChange = useCallback(() => {
    if (onChange) {
      const content = JSON.stringify(editor.topLevelBlocks)
      onChange(content)
    }
  }, [editor, onChange])

  return (
    <div className={`${className} relative`}>
      <div className="h-full bg-gradient-to-br from-background via-background/98 to-accent/5 rounded-lg border border-border/40 shadow-sm overflow-hidden">
        <div className="h-full p-6">
          <BlockNoteView
            editor={editor}
            theme="light"
            editable={!readOnly}
            onChange={handleChange}
            className="h-full [&_.bn-editor]:min-h-full [&_.bn-editor]:border-none [&_.bn-editor]:shadow-none [&_.bn-editor]:bg-transparent [&_.bn-editor]:rounded-none [&_.bn-container]:min-h-full [&_.bn-container]:bg-transparent"
          />
        </div>

        {/* Subtle bottom gradient for visual depth */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
