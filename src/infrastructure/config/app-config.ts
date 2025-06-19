import { getEnvironmentInfo, getEnvironmentVariable } from './environment'
import { APP_NAME, APP_VERSION, APP_DESCRIPTION, DEFAULT_MDX_STORAGE_PATH } from './constants'

export type AppConfig = {
  app: {
    name: string
    version: string
    description: string
  }
  environment: {
    mode: string
    isDevelopment: boolean
    isProduction: boolean
    isTauri: boolean
  }
  database: {
    turso: {
      url?: string
      authToken?: string
    }
  }
  storage: {
    defaultMdxPath: string
  }
  github: {
    repository: string
    owner: string
  }
}

export function getAppConfig(): AppConfig {
  const envInfo = getEnvironmentInfo()
  
  return {
    app: {
      name: APP_NAME,
      version: APP_VERSION,
      description: APP_DESCRIPTION
    },
    environment: {
      mode: envInfo.environment,
      isDevelopment: envInfo.isDevelopment,
      isProduction: envInfo.isProduction,
      isTauri: envInfo.isTauri
    },
    database: {
      turso: {
        url: getEnvironmentVariable('VITE_TURSO_DATABASE_URL'),
        authToken: getEnvironmentVariable('VITE_TURSO_AUTH_TOKEN')
      }
    },
    storage: {
      defaultMdxPath: DEFAULT_MDX_STORAGE_PATH
    },
    github: {
      repository: getEnvironmentVariable('VITE_GITHUB_REPOSITORY') || 'ryoe',
      owner: getEnvironmentVariable('VITE_GITHUB_OWNER') || 'remcostoeten'
    }
  }
}

export function validateConfig(config: AppConfig): void {
  if (!config.app.name) {
    throw new Error('App name is required')
  }
  
  if (!config.app.version) {
    throw new Error('App version is required')
  }
  
  // Only validate Turso config if we're using it
  if (config.environment.isProduction && !config.database.turso.url) {
    console.warn('Turso database URL not configured for production')
  }
}

export function loadAppConfig(): AppConfig {
  const config = getAppConfig()
  validateConfig(config)
  return config
}
