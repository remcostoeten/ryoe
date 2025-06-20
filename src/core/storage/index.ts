import type { StorageInstance, StorageConfig, StorageValue } from './types'
import {
	getTauriValue,
	setTauriValue,
	removeTauriValue,
	clearTauriStore,
	getTauriKeys,
} from './providers/tauri-store'
import {
	getLocalValue,
	setLocalValue,
	removeLocalValue,
	clearLocalStorage,
	getLocalKeys,
} from './providers/local-storage'

function addPrefix(key: string, prefix?: string): string {
	return prefix ? `${prefix}.${key}` : key
}

function createTauriStorage(prefix?: string): StorageInstance {
	return {
		get: async <T = StorageValue>(key: string): Promise<T | null> => {
			return getTauriValue<T>(addPrefix(key, prefix))
		},
		set: async (key: string, value: StorageValue): Promise<void> => {
			return setTauriValue(addPrefix(key, prefix), value)
		},
		remove: async (key: string): Promise<void> => {
			return removeTauriValue(addPrefix(key, prefix))
		},
		clear: async (): Promise<void> => {
			if (prefix) {
				// Clear only keys with the prefix
				const keys = await getTauriKeys()
				const prefixedKeys = keys.filter(k => k.startsWith(`${prefix}.`))
				await Promise.all(prefixedKeys.map(k => removeTauriValue(k)))
			} else {
				return clearTauriStore()
			}
		},
		keys: async (): Promise<string[]> => {
			const keys = await getTauriKeys()
			if (prefix) {
				return keys
					.filter(k => k.startsWith(`${prefix}.`))
					.map(k => k.substring(prefix.length + 1))
			}
			return keys
		},
	}
}

function createLocalStorage(prefix?: string): StorageInstance {
	return {
		get: async <T = StorageValue>(key: string): Promise<T | null> => {
			return getLocalValue<T>(addPrefix(key, prefix))
		},
		set: async (key: string, value: StorageValue): Promise<void> => {
			return setLocalValue(addPrefix(key, prefix), value)
		},
		remove: async (key: string): Promise<void> => {
			return removeLocalValue(addPrefix(key, prefix))
		},
		clear: async (): Promise<void> => {
			if (prefix) {
				// Clear only keys with the prefix
				const keys = await getLocalKeys()
				const prefixedKeys = keys.filter(k => k.startsWith(`${prefix}.`))
				await Promise.all(prefixedKeys.map(k => removeLocalValue(k)))
			} else {
				return clearLocalStorage()
			}
		},
		keys: async (): Promise<string[]> => {
			const keys = await getLocalKeys()
			if (prefix) {
				return keys
					.filter(k => k.startsWith(`${prefix}.`))
					.map(k => k.substring(prefix.length + 1))
			}
			return keys
		},
	}
}

export function createStorage(config: StorageConfig): StorageInstance {
	switch (config.provider) {
		case 'tauri':
			return createTauriStorage(config.prefix)
		case 'localStorage':
			return createLocalStorage(config.prefix)
		default:
			throw new Error(`Unsupported storage provider: ${config.provider}`)
	}
}

// Default app storage instance
export function getAppStorage(): StorageInstance {
	const isTauri = typeof window !== 'undefined' && '__TAURI__' in window
	return createStorage({
		provider: isTauri ? 'tauri' : 'localStorage',
		prefix: 'ryoe',
	})
}
