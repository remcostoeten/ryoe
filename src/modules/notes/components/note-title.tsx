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
    <div className="group flex items-start gap-4 mb-10 p-5 -mx-5 rounded-xl hover:bg-accent/10 transition-all duration-300 ease-out border border-transparent hover:border-border/20">
      <div className="flex-shrink-0 mt-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 border border-border/30">
          <Type className="h-4.5 w-4.5 text-muted-foreground/70" />
        </div>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-3xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 leading-tight"
            placeholder="Untitled Document"
            autoFocus
          />
        ) : (
          <div className="relative">
            <h1
              className="text-3xl font-bold tracking-tight text-foreground cursor-text leading-tight hover:text-foreground/90 transition-colors duration-200 mb-2"
              onClick={handleTitleClick}
            >
              {title || 'Untitled Document'}
            </h1>
            {!readOnly && (
              <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:translate-x-0 translate-x-2">
                <button
                  onClick={handleTitleClick}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/50 text-muted-foreground/60 hover:text-foreground/80 transition-all duration-200 border border-transparent hover:border-border/30"
                  title="Edit title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground/60">
            {isEditing ? 'Press Enter to save, Esc to cancel' : 'Click to edit title'}
          </span>
          {!isEditing && !readOnly && (
            <div className="flex items-center gap-1 text-muted-foreground/50">
              <span>•</span>
              <span className="text-xs">Press Enter to edit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 