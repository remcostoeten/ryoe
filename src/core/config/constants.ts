export const APP_NAME = 'Ryoe'
export const APP_VERSION = '0.08'
export const APP_DESCRIPTION = 'A OS native desktop app built with Tauri, React/Rust'

export const DEFAULT_MDX_STORAGE_PATH = '~/.config/ryoe'

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user.preferences',
  USER_ID: 'user.id',
  USER_NAME: 'user.name',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  THEME: 'theme',
  LAST_SYNC: 'sync.lastSync'
} as const

export const DATABASE_TABLES = {
  USERS: 'users',
  SNIPPETS: 'snippets',
  FOLDERS: 'folders',
  NOTES: 'notes'
} as const

export const CACHE_TTL = {
  HTTP_DEFAULT: 5 * 60 * 1000, // 5 minutes
  GIT_INFO: 10 * 60 * 1000,    // 10 minutes
  USER_DATA: 30 * 60 * 1000,   // 30 minutes
} as const

export const API_ENDPOINTS = {
  GITHUB_API: 'https://api.github.com',
  VERCEL_API: 'https://api.vercel.com'
} as const

export const SUPPORTED_STORAGE_TYPES = ['turso', 'local'] as const

export const SUPPORTED_THEMES = ['light', 'dark', 'system'] as const
