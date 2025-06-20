import { useQuery, useMutation } from '@tanstack/react-query'
import { checkDatabaseHealth, executeQuery, initializeDatabase } from '@/api/db'
import type { DatabaseHealth } from '@/api/db'

// Query Keys
export const DATABASE_QUERY_KEYS = {
	HEALTH: ['database', 'health'] as const,
	QUERY_RESULT: (query: string) => ['database', 'query', query] as const,
} as const

// Query Hooks
export function useDatabaseHealth(options?: { enabled?: boolean; interval?: number }) {
	return useQuery({
		queryKey: DATABASE_QUERY_KEYS.HEALTH,
		queryFn: async () => {
			const result = await checkDatabaseHealth()
			return result
		},
		enabled: options?.enabled !== false,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: options?.interval || 30000, // 30 seconds
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

// Mutation Hooks
export function useExecuteQuery() {
	return useMutation({
		mutationFn: async (query: string) => {
			const result = await executeQuery(query)
			return result
		},
	})
}

export function useInitializeDatabase() {
	return useMutation({
		mutationFn: async () => {
			const result = await initializeDatabase()
			return result
		},
	})
}
