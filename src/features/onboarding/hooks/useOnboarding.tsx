import { useState, useEffect } from 'react'
import type { TUser } from '@/types'

interface UseCurrentUserResult {
    user: TUser | null
    isLoading: boolean
    error: string | null
}

export function useCurrentUser(): UseCurrentUserResult {
    const [user, setUser] = useState<TUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // TODO: Implement actual user fetching
        const mockUser: TUser = {
            id: 1,
            email: 'user@example.com',
            name: 'Demo User',
            preferences: {
                theme: 'dark',
                storageType: 'local',
                mdxStoragePath: undefined,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        // Simulate loading
        setTimeout(() => {
            setUser(mockUser)
            setIsLoading(false)
        }, 500)
    }, [])

    return { user, isLoading, error }
} 