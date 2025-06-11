import { useState } from 'react'
import { Type } from 'lucide-react'

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
    <div className="flex items-center gap-2">
      <Type className="h-4 w-4 text-muted-foreground" />
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-lg font-medium"
          autoFocus
        />
      ) : (
        <h1
          className="flex-1 text-lg font-medium cursor-text truncate"
          onClick={handleTitleClick}
        >
          {title}
        </h1>
      )}
    </div>
  )
} 