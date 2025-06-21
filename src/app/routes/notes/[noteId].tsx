import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Save, MoreHorizontal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFolderPath } from '@/api/services/folders-service'
import type { TNote } from '@/types'
import { useUpdateNote } from '@/api/mutations/note-mutations'
import { NoteEditor } from '@/components/note-editor'
import { getNoteById } from '@/services/note-service'

function useNote(noteId: number) {
	const [note, setNote] = useState<TNote | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadNote() {
			try {
				setLoading(true)
				setError(null)
				const result = await getNoteById(noteId)
				if (!result.success || !result.data) {
					throw new Error(result.error || 'Failed to fetch note')
				}
				setNote(result.data)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load note')
			} finally {
				setLoading(false)
			}
		}

		loadNote()
	}, [noteId])

	return { note, loading, error, setNote }
}

export default function NotePage() {
	const { noteId } = useParams<{ noteId: string }>()
	const navigate = useNavigate()
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)

	const noteIdNumber = noteId ? parseInt(noteId, 10) : null
	const { note, loading, error, setNote } = useNote(noteIdNumber!)
	const updateNoteMutation = useUpdateNote()

	// Get folder path for breadcrumbs
	const { data: folderPath = [] } = useFolderPath(note?.folderId || 0, {
		enabled: !!note?.folderId,
	})

	const saveNote = async (updatedNote: TNote) => {
		try {
			await updateNoteMutation.mutateAsync({
				id: updatedNote.id,
				title: updatedNote.title,
				content: updatedNote.content,
			})

			setNote(updatedNote)
			setHasUnsavedChanges(false)
			setLastSaved(new Date())
		} catch (error) {
			console.error('Failed to save note:', error)
		}
	}

	const handleManualSave = () => {
		if (!note) return
		saveNote(note)
	}

	if (!noteIdNumber) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<h2 className='text-lg font-medium mb-2'>Invalid Note ID</h2>
					<Button onClick={() => navigate('/notes')} variant='outline'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Notes
					</Button>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
			</div>
		)
	}

	if (error || !note) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<h2 className='text-lg font-medium mb-2'>Note Not Found</h2>
					<p className='text-muted-foreground mb-4'>
						{error || 'The requested note could not be found.'}
					</p>
					<Button onClick={() => navigate('/notes')} variant='outline'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Notes
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='h-full flex flex-col'>
			{/* Header */}
			<div className='border-b border-border bg-background px-4 py-2'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => navigate('/notes')}
							className='text-muted-foreground hover:text-foreground'
						>
							<ArrowLeft className='w-4 h-4 mr-1' />
							Back
						</Button>
						<div className='h-4 w-px bg-border' />
						<div className='flex items-center text-sm text-muted-foreground'>
							{folderPath.length > 0 ? (
								<>
									{folderPath.map((folder, index) => (
										<span key={folder.id} className='flex items-center'>
											<span className='text-muted-foreground/70'>
												{folder.name}
											</span>
											{index < folderPath.length - 1 && (
												<ChevronRight className='w-4 h-4 mx-1 text-muted-foreground/50' />
											)}
										</span>
									))}
									<ChevronRight className='w-4 h-4 mx-1 text-muted-foreground/50' />
								</>
							) : null}
							<span className='font-medium text-foreground'>{note.title}</span>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						{lastSaved && (
							<span className='text-xs text-muted-foreground'>
								Saved {lastSaved.toLocaleTimeString()}
							</span>
						)}
						{hasUnsavedChanges && (
							<span className='text-xs text-orange-600'>Unsaved changes</span>
						)}
						<Button
							variant='ghost'
							size='sm'
							onClick={handleManualSave}
							disabled={!hasUnsavedChanges}
							className='text-muted-foreground hover:text-foreground'
						>
							<Save className='w-4 h-4 mr-1' />
							Save
						</Button>
						<Button variant='ghost' size='sm'>
							<MoreHorizontal className='w-4 h-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Note Editor */}
			<div className='flex-1'>
				{note ? (
					<NoteEditor
						key={note.id}
						note={note}
						onSave={saveNote}
					/>
				) : (
					<div className='flex items-center justify-center h-full text-muted-foreground'>
						<div className='text-center'>
							<h3 className='text-lg font-medium mb-2'>Note not found</h3>
							<p className='text-sm'>
								The note you're looking for doesn't exist or has been deleted.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
