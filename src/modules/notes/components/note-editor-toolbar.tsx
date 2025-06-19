import { Info, Settings, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoteEditorToolbarProps {
  noteId: number
  readOnly?: boolean
  onToggleMetadata: (show?: boolean) => void
}

export function NoteEditorToolbar({ noteId, readOnly = false, onToggleMetadata }: NoteEditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-gradient-to-r from-background/90 to-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground/70">
          <span className="font-medium">Note #{noteId}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!readOnly && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleMetadata()}
              title="Toggle metadata panel"
              className="hover:bg-accent/50 transition-colors group"
            >
              <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Note settings"
              className="hover:bg-accent/50 transition-colors group"
            >
              <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Preview mode"
              className="hover:bg-accent/50 transition-colors group"
            >
              <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>

            <div className="w-px h-4 bg-border/40 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              title="More options"
              className="hover:bg-accent/50 transition-colors group"
            >
              <MoreHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 