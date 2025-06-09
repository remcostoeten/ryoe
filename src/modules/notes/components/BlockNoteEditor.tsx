
import { useState, useRef, useEffect } from 'react'

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
  const [content, setContent] = useState(() => {
    // Try to extract text content from JSON if it's BlockNote format
    try {
      if (initialContent) {
        const parsed = JSON.parse(initialContent)
        if (Array.isArray(parsed)) {
          // Extract text from BlockNote blocks
          return parsed.map(block => {
            if (block.content && Array.isArray(block.content)) {
              return block.content.map((item: any) => item.text || '').join('')
            }
            return ''
          }).join('\n')
        }
      }
    } catch (error) {
      // If parsing fails, use as plain text
      return initialContent
    }
    return initialContent
  })

  const editorRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  // Convert markdown to HTML with inline styling
  const convertMarkdownToHTML = (text: string): string => {
    let html = text
      // Headers (must be at start of line)
      .replace(/^#### (.*$)/gm, '<h4 style="font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; color: inherit;">$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; color: inherit;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: 600; margin: 0.75rem 0; color: inherit;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.875rem; font-weight: 700; margin: 1rem 0; color: inherit;">$1</h1>')
      // Lists
      .replace(/^[\*\-\+] (.*$)/gm, '<li style="margin-left: 1rem; list-style-type: disc;">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left: 1rem; list-style-type: decimal;">$2</li>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 0.5rem 0; color: #6b7280; font-style: italic;">$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.875em; overflow-x: auto; margin: 0.5rem 0;"><code>$1</code></pre>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
      .replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      .replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">$1</code>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through;">$1</del>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0;">')
      // Line breaks
      .replace(/\n/g, '<br>')

    return html
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return

    const target = e.currentTarget
    const text = target.innerText || ''
    setContent(text)

    // Convert plain text to BlockNote format for compatibility
    const blockNoteFormat = text.split('\n').map((line, index) => ({
      id: `block-${index}`,
      type: 'paragraph',
      content: [{ type: 'text', text: line }]
    }))
    onChange?.(JSON.stringify(blockNoteFormat))

    // Trigger immediate markdown conversion
    setTimeout(() => {
      if (editorRef.current && !isComposing) {
        const html = convertMarkdownToHTML(text)
        if (editorRef.current.innerHTML !== html) {
          // Save cursor position
          const selection = window.getSelection()
          const range = selection?.rangeCount ? selection.getRangeAt(0) : null
          const startOffset = range?.startOffset || 0

          editorRef.current.innerHTML = html

          // Restore cursor position
          if (range && editorRef.current.lastChild) {
            try {
              const newRange = document.createRange()
              const lastNode = editorRef.current.lastChild
              const textNode = lastNode.nodeType === Node.TEXT_NODE ? lastNode : lastNode.lastChild || lastNode
              const maxOffset = textNode.textContent?.length || 0
              newRange.setStart(textNode, Math.min(startOffset, maxOffset))
              newRange.setEnd(textNode, Math.min(startOffset, maxOffset))
              selection?.removeAllRanges()
              selection?.addRange(newRange)
            } catch (error) {
              // Ignore cursor positioning errors
            }
          }
        }
      }
    }, 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Get current selection
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)

      // Insert line break
      const br = document.createElement('br')
      range.deleteContents()
      range.insertNode(br)

      // Move cursor after the br
      range.setStartAfter(br)
      range.setEndAfter(br)
      selection.removeAllRanges()
      selection.addRange(range)

      // Trigger input event to update content
      handleInput({ currentTarget: e.currentTarget } as React.FormEvent<HTMLDivElement>)
    }
  }

  // Update the display when content changes
  useEffect(() => {
    if (editorRef.current && !isComposing) {
      const html = convertMarkdownToHTML(content)
      if (editorRef.current.innerHTML !== html) {
        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null
        const startOffset = range?.startOffset || 0

        editorRef.current.innerHTML = html

        // Try to restore cursor position
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange()
            const textNode = editorRef.current.firstChild
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0))
            newRange.setEnd(textNode, Math.min(startOffset, textNode.textContent?.length || 0))
            selection?.removeAllRanges()
            selection?.addRange(newRange)
          } catch (error) {
            // Ignore cursor positioning errors
          }
        }
      }
    }
  }, [content, isComposing])

  return (
    <div className="h-full">
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        className="markdown-editor w-full h-full min-h-[400px] p-4 border-none outline-none resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm leading-relaxed"
        style={{
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={content ? '' : 'Start writing... Try # heading, **bold**, *italic*, `code`, - lists, > quotes, ```code blocks```'}
        suppressContentEditableWarning={true}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .markdown-editor[data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: rgb(156 163 175);
            pointer-events: none;
          }
        `
      }} />
    </div>
  )
}

export default BlockNoteEditor
