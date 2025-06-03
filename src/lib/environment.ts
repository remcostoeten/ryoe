/**
 * Environment detection utilities for Tauri/Web compatibility
 */

export function isTauriEnvironment(): boolean {
    if (typeof window === 'undefined') {
        return false
    }

    // Check for multiple Tauri indicators
    const hasTauriGlobal = '__TAURI__' in window
    const hasTauriInvoke = '__TAURI_INVOKE__' in window
    const hasTauriMetadata = '__TAURI_METADATA__' in window
    const isTauriContext = (window as any).__TAURI_INTERNALS__ !== undefined

    const isTauri = hasTauriGlobal || hasTauriInvoke || hasTauriMetadata || isTauriContext

    // Debug logging for troubleshooting
    if (process.env.NODE_ENV === 'development') {
        console.debug('Environment Detection:', {
            hasTauriGlobal,
            hasTauriInvoke,
            hasTauriMetadata,
            isTauriContext,
            isTauri,
            userAgent: navigator.userAgent,
            windowKeys: Object.keys(window).filter(key => key.includes('TAURI')).slice(0, 5)
        })
    }

    return isTauri
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

/**
 * Debug function to log environment information
 */
export function debugEnvironment(): void {
    if (typeof window === 'undefined') {
        console.log('Environment: Server-side (no window object)')
        return
    }

    const tauriKeys = Object.keys(window).filter(key =>
        key.includes('TAURI') || key.includes('__TAURI')
    )

    console.group('🔍 Environment Debug Information')
    console.log('Environment Type:', getEnvironmentType())
    console.log('Is Tauri:', isTauriEnvironment())
    console.log('User Agent:', navigator.userAgent)
    console.log('Tauri-related window keys:', tauriKeys)
    console.log('Window.__TAURI__:', (window as any).__TAURI__)
    console.log('Window.__TAURI_INVOKE__:', (window as any).__TAURI_INVOKE__)
    console.log('Window.__TAURI_METADATA__:', (window as any).__TAURI_METADATA__)
    console.log('Window.__TAURI_INTERNALS__:', (window as any).__TAURI_INTERNALS__)
    console.groupEnd()
}

/**
 * Wait for Tauri to be available (useful for timing issues)
 */
export async function waitForTauri(maxWaitMs: number = 5000): Promise<boolean> {
    if (typeof window === 'undefined') {
        return false
    }

    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitMs) {
        if (isTauriEnvironment()) {
            return true
        }
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    return false
}
