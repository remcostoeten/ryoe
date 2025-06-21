import { useState } from 'react'
import { useLocation } from 'react-router'
import { DocsSidebar } from './docs-sidebar'
import { FolderSidebar } from './folder-sidebar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { TNote } from '@/types'

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
			console.log('Selected note:', note.title)
		}
	}

	if (isDocsPage) {
		return <DocsSidebar searchFilter={searchFilter} />
	}

	// Default to folder sidebar for all other authenticated pages
	return (
		<>
			{/* Notes Header Section */}
			<div className='p-4 border-b border-sidebar-border'>
				<h1 className='text-xl font-semibold text-foreground'>Notes</h1>
				<p className='text-sm text-muted-foreground mt-1'>Organize your thoughts</p>
				<Button
					className='w-full mt-4'
					onClick={() => {
						// Navigate to new note creation
						window.location.href = '/notes/new'
					}}
				>
					<Plus className='h-4 w-4 mr-2' />
					New Note
				</Button>
			</div>

			<FolderSidebar
				searchFilter={searchFilter}
				showNotes={true}
				onNoteSelect={handleNoteSelect}
				selectedNoteId={selectedNoteId}
			/>
		</>
	)
}
