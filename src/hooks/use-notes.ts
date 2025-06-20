import { useState, useEffect } from 'react'
import type { TNote } from '@/types'

export function useNotes(folderId: number | null) {
    const [notes, setNotes] = useState<TNote[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // TODO: Implement actual note fetching
        const mockNotes: TNote[] = []

        setTimeout(() => {
            setNotes(mockNotes)
            setIsLoading(false)
        }, 500)
    }, [folderId])

    return { notes, isLoading }
} 