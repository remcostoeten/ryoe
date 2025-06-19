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
import { exportNote, printNote, shareNote, getNoteHistory } from "@/services"
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
    <div className="p-5 border-b border-border/30">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground/80 flex items-center gap-2.5 uppercase tracking-wide">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/40 border border-border/30">
          <FileText className="h-3 w-3 text-muted-foreground/70" />
        </div>
        Note Details
      </h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
          <Hash className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground/60 mb-1">Title</div>
            <div className="font-medium text-foreground/90 truncate">{note.title}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/60">Modified</span>
            </div>
            <div className="text-xs font-medium text-foreground/80">{formatDate(note.updatedAt)}</div>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/60">Created</span>
            </div>
            <div className="text-xs font-medium text-foreground/80">{formatDate(note.createdAt)}</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/60">Author</span>
          </div>
          <div className="text-xs font-medium text-foreground/80">You</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-gradient-to-br from-muted/30 to-muted/20 rounded-lg border border-border/20">
            <div className="font-semibold text-foreground/90">{wordCount}</div>
            <div className="text-xs text-muted-foreground/60 mt-1">Words</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-muted/30 to-muted/20 rounded-lg border border-border/20">
            <div className="font-semibold text-foreground/90">{charCount}</div>
            <div className="text-xs text-muted-foreground/60 mt-1">Characters</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-muted/30 to-muted/20 rounded-lg border border-border/20">
            <div className="font-semibold text-foreground/90">{readingTime} min</div>
            <div className="text-xs text-muted-foreground/60 mt-1">Read time</div>
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
  <div className="p-5 border-b border-border/30">
    <h3 className="text-sm font-semibold mb-4 text-muted-foreground/80 uppercase tracking-wide">
      Properties
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-all duration-200">
        <div className="flex items-center gap-3 text-sm">
          <Star className={cn("h-4 w-4", note.isFavorite ? "text-amber-500 fill-current" : "text-muted-foreground/60")} />
          <span className="font-medium text-foreground/90">Favorite</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite?.(note)}
          className="h-7 px-3 text-xs hover:bg-accent/50 transition-all duration-200"
        >
          {note.isFavorite ? "Remove" : "Add"}
        </Button>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-all duration-200">
        <div className="flex items-center gap-3 text-sm">
          {note.isPublic ? <Eye className="h-4 w-4 text-muted-foreground/60" /> : <EyeOff className="h-4 w-4 text-muted-foreground/60" />}
          <span className="font-medium text-foreground/90">Visibility</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility?.(note)}
          className="h-7 px-3 text-xs hover:bg-accent/50 transition-all duration-200"
        >
          {note.isPublic ? "Private" : "Public"}
        </Button>
      </div>
    </div>
  </div>
))

NoteProperties.displayName = "NoteProperties"

// Note tags component
const NoteTags = memo(({ note }: { note: TNote }) => {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  const {
    data: noteTags = [],
    isLoading: isLoadingTags
  } = useNoteTags(note.id)

  const createTagMutation = useCreateTag()
  const addTagToNoteMutation = useAddTagToNote()
  const removeTagFromNoteMutation = useRemoveTagFromNote()

  const handleAddTag = async () => {
    if (!newTagName.trim()) return

    try {
      // Create tag first
      const newTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: getRandomTagColor()
      })

      // Add tag to note
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

  return (
    <div className="p-5 border-b border-border/30">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground/80 flex items-center gap-2.5 uppercase tracking-wide">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/40 border border-border/30">
          <Tag className="h-3 w-3 text-muted-foreground/70" />
        </div>
        Tags
      </h3>
      <div className="space-y-3">
        {/* Existing tags */}
        <div className="flex flex-wrap gap-2">
          {isLoadingTags ? (
            <div className="text-xs text-muted-foreground/60">Loading tags...</div>
          ) : noteTags.length > 0 ? (
            noteTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs group relative pr-7 hover:scale-105 transition-all duration-200 border"
                style={{
                  backgroundColor: tag.color,
                  color: getContrastColor(tag.color),
                  borderColor: tag.color
                }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="absolute right-1 top-0.5 bottom-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 rounded-sm px-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))
          ) : (
            <div className="text-xs text-muted-foreground/60 p-3 rounded-lg bg-muted/20 border border-border/20 text-center w-full">
              No tags yet
            </div>
          )}
        </div>

        {/* Add tag input or button */}
        {isAddingTag ? (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag()
                } else if (e.key === 'Escape') {
                  setIsAddingTag(false)
                  setNewTagName("")
                }
              }}
              className="h-8 text-xs bg-muted/20 border-border/40"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
              className="h-8 px-3 text-xs"
            >
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTag(true)}
            className="w-full h-8 text-xs hover:bg-accent/40 border-border/40 border-dashed transition-all duration-200"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Add tag
          </Button>
        )}
      </div>
    </div>
  )
})

NoteTags.displayName = "NoteTags"

// Note actions component
const NoteActions = memo(({ note }: { note: TNote }) => {
  const handleExport = async (format: 'markdown' | 'html') => {
    try {
      await exportNote(note, format)
    } catch (error) {
      console.error('Failed to export note:', error)
    }
  }

  const handleShare = async () => {
    try {
      await shareNote(note)
    } catch (error) {
      console.error('Failed to share note:', error)
    }
  }

  const handlePrint = async () => {
    try {
      await printNote(note)
    } catch (error) {
      console.error('Failed to print note:', error)
    }
  }

  const handleViewHistory = async () => {
    try {
      await getNoteHistory(note.id)
    } catch (error) {
      console.error('Failed to get note history:', error)
    }
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground/80 uppercase tracking-wide">
        Actions
      </h3>
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-3 text-sm hover:bg-accent/40 transition-all duration-200 rounded-lg"
          onClick={() => handleExport('markdown')}
        >
          <Download className="h-4 w-4 mr-3" />
          Export as Markdown
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-3 text-sm hover:bg-accent/40 transition-all duration-200 rounded-lg"
          onClick={() => handleExport('html')}
        >
          <Download className="h-4 w-4 mr-3" />
          Export as HTML
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-3 text-sm hover:bg-accent/40 transition-all duration-200 rounded-lg"
          onClick={handleShare}
        >
          <Share className="h-4 w-4 mr-3" />
          Copy to clipboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-3 text-sm hover:bg-accent/40 transition-all duration-200 rounded-lg"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4 mr-3" />
          Print note
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-3 text-sm hover:bg-accent/40 transition-all duration-200 rounded-lg"
          onClick={handleViewHistory}
        >
          <History className="h-4 w-4 mr-3" />
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
    <aside className={cn("w-72 border-l border-border/30 bg-card/50 backdrop-blur-sm flex flex-col h-full flex-shrink-0", className)}>
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-background/90">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/90">Note Information</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            title="Close metadata panel"
            className="h-8 w-8 p-0 hover:bg-accent/40 transition-all duration-200 border border-transparent hover:border-border/30"
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
