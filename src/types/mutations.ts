/**
 * Centralized mutation types
 */

export interface TMutationOptions<TData = unknown, TError = Error, TVariables = void> {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void
}

export type TMutationResult<T = unknown> = {
    success: boolean
    data?: T
    error?: Error
}

export type TMutationState = 'idle' | 'loading' | 'success' | 'error' 