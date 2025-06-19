import { useState } from 'react'
import { Type, Edit3 } from 'lucide-react'

interface NoteTitleProps {
  title: string
  onChange: (title: string) => void
  readOnly?: boolean
}

export function NoteTitle({ title, onChange, readOnly = false }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleTitleClick = () => {
    if (!readOnly) {
      setIsEditing(true)
    }
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    }
  }

  return (
    <div className="group flex items-start gap-3 mb-8 p-4 -mx-4 rounded-lg hover:bg-accent/20 transition-colors">
      <div className="flex-shrink-0 mt-1">
        <Type className="h-5 w-5 text-muted-foreground/60" />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-3xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/50"
            placeholder="Untitled Document"
            autoFocus
          />
        ) : (
          <div className="relative">
            <h1
              className="text-3xl font-bold tracking-tight text-foreground cursor-text leading-tight hover:text-foreground/80 transition-colors"
              onClick={handleTitleClick}
            >
              {title || 'Untitled Document'}
            </h1>
            {!readOnly && (
              <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleTitleClick}
                  className="p-1.5 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 text-sm text-muted-foreground/70">
          <span>Click to edit title</span>
        </div>
      </div>
    </div>
  )
} 