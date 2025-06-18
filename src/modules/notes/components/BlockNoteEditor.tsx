import { useCallback } from 'react'

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
  // Handle content changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }, [onChange])

  // Parse initial content - if it's JSON (BlockNote format), extract text
  let displayContent = initialContent
  if (initialContent && initialContent.startsWith('[') && initialContent.endsWith(']')) {
    try {
      const blocks = JSON.parse(initialContent)
      if (Array.isArray(blocks)) {
        // Extract text from BlockNote blocks
        displayContent = blocks
          .map(block => {
            if (block.content && Array.isArray(block.content)) {
              return block.content
                .map(item => item.text || '')
                .join('')
            }
            return ''
          })
          .join('\n')
      }
    } catch {
      // If parsing fails, use as-is
      displayContent = initialContent
    }
  }

  return (
    <div className={className}>
      <textarea
        value={displayContent}
        onChange={handleChange}
        readOnly={readOnly}
        className="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Start writing your note..."
      />
    </div>
  )
}
