import { useCallback, useMemo, useEffect } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
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
  const schema = useMemo(() => BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
    }
  }), [])

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    defaultStyles: true,
    trailingBlock: true
  })

  useEffect(() => {
    const styleId = 'blocknote-dark-theme'

    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* Dark theme overrides for BlockNote */
      .bn-container {
        --bn-colors-editor-background: rgb(11, 11, 11);
        --bn-colors-editor-text: oklch(0.985 0 0);
        --bn-colors-menu-background: rgb(18, 18, 18);
        --bn-colors-menu-text: oklch(0.985 0 0);
        --bn-colors-tooltip-background: rgb(28, 28, 28);
        --bn-colors-tooltip-text: oklch(0.985 0 0);
        --bn-colors-hovered-background: rgb(28, 28, 28);
        --bn-colors-selected-background: rgba(255, 255, 255, 0.1);
        --bn-colors-disabled-background: rgb(18, 18, 18);
        --bn-colors-disabled-text: oklch(0.556 0 0);
        --bn-colors-shadow: rgba(0, 0, 0, 0.3);
        --bn-colors-border: rgba(255, 255, 255, 0.1);
        --bn-colors-side-menu: rgb(18, 18, 18);
        --bn-colors-highlights-gray-background: rgb(28, 28, 28);
        --bn-colors-highlights-gray-text: oklch(0.985 0 0);
        --bn-border-radius: 0.625rem;
      }

      /* Slash menu styling */
      .bn-suggestion-menu {
        background: rgb(18, 18, 18) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 0.625rem !important;
        backdrop-filter: blur(8px) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
      }

      .bn-suggestion-menu .bn-suggestion-menu-item {
        color: oklch(0.985 0 0) !important;
        border-radius: 0.5rem !important;
        transition: all 0.15s ease !important;
      }

      .bn-suggestion-menu .bn-suggestion-menu-item:hover,
      .bn-suggestion-menu .bn-suggestion-menu-item[data-hovered] {
        background: rgb(28, 28, 28) !important;
        color: oklch(0.985 0 0) !important;
      }

      .bn-suggestion-menu .bn-suggestion-menu-item-title {
        color: oklch(0.985 0 0) !important;
        font-weight: 500 !important;
      }

      .bn-suggestion-menu .bn-suggestion-menu-item-badge {
        color: oklch(0.708 0 0) !important;
        font-size: 0.75rem !important;
      }

      /* Block selection and hover states */
      .bn-block-group:hover .bn-block-side-menu {
        opacity: 1 !important;
      }

      .bn-block-side-menu button {
        color: oklch(0.708 0 0) !important;
        transition: color 0.15s ease !important;
      }

      .bn-block-side-menu button:hover {
        color: oklch(0.985 0 0) !important;
        background: rgb(28, 28, 28) !important;
      }

      /* Placeholder text */
      .bn-block-content [data-content-type]:empty:before {
        color: oklch(0.556 0 0) !important;
      }

      /* Code blocks */
      .bn-block[data-content-type="codeBlock"] {
        background: rgb(18, 18, 18) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 0.5rem !important;
      }

      /* Tables */
      .bn-block[data-content-type="table"] {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 0.5rem !important;
        overflow: hidden !important;
      }

      .bn-block[data-content-type="table"] td,
      .bn-block[data-content-type="table"] th {
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      /* Image blocks */
      .bn-block[data-content-type="image"] {
        border-radius: 0.5rem !important;
        overflow: hidden !important;
      }

      /* Smooth focus transitions */
      .bn-block-content {
        transition: all 0.15s ease !important;
      }

      .bn-block-content:focus-within {
        transform: translateY(-1px) !important;
      }

      /* Enhanced visual polish */
      .bn-editor {
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        line-height: 1.6 !important;
      }

      .bn-editor h1, .bn-editor h2, .bn-editor h3 {
        font-weight: 600 !important;
        letter-spacing: -0.025em !important;
      }

      .bn-editor p {
        margin-bottom: 0.75rem !important;
      }

      /* List styling */
      .bn-editor ul, .bn-editor ol {
        margin-left: 1.5rem !important;
      }

      .bn-editor li {
        margin-bottom: 0.25rem !important;
      }

      /* Focus states */
      .bn-editor:focus {
        outline: none !important;
      }

      /* Improve readability */
      .bn-editor * {
        color: oklch(0.985 0 0) !important;
      }
    `

    document.head.appendChild(style)

    return () => {
      const styleEl = document.getElementById(styleId)
      if (styleEl) {
        styleEl.remove()
      }
    }
  }, [])

  const handleChange = useCallback(() => {
    if (onChange) {
      const content = JSON.stringify(editor.topLevelBlocks)
      onChange(content)
    }
  }, [editor, onChange])

  return (
    <div className={`${className} relative`}>
      <div className="h-full bg-gradient-to-br from-background via-card to-muted/5 rounded-xl border border-border/40 shadow-lg overflow-hidden backdrop-blur-sm">
        <div className="h-full p-6">
          <BlockNoteView
            editor={editor}
            theme="dark"
            editable={!readOnly}
            onChange={handleChange}
            className="h-full [&_.bn-editor]:min-h-full [&_.bn-editor]:border-none [&_.bn-editor]:shadow-none [&_.bn-editor]:bg-transparent [&_.bn-editor]:rounded-none [&_.bn-container]:min-h-full [&_.bn-container]:bg-transparent"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/60 via-background/20 to-transparent pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
