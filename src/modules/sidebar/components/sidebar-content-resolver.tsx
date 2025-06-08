import { useState } from "react"
import { useLocation } from "react-router"
import { DocsSidebar } from "./docs-sidebar"
import { FolderSidebar } from "./folder-sidebar"
import type { TNote } from "@/types/notes"

type TSidebarContentResolverProps = {
  searchFilter: string
}

export function SidebarContentResolver({ searchFilter }: TSidebarContentResolverProps) {
  const location = useLocation()
  const pathname = location.pathname
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)

  // Determine which sidebar content to show based on current route
  const isDocsPage = pathname.startsWith('/docs')
  const isNotesPage = pathname.startsWith('/notes')

  const handleNoteSelect = (note: TNote) => {
    setSelectedNoteId(note.id)

    // Navigate to notes page if not already there
    if (!isNotesPage) {
      // You could add navigation logic here if needed
      console.log("Selected note:", note.title)
    }
  }

  if (isDocsPage) {
    return <DocsSidebar searchFilter={searchFilter} />
  }

  // Default to folder sidebar for all other authenticated pages
  return (
    <FolderSidebar
      searchFilter={searchFilter}
      showNotes={true}
      onNoteSelect={handleNoteSelect}
      selectedNoteId={selectedNoteId}
    />
  )
}
