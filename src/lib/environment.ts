export function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false
  return "__TAURI__" in window || "__TAURI_INVOKE__" in window
}

export function getEnvironmentType(): string {
  if (typeof window === "undefined") return "server"
  if (isTauriEnvironment()) return "tauri"
  return "web"
}

export async function waitForTauri(timeoutMs = 3000): Promise<boolean> {
  if (typeof window === "undefined") return false

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
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    windowKeys: typeof window !== "undefined" ? Object.keys(window).filter((key) => key.includes("TAURI")) : [],
    tauriGlobals:
      typeof window !== "undefined"
        ? {
            __TAURI__: "__TAURI__" in window,
            __TAURI_INVOKE__: "__TAURI_INVOKE__" in window,
            __TAURI_METADATA__: "__TAURI_METADATA__" in window,
            __TAURI_INTERNALS__: "__TAURI_INTERNALS__" in window,
          }
        : {},
    environmentVariables: {
      NODE_ENV: process.env.NODE_ENV,
      VITE_TURSO_DATABASE_URL: import.meta.env.VITE_TURSO_DATABASE_URL ? "[SET]" : "[NOT SET]",
      VITE_TURSO_AUTH_TOKEN: import.meta.env.VITE_TURSO_AUTH_TOKEN ? "[SET]" : "[NOT SET]",
    },
  }

  console.group("🔍 Environment Debug Information")
  console.log("Environment Type:", envInfo.envType)
  console.log("Is Tauri:", envInfo.isTauri)
  console.log("User Agent:", envInfo.userAgent)
  console.log("Tauri Globals:", envInfo.tauriGlobals)
  console.log("Tauri Window Keys:", envInfo.windowKeys)
  console.log("Environment Variables:", envInfo.environmentVariables)
  console.groupEnd()

  return envInfo
}

// Additional utility functions for environment detection
export function isDesktopEnvironment(): boolean {
  return isTauriEnvironment()
}

export function isWebEnvironment(): boolean {
  return !isTauriEnvironment() && typeof window !== "undefined"
}

export function isServerEnvironment(): boolean {
  return typeof window === "undefined"
}

export function getEnvironmentDetails() {
  return {
    type: getEnvironmentType(),
    isTauri: isTauriEnvironment(),
    isDesktop: isDesktopEnvironment(),
    isWeb: isWebEnvironment(),
    isServer: isServerEnvironment(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    windowAvailable: typeof window !== "undefined",
  }
}
