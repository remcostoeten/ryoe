import type { StorageValue } from '../types'

function serializeValue(value: StorageValue): string {
  return JSON.stringify(value)
}

function deserializeValue<T>(value: string): T {
  try {
    return JSON.parse(value)
  } catch {
    return value as T
  }
}

export async function getLocalValue<T = StorageValue>(key: string): Promise<T | null> {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return null
    return deserializeValue<T>(value)
  } catch (error) {
    console.error('Failed to get value from localStorage:', error)
    return null
  }
}

export async function setLocalValue(key: string, value: StorageValue): Promise<void> {
  try {
    const serialized = serializeValue(value)
    localStorage.setItem(key, serialized)
  } catch (error) {
    console.error('Failed to set value in localStorage:', error)
    throw error
  }
}

export async function removeLocalValue(key: string): Promise<void> {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove value from localStorage:', error)
    throw error
  }
}

export async function clearLocalStorage(): Promise<void> {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
    throw error
  }
}

export async function getLocalKeys(): Promise<string[]> {
  try {
    return Object.keys(localStorage)
  } catch (error) {
    console.error('Failed to get keys from localStorage:', error)
    return []
  }
}
