import { useEffect } from 'react'
import { useCreateBlockNote, BlockNoteView } from '@blocknote/react'
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'

interface BlockNoteEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  readOnly?: boolean
}

// Enhanced schema with more block types
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    // Add more block types as needed
  },
})

function BlockNoteEditor({
  initialContent = '',
  onChange,
  readOnly = false
}: BlockNoteEditorProps) {
  // Create the BlockNote editor with enhanced configuration
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent ? JSON.parse(initialContent) : [
      {
        type: "paragraph",
        content: "",
      },
    ],
    // Enable animations for better UX
    animations: true,
    // Enable drag and drop
    dragAndDrop: true,
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

  // Add markdown shortcuts for instant conversion
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle space key for markdown shortcuts
      if (event.key !== ' ') return

      const selection = editor.getTextCursorPosition()
      if (!selection) return

      const currentBlock = selection.block
      const currentText = currentBlock.content?.[0]?.text || ''

      // Markdown shortcuts mapping
      const shortcuts: Record<string, { type: string; props: any }> = {
        '#': { type: 'heading', props: { level: 1 } },
        '##': { type: 'heading', props: { level: 2 } },
        '###': { type: 'heading', props: { level: 3 } },
        '####': { type: 'heading', props: { level: 4 } },
        '#####': { type: 'heading', props: { level: 5 } },
        '######': { type: 'heading', props: { level: 6 } },
        '-': { type: 'bulletListItem', props: {} },
        '*': { type: 'bulletListItem', props: {} },
        '1.': { type: 'numberedListItem', props: {} },
        '>': { type: 'paragraph', props: {} }, // Will be enhanced to quote later
        '```': { type: 'codeBlock', props: {} },
      }

      // Check if current text matches any markdown shortcut
      for (const [shortcut, blockConfig] of Object.entries(shortcuts)) {
        if (currentText.trim() === shortcut) {
          event.preventDefault()

          try {
            // Update the current block to the new type
            editor.updateBlock(currentBlock, {
              type: blockConfig.type as any,
              props: blockConfig.props,
              content: [] // Clear content after conversion
            })

            console.log(`Converted "${shortcut}" to ${blockConfig.type}`)
          } catch (error) {
            console.error('Markdown conversion error:', error)
          }

          return
        }
      }
    }

    // Add event listener to the editor's DOM element
    const editorElement = editor.domElement
    if (editorElement) {
      editorElement.addEventListener('keydown', handleKeyDown)
      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [editor])

  return (
    <div className="h-full">
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        className="h-full"
        theme="light"
        // Enable slash menu
        slashMenu={true}
        // Enable formatting toolbar
        formattingToolbar={true}
        // Enable link toolbar
        linkToolbar={true}
        // Enable side menu (block handles)
        sideMenu={true}
      />
    </div>
  )
}

export default BlockNoteEditor
