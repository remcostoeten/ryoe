export type Environment = 'development' | 'production' | 'test'

export type Platform = 'tauri' | 'web'

export type EnvironmentInfo = {
  environment: Environment
  platform: Platform
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
  isTauri: boolean
  isWeb: boolean
}

export function getEnvironment(): Environment {
  if (import.meta.env.MODE === 'test') return 'test'
  if (import.meta.env.MODE === 'production') return 'production'
  return 'development'
}

export function getPlatform(): Platform {
  return typeof window !== 'undefined' && '__TAURI__' in window ? 'tauri' : 'web'
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development'
}

export function isProduction(): boolean {
  return getEnvironment() === 'production'
}

export function isTest(): boolean {
  return getEnvironment() === 'test'
}

export function isTauriEnvironment(): boolean {
  return getPlatform() === 'tauri'
}

export function isWebEnvironment(): boolean {
  return getPlatform() === 'web'
}

export function getEnvironmentInfo(): EnvironmentInfo {
  const environment = getEnvironment()
  const platform = getPlatform()
  
  return {
    environment,
    platform,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isTest: environment === 'test',
    isTauri: platform === 'tauri',
    isWeb: platform === 'web'
  }
}

export function getEnvironmentVariable(key: string): string | undefined {
  return import.meta.env[key]
}

export function requireEnvironmentVariable(key: string): string {
  const value = getEnvironmentVariable(key)
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}
