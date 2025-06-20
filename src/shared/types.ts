export interface TServiceResult<T> {
    success: boolean
    data?: T
    error?: string
    code?: string
} 