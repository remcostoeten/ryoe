/**
 * Environment detection utilities for Tauri/Web compatibility
 */

export function isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window
}

export function isWebEnvironment(): boolean {
    return !isTauriEnvironment()
}

export function getEnvironmentType(): 'tauri' | 'web' {
    return isTauriEnvironment() ? 'tauri' : 'web'
}

/**
 * Conditionally execute code based on environment
 */
export async function executeInTauri<T>(
    tauriCallback: () => Promise<T>,
    fallbackValue?: T
): Promise<T | undefined> {
    if (isTauriEnvironment()) {
        return await tauriCallback()
    }
    return fallbackValue
}

/**
 * Conditionally execute code based on environment with error handling
 */
export async function safeExecuteInTauri<T>(
    tauriCallback: () => Promise<T>,
    fallbackValue: T,
    errorMessage?: string
): Promise<T> {
    if (!isTauriEnvironment()) {
        console.warn(
            errorMessage || 'Operation not available in web environment'
        )
        return fallbackValue
    }

    try {
        return await tauriCallback()
    } catch (error) {
        console.error('Tauri operation failed:', error)
        return fallbackValue
    }
}
