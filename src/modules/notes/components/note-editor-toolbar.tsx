import { Info, Settings, Eye, MoreHorizontal, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoteEditorToolbarProps {
  noteId: number
  readOnly?: boolean
  onToggleMetadata: (show?: boolean) => void
}

export function NoteEditorToolbar({ noteId, readOnly = false, onToggleMetadata }: NoteEditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-gradient-to-r from-background/95 via-background/98 to-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/40 border border-border/30">
            <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground/70 leading-tight">Note</span>
            <span className="font-medium text-foreground/90 text-sm leading-tight">#{noteId}</span>
          </div>
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
              className="h-8 w-8 p-0 hover:bg-accent/40 transition-all duration-200 group border border-transparent hover:border-border/30"
            >
              <Info className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/80 group-hover:scale-110 transition-all duration-200" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Note settings"
              className="h-8 w-8 p-0 hover:bg-accent/40 transition-all duration-200 group border border-transparent hover:border-border/30"
            >
              <Settings className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/80 group-hover:rotate-90 transition-all duration-300" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Preview mode"
              className="h-8 w-8 p-0 hover:bg-accent/40 transition-all duration-200 group border border-transparent hover:border-border/30"
            >
              <Eye className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/80 group-hover:scale-110 transition-all duration-200" />
            </Button>

            <div className="w-px h-5 bg-border/40 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              title="More options"
              className="h-8 w-8 p-0 hover:bg-accent/40 transition-all duration-200 group border border-transparent hover:border-border/30"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/80 group-hover:scale-110 transition-all duration-200" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 