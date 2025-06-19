"use client";

import { Plus, Star, Search, MoreHorizontal, FolderPlus } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useFolderContext } from '@/application/features/workspace';
import { FolderCreationInput } from "./folder-creation-input";
import { SearchInput } from "./search-input"
import { useFavorites } from "@/queries/use-favorites";
import { FavoritesPanel } from "./favorites-panel";
import { useFavoritesNavigation } from "../hooks/use-favorites-navigation";
import type { TNote } from '@/domain/entities/workspace';

export function TopActionBar() {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  // const [showDebugger, setShowDebugger] = useState(false); // Temporarily disabled
  const [isSearching, setIsSearching] = useState(false);
  const [showingFavorites, setShowingFavorites] = useState(false);
  const { createFolder, setSearchFilter, selectedFolderId, folders, expandFolder } = useFolderContext();
  const { folders: favoriteFolders, notes: favoriteNotes } = useFavorites();
  const { navigateToFolder, navigateToNote } = useFavoritesNavigation();

  // Get the selected folder name for tooltip context
  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  const selectedFolderName = selectedFolder?.name

  async function handleCreateFolder(folderName: string) {
    try {
      const newFolder = await createFolder({
        name: folderName,
        parentId: selectedFolderId // Create as child of selected folder, or root if none selected
      });

      // If we created a child folder, expand the parent to show it
      if (newFolder && selectedFolderId) {
        expandFolder(selectedFolderId);
      }

      setTimeout(() => setIsCreatingFolder(false), 50);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }

  function handleSearch(searchQuery: string) {
    setSearchFilter(searchQuery);
    setIsSearching(false);
  }

  function handleCancelSearch() {
    setSearchFilter("");
    setIsSearching(false);
  }

  function handleCancelCreation() {
    setIsCreatingFolder(false);
  }

  function handleToggleFavorites() {
    setShowingFavorites(!showingFavorites);
  }

  function handleFolderSelect(folderId: number) {
    navigateToFolder(folderId);
  }

  function handleNoteSelect(note: TNote) {
    navigateToNote(note);
  }

  useKeyboardShortcut(
    { key: "/", metaKey: true },
    () => {
      setIsSearching(true);
    }
  );

  useKeyboardShortcut(
    { key: "f", metaKey: true, shiftKey: true },
    () => {
      handleToggleFavorites();
    }
  );

  // useKeyboardShortcut(
  //   { key: "d", metaKey: true },
  //   () => {
  //     setShowDebugger(!showDebugger);
  //   },
  //   { debug: false },
  // );

  // useKeyboardShortcut(
  //   { key: "Enter" },
  //   () => {
  //     // Handle enter key if needed
  //   },
  //   { debug: showDebugger, enabled: isCreatingFolder },
  // );

  useKeyboardShortcut(
    { key: "Escape" },
    () => {
      if (isCreatingFolder) {
        handleCancelCreation();
      } else if (isSearching) {
        handleCancelSearch();
      }
    },
    { enabled: isCreatingFolder || isSearching }
  );

  const bezierCurve = [0.42, 0, 0.38, 1];

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center border-b border-sidebar-border bg-background AAA  h-12 p-2 min-h-[48px] overflow-hidden max-h-[48px]">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="searchInput"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.3, ease: bezierCurve }}
                className="w-full"
              >
                <SearchInput
                  isVisible={isSearching}
                  onSearch={handleSearch}
                  onCancel={handleCancelSearch}
                  placeholder="Search folders..."
                  onQueryChange={setSearchFilter}
                />
              </motion.div>
            ) : isCreatingFolder ? (
              <motion.div
                key="folderInput"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.3, ease: bezierCurve }}
                className="w-full"
              >
                <FolderCreationInput
                  isVisible={isCreatingFolder}
                  onCreateFolder={handleCreateFolder}
                  onCancel={handleCancelCreation}
                />
              </motion.div>
            ) : (
              <motion.div
                key="actionBar"
                initial={{ y: "0%", opacity: 1 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.15, ease: bezierCurve }}
                className="flex items-center gap-2 w-full"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
                      onClick={() => setIsCreatingFolder(true)}
                    >
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background AAA-primary border-sidebar-border text-sidebar-foreground"
                  >
                    <div className="flex flex-col">
                      <p>New folder</p>
                      {selectedFolderName && (
                        <p className="text-xs opacity-70">in "{selectedFolderName}"</p>
                      )}
                      <kbd className="ml-auto text-xs opacity-70 mt-1">⌘N</kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background AAA-primary border-sidebar-border text-sidebar-foreground"
                  >
                    <p>Add item</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground ${showingFavorites ? "bg-background AAA-accent text-sidebar-accent-foreground" : ""
                        }`}
                      onClick={handleToggleFavorites}
                    >
                      <Star className={`h-4 w-4 ${showingFavorites ? "fill-current" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background AAA-primary border-sidebar-border text-sidebar-foreground"
                  >
                    <div className="flex flex-col">
                      <p>{showingFavorites ? "Hide favorites" : "Show favorites"}</p>
                      <p className="text-xs opacity-70">
                        {favoriteFolders.length} folders, {favoriteNotes.length} notes
                      </p>
                      <kbd className="ml-auto text-xs opacity-70 mt-1">⌘⇧F</kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background AAA-primary border-sidebar-border text-sidebar-foreground"
                  >
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground ml-auto"
                      onClick={() => setIsSearching(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background AAA-primary border-sidebar-border text-sidebar-foreground"
                  >
                    <p>Search</p>
                    <kbd className="ml-2 text-xs opacity-70">/</kbd>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={showingFavorites}
        onClose={() => setShowingFavorites(false)}
        onFolderSelect={handleFolderSelect}
        onNoteSelect={handleNoteSelect}
      />

      {/* <KeyboardDebugger visible={showDebugger} /> */}
    </>
  );
}