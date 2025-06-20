/**
 * Database Reset Mutations - React Query mutations for database reset operations
 * Uses the enterprise architecture pattern
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetAllData, hardResetDatabase, validateReset } from '@/services'
import type { TDatabaseResetResult } from '@/services'
import type { TMutationOptions } from './types'

/**
 * Mutation for soft reset (clears data but preserves table structure)
 */
export function useResetAllData(options?: TMutationOptions<TDatabaseResetResult, void>) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			const result = await resetAllData()
			if (!result.success) {
				throw new Error(result.error || 'Failed to reset database')
			}
			return result.data!
		},
		onSuccess: data => {
			// Clear all React Query cache since we've wiped the database
			queryClient.clear()

			// Invalidate specific queries that might be cached
			queryClient.invalidateQueries()

			console.log('Database reset completed:', data)

			// Call custom success handler
			options?.onSuccess?.(data, undefined)
		},
		onError: error => {
			console.error('Failed to reset database:', error)
			options?.onError?.(error, undefined)
		},
		onSettled: (data, error) => {
			options?.onSettled?.(data, error, undefined)
		},
		// Don't retry database reset operations
		retry: false,
		// Set a longer timeout for database operations
		mutationKey: ['database', 'reset', 'soft'],
	})
}

/**
 * Mutation for hard reset (drops and recreates tables)
 */
export function useHardResetDatabase(options?: TMutationOptions<TDatabaseResetResult, void>) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			const result = await hardResetDatabase()
			if (!result.success) {
				throw new Error(result.error || 'Failed to perform hard reset')
			}
			return result.data!
		},
		onSuccess: data => {
			// Clear all React Query cache
			queryClient.clear()
			queryClient.invalidateQueries()

			console.log('Hard database reset completed:', data)

			// Call custom success handler
			options?.onSuccess?.(data, undefined)
		},
		onError: error => {
			console.error('Failed to perform hard reset:', error)
			options?.onError?.(error, undefined)
		},
		onSettled: (data, error) => {
			options?.onSettled?.(data, error, undefined)
		},
		retry: false,
		mutationKey: ['database', 'reset', 'hard'],
	})
}

/**
 * Mutation for validating reset completion
 */
export function useValidateReset(options?: TMutationOptions<boolean, void>) {
	return useMutation({
		mutationFn: async () => {
			const result = await validateReset()
			if (!result.success) {
				throw new Error(result.error || 'Failed to validate reset')
			}
			return result.data!
		},
		onSuccess: data => {
			console.log(
				'Reset validation completed:',
				data ? 'Reset successful' : 'Reset incomplete'
			)
			options?.onSuccess?.(data, undefined)
		},
		onError: error => {
			console.error('Failed to validate reset:', error)
			options?.onError?.(error, undefined)
		},
		onSettled: (data, error) => {
			options?.onSettled?.(data, error, undefined)
		},
		retry: 1, // Allow one retry for validation
		mutationKey: ['database', 'reset', 'validate'],
	})
}

/**
 * Combined mutation that performs reset and validation
 */
export function useResetAndReload(
	options?: TMutationOptions<TDatabaseResetResult, { hardReset?: boolean }>
) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: { hardReset?: boolean } = {}) => {
			// Perform the appropriate reset
			const resetResult = variables.hardReset
				? await hardResetDatabase()
				: await resetAllData()

			if (!resetResult.success) {
				throw new Error(resetResult.error || 'Failed to reset database')
			}

			// Validate the reset
			const validationResult = await validateReset()
			if (!validationResult.success || !validationResult.data) {
				console.warn('Reset validation failed, but continuing...')
			}

			return resetResult.data!
		},
		onSuccess: (data, variables) => {
			// Clear all caches
			queryClient.clear()
			queryClient.invalidateQueries()

			console.log('Database reset and validation completed:', data)

			// Reload the page to restart the app
			setTimeout(() => {
				window.location.reload()
			}, 1000) // Small delay to show success message

			options?.onSuccess?.(data, variables || {})
		},
		onError: (error, variables) => {
			console.error('Failed to reset and reload:', error)
			options?.onError?.(error, variables || {})
		},
		onSettled: (data, error, variables) => {
			options?.onSettled?.(data, error, variables || {})
		},
		retry: false,
		mutationKey: ['database', 'reset', 'reload'],
	})
}
