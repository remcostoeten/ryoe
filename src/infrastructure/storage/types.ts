export type StorageProvider = 'tauri' | 'localStorage'

export type StorageValue = string | number | boolean | object | null

export type StorageInstance = {
  get: <T = StorageValue>(key: string) => Promise<T | null>
  set: (key: string, value: StorageValue) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

export type StorageConfig = {
  provider: StorageProvider
  prefix?: string
}
