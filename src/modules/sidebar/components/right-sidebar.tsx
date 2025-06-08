"use client"

import { memo } from "react"
import { useLocation } from "react-router"
import { BookOpen, FileText, Hash, Clock, User, Calendar } from "lucide-react"
import { cn } from "@/utilities"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToc } from "@/hooks/use-toc"

type TocItem = {
  id: string
  title: string
  level: number
}

// Table of Contents component for docs and markdown content
const TableOfContents = memo(({ toc }: { toc: TocItem[] }) => {
  if (toc.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No headings found in this document.
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
        <BookOpen className="h-3 w-3" />
        ON THIS PAGE
      </h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <ul className="space-y-1 pr-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md hover:bg-accent",
                  item.level === 2 && "pl-2",
                  item.level === 3 && "pl-4",
                  item.level === 4 && "pl-6",
                  item.level >= 5 && "pl-8"
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
})

TableOfContents.displayName = "TableOfContents"

// Document metadata component
const DocumentMetadata = memo(({ documentTitle }: { documentTitle: string }) => (
  <div className="p-4 border-t border-border">
    <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
      <FileText className="h-3 w-3" />
      DOCUMENT INFO
    </h3>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Hash className="h-3 w-3" />
        <span className="truncate">{documentTitle}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Last modified: Today</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-3 w-3" />
        <span>Author: You</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Created: Today</span>
      </div>
    </div>
  </div>
))

DocumentMetadata.displayName = "DocumentMetadata"

// Quick actions component
const QuickActions = memo(() => (
  <div className="p-4 border-t border-border">
    <h3 className="text-sm font-medium mb-3 text-muted-foreground">
      QUICK ACTIONS
    </h3>
    <div className="space-y-1">
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Export as PDF
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Share document
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        Print document
      </button>
      <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 rounded-md transition-colors">
        View history
      </button>
    </div>
  </div>
))

QuickActions.displayName = "QuickActions"

// Main right sidebar component
export function RightSidebar({ documentTitle = "Untitled Document" }: { documentTitle?: string }) {
  const location = useLocation()
  const { toc, isLoading } = useToc()

  const isDocsPage = location.pathname.startsWith('/docs')
  const isNotesPage = location.pathname.startsWith('/notes')

  return (
    <aside className="w-64 border-l border-border bg-background flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Right Sidebar</h2>
        <p className="text-xs text-muted-foreground mt-1">⌘⇧B to toggle</p>
      </div>

      {/* Table of Contents - show for docs and notes pages */}
      {(isDocsPage || isNotesPage) && (
        <>
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-28"></div>
                <div className="h-3 bg-muted rounded w-36"></div>
              </div>
            </div>
          ) : (
            <TableOfContents toc={toc} />
          )}
        </>
      )}
      
      {/* Document metadata */}
      <DocumentMetadata documentTitle={documentTitle} />
      
      {/* Quick actions */}
      <QuickActions />
      
      {/* Spacer to push content to top */}
      <div className="flex-1" />
    </aside>
  )
}
