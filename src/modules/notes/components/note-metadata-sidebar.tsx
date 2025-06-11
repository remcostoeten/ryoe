import { memo, useState } from "react"
import {
  FileText,
  Hash,
  Clock,
  User,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Tag,
  History,
  Download,
  Share,
  Printer,
  Plus,
  X
} from "lucide-react"
import { cn } from "@/utilities"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useNoteTags } from "@/hooks/use-tags"
import { useCreateTag, useAddTagToNote, useRemoveTagFromNote } from "@/mutations/tag-mutations"
import { getContrastColor, getRandomTagColor } from "@/types/tags"
import { exportNote, printNote, shareNote, getNoteHistory, exportNoteHistory } from "@/services"
import type { TNote } from "@/types/notes"
import type { TTag } from "@/types/tags"

type TNoteMetadataSidebarProps = {
  note: TNote
  onToggleFavorite?: (note: TNote) => void
  onToggleVisibility?: (note: TNote) => void
  className?: string
  onClose: () => void
}

// Note metadata component
const NoteMetadata = memo(({ note }: { note: TNote }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getWordCount = (content: string) => {
    try {
      const blocks = JSON.parse(content)
      if (Array.isArray(blocks)) {
        return blocks.reduce((count, block) => {
          if (block.content && Array.isArray(block.content)) {
            return count + block.content.reduce((textCount: number, item: any) => {
              if (item.text) {
                return textCount + item.text.split(/\s+/).filter(Boolean).length
              }
              return textCount
            }, 0)
          }
          return count
        }, 0)
      }
    } catch {
      // Fallback for plain text
      return content.split(/\s+/).filter(Boolean).length
    }
    return 0
  }

  const wordCount = getWordCount(note.content)
  const charCount = note.content.length
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
        <FileText className="h-3 w-3" />
        NOTE INFO
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hash className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{note.title}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>Modified: {formatDate(note.updatedAt)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>Created: {formatDate(note.createdAt)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3 w-3 flex-shrink-0" />
          <span>Author: You</span>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{wordCount}</div>
              <div className="text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{charCount}</div>
              <div className="text-muted-foreground">Characters</div>
            </div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded mt-2">
            <div className="font-medium">{readingTime} min</div>
            <div className="text-muted-foreground">Reading time</div>
          </div>
        </div>
      </div>
    </div>
  )
})

NoteMetadata.displayName = "NoteMetadata"

// Note properties component
const NoteProperties = memo(({ 
  note, 
  onToggleFavorite, 
  onToggleVisibility 
}: { 
  note: TNote
  onToggleFavorite?: (note: TNote) => void
  onToggleVisibility?: (note: TNote) => void
}) => (
  <div className="p-4 border-t border-border">
    <h3 className="text-sm font-medium mb-3 text-muted-foreground">
      PROPERTIES
    </h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Star className={cn("h-3 w-3", note.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
          <span>Favorite</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite?.(note)}
          className="h-6 px-2 text-xs"
        >
          {note.isFavorite ? "Remove" : "Add"}
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {note.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span>Visibility</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility?.(note)}
          className="h-6 px-2 text-xs"
        >
          {note.isPublic ? "Private" : "Public"}
        </Button>
      </div>
    </div>
  </div>
))

NoteProperties.displayName = "NoteProperties"

// Tags component with full functionality
const NoteTags = memo(({ note }: { note: TNote }) => {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  const { data: noteTags = [], isLoading: isLoadingTags } = useNoteTags(note.id)
  const createTagMutation = useCreateTag()
  const addTagToNoteMutation = useAddTagToNote()
  const removeTagFromNoteMutation = useRemoveTagFromNote()

  const handleAddTag = async () => {
    if (!newTagName.trim()) return

    try {
      // First create the tag
      const newTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: getRandomTagColor()
      })

      // Then add it to the note
      await addTagToNoteMutation.mutateAsync({
        noteId: note.id,
        tagId: newTag.id
      })

      setNewTagName("")
      setIsAddingTag(false)
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const handleRemoveTag = async (tag: TTag) => {
    try {
      await removeTagFromNoteMutation.mutateAsync({
        noteId: note.id,
        tagId: tag.id
      })
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag()
    } else if (e.key === 'Escape') {
      setNewTagName("")
      setIsAddingTag(false)
    }
  }

  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
        <Tag className="h-3 w-3" />
        TAGS
      </h3>
      <div className="space-y-2">
        {/* Existing tags */}
        <div className="flex flex-wrap gap-1">
          {isLoadingTags ? (
            <div className="text-xs text-muted-foreground">Loading tags...</div>
          ) : noteTags.length > 0 ? (
            noteTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs group relative pr-6"
                style={{
                  backgroundColor: tag.color,
                  color: getContrastColor(tag.color),
                  borderColor: tag.color
                }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="absolute right-1 top-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No tags yet</div>
          )}
        </div>

        {/* Add tag input or button */}
        {isAddingTag ? (
          <div className="flex gap-1">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTagName.trim()) {
                  setIsAddingTag(false)
                }
              }}
              placeholder="Tag name"
              className="h-6 text-xs"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleAddTag}
              disabled={!newTagName.trim() || createTagMutation.isPending}
            >
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={() => setIsAddingTag(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add tag
          </Button>
        )}
      </div>
    </div>
  )
})

