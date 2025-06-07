"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import { Archive, ChevronDown, ChevronRight, Command, FileText, Folder, Star, Home, BookOpen, User, LogIn } from "lucide-react"
import * as React from "react"
import { useLocation, Link } from "react-router"
import { TopActionBar } from "./top-action-bar"
import { useFolderContext } from "@/modules/folder-management"
import { useCurrentUser } from "@/features/onboarding/hooks/useOnboarding"

// Navigation items configuration
const navigationItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/folders', icon: Folder, label: 'Folders' },
  { href: '/docs', icon: BookOpen, label: 'Docs' },
]

const authenticatedItems = [
  { href: '/profile', icon: User, label: 'Profile' }
]

const unauthenticatedItems = [
  { href: '/sign-in', icon: LogIn, label: 'Sign In' }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    treeData,
    toggleFolder,
    searchFilter,
    expandedFolderIds,
    selectedFolderId,
    selectFolder,
    filteredTreeData
  } = useFolderContext()
  const location = useLocation()
  const { user, isLoading } = useCurrentUser()
  const pathname = location.pathname

  const displayFolders = searchFilter ? filteredTreeData : treeData

  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden border-r border-sidebar-border" style={{maxWidth: 'var(--sidebar-width)'}} {...props}>
      <Sidebar collapsible="none" className="!w-[48px] border-r border-sidebar-border bg-background AAA">
        <SidebarContent className="p-2 space-y-1">
          {/* Main navigation items */}
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={`h-8 w-8 p-0 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            )
          })}

          {/* Separator */}
          <div className="h-px bg-sidebar-border my-2" />

          {/* Additional utility buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </SidebarContent>

        <SidebarFooter className="p-2 space-y-1">
          {/* Authentication-based items */}
          {!isLoading && user && authenticatedItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={`h-8 w-8 p-0 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            )
          })}

          {/* Sign in button for unauthenticated users */}
          {!isLoading && !user && unauthenticatedItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={`h-8 w-8 p-0 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            )
          })}

          {/* Settings/Command button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Command className="h-4 w-4" />
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden md:flex bg-background AAA" style={{width: 'calc(var(--sidebar-width) - 48px)', maxWidth: 'calc(var(--sidebar-width) - 48px)', minWidth: 'calc(var(--sidebar-width) - 48px)'}}>
        <TopActionBar />

        <SidebarContent className="p-2">
          <SidebarGroup className="px-0 py-0">
            <SidebarGroupContent>
              <div className="space-y-1">
                {displayFolders.map((folder) => (
                  <Collapsible
                    key={folder.id}
                    open={expandedFolderIds.has(folder.id)}
                    onOpenChange={() => toggleFolder(folder.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          // Handle folder selection separately from toggle
                          e.preventDefault()
                          selectFolder(folder.id)
                        }}
                        className={`w-full justify-between h-7 px-1 mx-0 text-xs font-normal overflow-hidden ${
                          selectedFolderId === folder.id
                            ? "bg-background AAA-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFolder(folder.id)
                            }}
                            className="flex items-center justify-center h-3 w-3 hover:bg-sidebar-accent rounded-sm"
                          >
                            {expandedFolderIds.has(folder.id) ? (
                              <ChevronDown className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
                            )}
                          </button>
                          <Folder className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
                          <span className="truncate text-xs">{folder.name}</span>
                        </div>
                        <span className="text-sidebar-foreground/60 text-xs flex-shrink-0 ml-1 min-w-0">
                          {folder.children.length}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-4 mt-1 space-y-1">
                      {folder.children.map((childFolder) => (
                        <Button
                          key={childFolder.id}
                          variant="ghost"
                          onClick={() => selectFolder(childFolder.id)}
                          className={`w-full justify-start h-6 px-1 text-xs font-normal overflow-hidden ${
                            selectedFolderId === childFolder.id
                              ? "bg-background AAA-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                            <Folder className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate text-xs">{childFolder.name}</span>
                          </div>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
