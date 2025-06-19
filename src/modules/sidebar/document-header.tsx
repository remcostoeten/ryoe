"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  FileText,
} from "lucide-react"
import { PortManagerTray } from "@/modules/port-manager/components/port-manager-tray"
import { cn } from '@/shared/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/components/ui/tooltip'
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"

interface DocumentHeaderProps {
  documentTitle?: string
  onNavigatePrevious?: () => void
  onNavigateNext?: () => void
  onToggleRightSidebar?: () => void
  onToggleSidebar?: () => void
  showSidebarToggle?: boolean
  isSidebarOpen?: boolean
  showRightSidebarToggle?: boolean
}

export function DocumentHeader({
  documentTitle = "Untitled Document",
  onNavigatePrevious,
  onNavigateNext,
  onToggleRightSidebar,
  onToggleSidebar,
  showSidebarToggle = true,
  isSidebarOpen = true,
  showRightSidebarToggle = false,
}: DocumentHeaderProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const togglePreviewMode = () => {
    setIsPreviewMode((prev) => !prev)
  }

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev)
    if (isSearchOpen) {
      setSearchQuery("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      toggleSearch()
    }
  }

  const handleBlur = () => {
    // Small delay to allow for potential click events before closing
    setTimeout(() => {
      if (isSearchOpen) {
        toggleSearch()
      }
    }, 150)
  }

  // Keyboard shortcuts
  useKeyboardShortcut(
    { key: "f", metaKey: true },
    () => {
      toggleSearch()
    }
  )

  useKeyboardShortcut(
    { key: "b", metaKey: true },
    () => {
      if (onToggleSidebar) {
        onToggleSidebar()
      }
    }
  )

  useKeyboardShortcut(
    { key: "b", metaKey: true, shiftKey: true },
    () => {
      if (onToggleRightSidebar) {
        onToggleRightSidebar()
      }
    }
  )

  return (
    <TooltipProvider>
      <header className="border-b border-border bg-background">
      <div className="flex h-12 items-center px-4">
        <div className="flex items-center gap-2">
          {showSidebarToggle && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggleSidebar}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Toggle sidebar"
                  >
                    <div className="transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]">
                      {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="flex items-center gap-2">
                    <span>Toggle sidebar</span>
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">⌘B</kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div className="h-5 w-px bg-border mx-1" />
            </>
          )}

          <button
            onClick={onNavigatePrevious}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Navigate previous"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={onNavigateNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Navigate next"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-base font-medium truncate px-4 max-w-md">{documentTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Port Manager Tray */}
          <PortManagerTray />

          <div className="h-5 w-px bg-border mx-1" />

          <button
            onClick={togglePreviewMode}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isPreviewMode ? "Switch to edit mode" : "Switch to preview mode"}
          >
            {isPreviewMode ? <FileText className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSearch}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex items-center gap-2">
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">⌘F</kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          {showRightSidebarToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleRightSidebar}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Toggle right sidebar"
                >
                  <PanelRight className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                  <span>Toggle right sidebar</span>
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">⌘⇧B</kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Search Panel with Animation */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isSearchOpen ? "max-h-16 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="p-2 flex items-center gap-2 bg-muted/50">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Find"
              className="w-full h-10 pl-9 pr-4 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus={isSearchOpen}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <span className="text-xs font-mono">Aa</span>
            </button>
            <button onClick={toggleSearch} className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
    </TooltipProvider>
  )
}
