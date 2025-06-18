import { useCallback } from 'react'
import { BlockNoteViewRaw as BlockNoteView, useCreateBlockNote, getDefaultReactSlashMenuItems, DefaultReactSuggestionItem, SuggestionMenuController } from '@blocknote/react'
import { filterSuggestionItems } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/core/style.css'
import '@blocknote/mantine/style.css'
import { uploadFile as uploadFileService } from '@/services/file-service'

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
  // Create a new editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    defaultStyles: true,
    trailingBlock: true,
    uploadFile: async (file: File): Promise<string> => {
      try {
        // Show upload progress in the editor
        const progressBlock = editor.insertBlocks([{
          type: 'paragraph',
          content: [{ type: 'text', text: `Uploading ${file.name}...`, styles: {} }]
        }], editor.getTextCursorPosition().block, 'before')[0]

        // Upload the file
        const result = await uploadFileService(file, (progress) => {
          // Update progress in the editor
          editor.updateBlock(progressBlock, {
            type: 'paragraph',
            content: [{ type: 'text', text: `Uploading ${file.name}... ${Math.round(progress)}%`, styles: {} }]
          })
        })

        // Remove the progress block
        editor.removeBlocks([progressBlock])

        if (!result.success) {
          throw new Error(result.error || 'Upload failed')
        }

        return result.data.url
      } catch (error) {
        console.error('Failed to upload file:', error)
        // Show error message in the editor
        editor.insertBlocks([{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            styles: { textColor: 'red' }
          }]
        }], editor.getTextCursorPosition().block, 'before')
        throw error
      }
    }
  })

  // Handle content changes
  const handleChange = useCallback(() => {
    if (onChange) {
      const content = JSON.stringify(editor.topLevelBlocks)
      onChange(content)
    }
  }, [editor, onChange])

  // Get custom slash menu items
  const getItems = useCallback(async (query: string): Promise<DefaultReactSuggestionItem[]> => {
    const items = getDefaultReactSlashMenuItems(editor)
    return filterSuggestionItems(items, query)
  }, [editor])

  // Render the editor
  return (
    <div className={className}>
      <BlockNoteView
        editor={editor}
        theme="light"
        editable={!readOnly}
        formattingToolbar={!readOnly}
        linkToolbar={!readOnly}
        sideMenu={!readOnly}
        slashMenu={false}
        emojiPicker={!readOnly}
        tableHandles={!readOnly}
        onChange={handleChange}
      >
        {!readOnly && (
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={getItems}
          />
        )}
      </BlockNoteView>
    </div>
  )
}
