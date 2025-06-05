import { Store } from '@tauri-apps/plugin-store'
import type { StorageValue } from '../types'

let store: Store | null = null

function getTauriStore(): Store {
  if (!store) {
    store = new Store('app-storage.json')
  }
  return store
}

export async function getTauriValue<T = StorageValue>(key: string): Promise<T | null> {
  try {
    const store = getTauriStore()
    const value = await store.get<T>(key)
    return value ?? null
  } catch (error) {
    console.error('Failed to get value from Tauri store:', error)
    return null
  }
}

export async function setTauriValue(key: string, value: StorageValue): Promise<void> {
  try {
    const store = getTauriStore()
    await store.set(key, value)
    await store.save()
  } catch (error) {
    console.error('Failed to set value in Tauri store:', error)
    throw error
  }
}

export async function removeTauriValue(key: string): Promise<void> {
  try {
    const store = getTauriStore()
    await store.delete(key)
    await store.save()
  } catch (error) {
    console.error('Failed to remove value from Tauri store:', error)
    throw error
  }
}

export async function clearTauriStore(): Promise<void> {
  try {
    const store = getTauriStore()
    await store.clear()
    await store.save()
  } catch (error) {
    console.error('Failed to clear Tauri store:', error)
    throw error
  }
}

export async function getTauriKeys(): Promise<string[]> {
  try {
    const store = getTauriStore()
    return await store.keys()
  } catch (error) {
    console.error('Failed to get keys from Tauri store:', error)
    return []
  }
}
