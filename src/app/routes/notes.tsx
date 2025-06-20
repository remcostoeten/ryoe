import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeft, Plus, FileText } from 'lucide-react'
import { FolderSidebar } from '@/modules/sidebar/components/folder-sidebar'
import { cn } from '@/shared/utils'

export default function NotesPage() {
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	const handleNoteSelect = (note: any) => {
		setSelectedNoteId(note.id || note)
	}

	const handleCreateNote = () => {
		console.log('Creating new note...')
	}

	return (
		<div className='flex h-screen bg-gradient-to-br from-background via-background/98 to-muted/5'>
			{/* Sidebar */}
			<div
				className={cn(
					'border-r border-border/40 transition-all duration-300 backdrop-blur-sm bg-card/30',
					sidebarCollapsed ? 'w-0' : 'w-80'
				)}
			>
				<div className={cn('h-full flex flex-col', sidebarCollapsed && 'hidden')}>
					{/* Sidebar Header */}
					<div className='p-6 border-b border-border/30 bg-gradient-to-r from-card/80 via-card/90 to-background/95 backdrop-blur-sm'>
						<div className='flex items-center justify-between mb-6'>
							<div>
								<h2 className='text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
									Notes
								</h2>
								<p className='text-sm text-muted-foreground/70 mt-1'>
									Organize your thoughts
								</p>
							</div>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setSidebarCollapsed(true)}
								className='hover:bg-accent/40 transition-all duration-200 h-8 w-8 p-0 border border-transparent hover:border-border/30'
							>
								<PanelLeftClose className='w-4 h-4' />
							</Button>
						</div>

						<Button
							onClick={handleCreateNote}
							className='w-full shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg h-10'
						>
							<Plus className="w-4 h-4 mr-2" />
							New Note
						</Button>
					</div>

					{/* Folder Tree */}
					<div className='flex-1 overflow-hidden'>
						<FolderSidebar
							searchFilter=''
							enableDragDrop={true}
							showNotes={true}
							onNoteSelect={handleNoteSelect}
							selectedNoteId={selectedNoteId}
						/>
					</div>
				</div>
			</div>

			<div className='flex-1 flex flex-col bg-gradient-to-b from-background via-background/95 to-card/20'>
				{/* Collapsed Sidebar Toggle */}
				{sidebarCollapsed && (
					<div className='p-4 border-b border-border/30 bg-card/50 backdrop-blur-sm'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setSidebarCollapsed(false)}
							className='hover:bg-accent/40 transition-all duration-200 h-8 w-8 p-0 border border-transparent hover:border-border/30'
						>
							<PanelLeft className='w-4 h-4' />
						</Button>
					</div>
				)}

				{/* Main Content Area */}
				<div className='flex-1 p-6'>
					{selectedNoteId ? (
						<div className="h-full flex flex-col">
							<h1 className="text-2xl font-bold mb-4">Note Editor</h1>
							<div className="flex-1 border border-border rounded-lg p-4">
								<p className="text-muted-foreground">
									Note editor for note ID: {selectedNoteId}
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									TODO: Implement full note editor
								</p>
							</div>
						</div>
					) : (
						<div className='flex items-center justify-center h-full'>
							<div className='text-center space-y-6 max-w-md'>
								<div className='w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center backdrop-blur-sm'>
									<FileText className='w-12 h-12 text-muted-foreground/40' />
								</div>
								<div className='space-y-3'>
									<h3 className='text-xl font-semibold tracking-tight text-foreground/90'>
										Select a note to start editing
									</h3>
									<p className='text-muted-foreground/60 leading-relaxed'>
										Choose a note from the sidebar or create a new one to begin writing.
									</p>
								</div>
								<Button
									onClick={handleCreateNote}
									className='bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200'
								>
									<Plus className='w-4 h-4 mr-2' />
									Create Your First Note
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
