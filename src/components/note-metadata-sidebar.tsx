'use client'

import { memo } from 'react'
import { Calendar, Clock, User, Hash, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/shared/utils'
import type { TNote } from '@/types'

interface NoteMetadataSidebarProps {
    note: TNote
    onToggleVisibility?: (note: TNote) => void
    onClose?: () => void
    className?: string
}

export const NoteMetadataSidebar = memo(({
    note,
    onToggleVisibility,
    onClose,
    className,
}: NoteMetadataSidebarProps) => {
    return (
        <aside className={cn(
            'w-64 border-l border-border bg-background flex flex-col h-full flex-shrink-0',
            className
        )}>
            {/* Header */}
            <div className='p-4 border-b border-border'>
                <h2 className='text-sm font-medium text-foreground'>Note Details</h2>
                <p className='text-xs text-muted-foreground mt-1'>⌘⇧B to toggle</p>
            </div>

            <ScrollArea className='flex-1'>
                <div className='p-4 space-y-6'>
                    {/* Note Info */}
                    <div>
                        <h3 className='text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2'>
                            <Hash className='h-3 w-3' />
                            NOTE INFO
                        </h3>
                        <div className='space-y-2 text-sm'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Hash className='h-3 w-3' />
                                <span className='truncate'>{note.title}</span>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Clock className='h-3 w-3' />
                                <span>Last modified: {new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Calendar className='h-3 w-3' />
                                <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <User className='h-3 w-3' />
                                <span>Author: You</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <h3 className='text-sm font-medium mb-3 text-muted-foreground'>ACTIONS</h3>
                        <div className='space-y-1'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onToggleVisibility?.(note)}
                                className='w-full justify-start text-sm h-8'
                            >
                                {note.isPublic ? (
                                    <EyeOff className='h-3 w-3 mr-2' />
                                ) : (
                                    <Eye className='h-3 w-3 mr-2' />
                                )}
                                {note.isPublic ? 'Make Private' : 'Make Public'}
                            </Button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div>
                        <h3 className='text-sm font-medium mb-3 text-muted-foreground'>METADATA</h3>
                        <div className='space-y-2 text-sm text-muted-foreground'>
                            <div>ID: {note.id}</div>
                            {note.folderId && <div>Folder ID: {note.folderId}</div>}
                            <div>Position: {note.position}</div>
                            <div>Public: {note.isPublic ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    )
})

NoteMetadataSidebar.displayName = 'NoteMetadataSidebar' 