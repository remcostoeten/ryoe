import { useState, useEffect, useCallback } from 'react'
import { checkDatabaseHealth, type DatabaseHealth } from '@/api/db'

interface UseDatabaseHealthOptions {
    /** Interval in milliseconds to check database health. Default: 30000 (30 seconds) */
    interval?: number
    /** Whether to start checking immediately. Default: true */
    immediate?: boolean
}

export function useDatabaseHealth(options: UseDatabaseHealthOptions = {}) {
    const { interval = 30000, immediate = true } = options

    const [health, setHealth] = useState<DatabaseHealth>({
        status: 'checking',
        message: 'Checking database connection...',
        lastChecked: new Date()
    })

    const [isLoading, setIsLoading] = useState(false)

    const checkHealth = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await checkDatabaseHealth()
            setHealth(result)
        } catch (error) {
            setHealth({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to check database health',
                lastChecked: new Date()
            })
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (immediate) {
            checkHealth()
        }

        if (interval > 0) {
            const intervalId = setInterval(checkHealth, interval)
            return () => clearInterval(intervalId)
        }
    }, [checkHealth, immediate, interval])

    return {
        health,
        isLoading,
        checkHealth,
        refresh: checkHealth
    }
}
