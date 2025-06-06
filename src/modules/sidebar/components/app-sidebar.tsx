"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader
} from "@/components/ui/sidebar"
import { Archive, ChevronDown, ChevronRight, Command, FileText, Folder, Star } from "lucide-react"
import * as React from "react"
import { useLocation } from "react-router"
import { TopActionBar } from "./top-action-bar"
import { useFolderContext } from "@/modules/folder-management"

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
  const pathname = location.pathname
  const isHomePage = pathname === "/"

  const displayFolders = searchFilter ? filteredTreeData : treeData

  return (
    <Sidebar collapsible="icon" className="overflow-hidden border-r border-sidebar-border" style={{maxWidth: 'var(--sidebar-width)'}} {...props}>
      <Sidebar collapsible="none" className="!w-[48px] border-r border-sidebar-border bg-background AAA">
        <SidebarHeader className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isHomePage ? 'bg-active AAA-ac text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'}`}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
          >
            <Folder className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
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
                        className="w-full justify-between h-7 px-1 mx-0 text-sidebar-foreground hover:bg-background AAA-accent text-xs font-normal overflow-hidden"
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                          {expandedFolderIds.has(folder.id) ? (
                            <ChevronDown className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-sidebar-foreground flex-shrink-0" />
                          )}
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
