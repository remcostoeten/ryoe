import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CreateNoteButtonProps {
    selectedFolderId: number | null
    onCreateNote: (data: any) => void
    className?: string
}

export function CreateNoteButton({ selectedFolderId, onCreateNote, className }: CreateNoteButtonProps) {
    const handleCreate = () => {
        onCreateNote({
            title: 'New Note',
            content: '',
            folderId: selectedFolderId,
        })
    }

    return (
        <Button onClick={handleCreate} className={className}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
        </Button>
    )
} 