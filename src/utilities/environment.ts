/**
 * Environment detection utilities
 * Pure functions for detecting the runtime environment
 */

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

export function isDesktopEnvironment(): boolean {
  return isTauriEnvironment()
}

export function isWebEnvironment(): boolean {
  return !isTauriEnvironment()
}

export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && process.versions?.node !== undefined
}

export function isServerSideRendering(): boolean {
  return typeof window === 'undefined'
}

export function getEnvironmentType(): 'tauri' | 'web' | 'node' | 'unknown' {
  if (isTauriEnvironment()) return 'tauri'
  if (isBrowserEnvironment()) return 'web'
  if (isNodeEnvironment()) return 'node'
  return 'unknown'
}

export function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent
  }
  return 'Unknown'
}

export function getPlatform(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.platform
  }
  return 'Unknown'
}

export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine
  }
  return true // Assume online if we can't detect
}

export async function waitForTauri(timeoutMs = 3000): Promise<boolean> {
  if (typeof window === 'undefined') return false

  return new Promise((resolve) => {
    const startTime = Date.now()

    const checkTauri = () => {
      if (isTauriEnvironment()) {
        resolve(true)
        return
      }

      if (Date.now() - startTime >= timeoutMs) {
        resolve(false)
        return
      }

      setTimeout(checkTauri, 100)
    }

    checkTauri()
  })
}

export function debugEnvironment(): void {
  const envInfo = {
    isTauri: isTauriEnvironment(),
    envType: getEnvironmentType(),
    userAgent: getUserAgent(),
    platform: getPlatform(),
    windowKeys: typeof window !== 'undefined' ? Object.keys(window).filter((key) => key.includes('TAURI')) : [],
    tauriGlobals:
      typeof window !== 'undefined'
        ? {
            __TAURI__: '__TAURI__' in window,
            __TAURI_INVOKE__: '__TAURI_INVOKE__' in window,
            __TAURI_METADATA__: '__TAURI_METADATA__' in window,
            __TAURI_INTERNALS__: '__TAURI_INTERNALS__' in window,
          }
        : {},
    environmentVariables: {
      NODE_ENV: import.meta.env.MODE,
      VITE_TURSO_DATABASE_URL: import.meta.env.VITE_TURSO_DATABASE_URL ? '[SET]' : '[NOT SET]',
      VITE_TURSO_AUTH_TOKEN: import.meta.env.VITE_TURSO_AUTH_TOKEN ? '[SET]' : '[NOT SET]',
    },
  }

  console.group('🔍 Environment Debug Information')
  console.log('Environment Type:', envInfo.envType)
  console.log('Is Tauri:', envInfo.isTauri)
  console.log('User Agent:', envInfo.userAgent)
  console.log('Platform:', envInfo.platform)
  console.log('Tauri Globals:', envInfo.tauriGlobals)
  console.log('Tauri Window Keys:', envInfo.windowKeys)
  console.log('Environment Variables:', envInfo.environmentVariables)
  console.groupEnd()

  return envInfo
}

export function getEnvironmentDetails() {
  return {
    type: getEnvironmentType(),
    isTauri: isTauriEnvironment(),
    isDesktop: isDesktopEnvironment(),
    isWeb: isWebEnvironment(),
    isServer: isServerSideRendering(),
    userAgent: getUserAgent(),
    platform: getPlatform(),
    windowAvailable: typeof window !== 'undefined',
  }
}
