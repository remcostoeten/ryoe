import { useState } from 'react'
import type { TNote } from '@/types'

interface NoteEditorProps {
    note?: TNote | null
    onSave?: (note: TNote) => void
}

export function NoteEditor({ note, onSave }: NoteEditorProps) {
    const [title, setTitle] = useState(note?.title || '')
    const [content, setContent] = useState(note?.content || '')

    if (!note) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a note to edit
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col p-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none outline-none mb-4"
                placeholder="Note title..."
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none resize-none"
                placeholder="Start writing..."
            />
        </div>
    )
} 