NoteTags.displayName = "NoteTags"

// Quick actions component
const NoteActions = memo(({ note }: { note: TNote }) => {
  const handleExport = async (format: 'markdown' | 'html' | 'json') => {
    try {
      const result = await exportNote(note, format)
      if (result.success) {
        console.log('Export successful:', result.data)
      } else {
        console.error('Export failed:', result.error)
        alert(`Export failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    }
  }

  const handlePrint = async () => {
    try {
      const result = await printNote(note)
      if (result.success) {
        console.log('Print successful:', result.data)
      } else {
        console.error('Print failed:', result.error)
        alert(`Print failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Print error:', error)
      alert('Print failed. Please try again.')
    }
  }

  const handleShare = async () => {
    try {
      const result = await shareNote(note)
      if (result.success) {
        console.log('Share successful:', result.data)
        // You could show a toast notification here
      } else {
        console.error('Share failed:', result.error)
        alert(`Share failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Share failed. Please try again.')
    }
  }

  const handleViewHistory = async () => {
    try {
      const result = await getNoteHistory(note.id)
      if (result.success) {
        const history = result.data!
        if (history.length === 0) {
          alert('No history available for this note.')
        } else {
          const historyText = history.map(entry =>
            `${entry.timestamp.toLocaleString()} - ${entry.changeType}: ${entry.title} (${entry.wordCount} words)`
          ).join('\n')
          alert(`Note History:\n\n${historyText}`)
        }
      } else {
        console.error('History failed:', result.error)
        alert(`Failed to load history: ${result.error}`)
      }
    } catch (error) {
      console.error('History error:', error)
      alert('Failed to load history. Please try again.')
    }
  }

  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">
        ACTIONS
      </h3>
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2 text-xs"
          onClick={() => handleExport('markdown')}
        >
          <Download className="h-3 w-3 mr-2" />
          Export as Markdown
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2 text-xs"
          onClick={() => handleExport('html')}
        >
          <Download className="h-3 w-3 mr-2" />
          Export as HTML
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2 text-xs"
          onClick={handleShare}
        >
          <Share className="h-3 w-3 mr-2" />
          Copy to clipboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2 text-xs"
          onClick={handlePrint}
        >
          <Printer className="h-3 w-3 mr-2" />
          Print note
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2 text-xs"
          onClick={handleViewHistory}
        >
          <History className="h-3 w-3 mr-2" />
          View history
        </Button>
      </div>
    </div>
  )
})

NoteActions.displayName = "NoteActions"

// Main note metadata sidebar component
export function NoteMetadataSidebar({ 
  note, 
  onToggleFavorite, 
  onToggleVisibility,
  className,
  onClose
}: TNoteMetadataSidebarProps) {
  return (
    <aside className={cn("w-64 border-l border-border bg-background flex flex-col h-full flex-shrink-0", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Note Info</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            title="Close metadata"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Note metadata */}
        <NoteMetadata note={note} />
        
        {/* Note properties */}
        <NoteProperties 
          note={note} 
          onToggleFavorite={onToggleFavorite}
          onToggleVisibility={onToggleVisibility}
        />
        
        {/* Tags */}
        <NoteTags note={note} />
        
        {/* Quick actions */}
        <NoteActions note={note} />
      </ScrollArea>
    </aside>
  )
}
