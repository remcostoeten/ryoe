import { useEffect } from 'react'
import { useCreateBlockNote, BlockNoteViewRaw } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'

interface BlockNoteEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  readOnly?: boolean
}

function BlockNoteEditor({
  initialContent = '',
  onChange,
  readOnly = false
}: BlockNoteEditorProps) {
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

  return (
    <div className="h-full">
      <BlockNoteViewRaw
        editor={editor}
        editable={!readOnly}
        className="h-full"
      />
    </div>
  )
}

export default BlockNoteEditor
