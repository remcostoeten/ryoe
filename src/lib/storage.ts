import { Store } from '@tauri-apps/plugin-store'

type TStorageKey = string
type TStorageValue = string | number | boolean | object | null

type TStorageProvider = {
    get: <T extends TStorageValue>(key: TStorageKey) => Promise<T | null>
    set: <T extends TStorageValue>(key: TStorageKey, value: T) => Promise<void>
    remove: (key: TStorageKey) => Promise<void>
    clear: () => Promise<void>
}

function isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window
}

async function createTauriStoreProvider(
    storeName: string
): Promise<TStorageProvider> {
    const store = await Store.load(storeName)

    return {
        async get<T extends TStorageValue>(
            key: TStorageKey
        ): Promise<T | null> {
            try {
                return (await store.get(key)) as T
            } catch (error) {
                console.error(`Failed to get ${key} from Tauri Store:`, error)
                return null
            }
        },

        async set<T extends TStorageValue>(
            key: TStorageKey,
            value: T
        ): Promise<void> {
            try {
                await store.set(key, value)
                await store.save()
            } catch (error) {
                console.error(`Failed to set ${key} in Tauri Store:`, error)
                throw error
            }
        },

        async remove(key: TStorageKey): Promise<void> {
            try {
                await store.delete(key)
                await store.save()
            } catch (error) {
                console.error(
                    `Failed to remove ${key} from Tauri Store:`,
                    error
                )
                throw error
            }
        },

        async clear(): Promise<void> {
            try {
                await store.clear()
                await store.save()
            } catch (error) {
                console.error('Failed to clear Tauri Store:', error)
                throw error
            }
        }
    }
}

function createLocalStorageProvider(): TStorageProvider {
    return {
        async get<T extends TStorageValue>(
            key: TStorageKey
        ): Promise<T | null> {
            try {
                const value = localStorage.getItem(key)
                if (value === null) {
                    return null
                }
                return JSON.parse(value) as T
            } catch (error) {
                console.error(`Failed to get ${key} from localStorage:`, error)
                return null
            }
        },

        async set<T extends TStorageValue>(
            key: TStorageKey,
            value: T
        ): Promise<void> {
            try {
                localStorage.setItem(key, JSON.stringify(value))
            } catch (error) {
                console.error(`Failed to set ${key} in localStorage:`, error)
                throw error
            }
        },

        async remove(key: TStorageKey): Promise<void> {
            try {
                localStorage.removeItem(key)
            } catch (error) {
                console.error(
                    `Failed to remove ${key} from localStorage:`,
                    error
                )
                throw error
            }
        },

        async clear(): Promise<void> {
            try {
                localStorage.clear()
            } catch (error) {
                console.error('Failed to clear localStorage:', error)
                throw error
            }
        }
    }
}

async function createFallbackProvider(
    storeName: string
): Promise<TStorageProvider> {
    const tauriProvider = await createTauriStoreProvider(storeName)
    const localStorageProvider = createLocalStorageProvider()

    return {
        async get<T extends TStorageValue>(
            key: TStorageKey
        ): Promise<T | null> {
            try {
                return await tauriProvider.get<T>(key)
            } catch (error) {
                console.warn(
                    `Falling back to localStorage for getting ${key}:`,
                    error
                )
                return localStorageProvider.get<T>(key)
            }
        },

        async set<T extends TStorageValue>(
            key: TStorageKey,
            value: T
        ): Promise<void> {
            try {
                await tauriProvider.set<T>(key, value)
            } catch (error) {
                console.warn(
                    `Falling back to localStorage for setting ${key}:`,
                    error
                )
                await localStorageProvider.set<T>(key, value)
            }
        },

        async remove(key: TStorageKey): Promise<void> {
            try {
                await tauriProvider.remove(key)
            } catch (error) {
                console.warn(
                    `Falling back to localStorage for removing ${key}:`,
                    error
                )
                await localStorageProvider.remove(key)
            }
        },

        async clear(): Promise<void> {
            try {
                await tauriProvider.clear()
            } catch (error) {
                console.warn(
                    'Falling back to localStorage for clearing storage:',
                    error
                )
                await localStorageProvider.clear()
            }
        }
    }
}

export async function createStorageProvider(
    storeName: string = 'app-storage.dat'
): Promise<TStorageProvider> {
    if (isTauriEnvironment()) {
        return await createFallbackProvider(storeName)
    } else {
        return createLocalStorageProvider()
    }
}

// Since createStorageProvider now returns a Promise, you'll need to handle this differently
// Option 1: Export a function that creates the storage when called
export const getAppStorage = () => createStorageProvider('preferences.dat')

// Option 2: If you need a global instance, you could do this instead:
let _appStorage: TStorageProvider | null = null
export const appStorage = {
    async get<T extends TStorageValue>(key: TStorageKey): Promise<T | null> {
        if (!_appStorage) {
            _appStorage = await createStorageProvider('preferences.dat')
        }
        return _appStorage.get<T>(key)
    },
    async set<T extends TStorageValue>(
        key: TStorageKey,
        value: T
    ): Promise<void> {
        if (!_appStorage) {
            _appStorage = await createStorageProvider('preferences.dat')
        }
        return _appStorage.set<T>(key, value)
    },
    async remove(key: TStorageKey): Promise<void> {
        if (!_appStorage) {
            _appStorage = await createStorageProvider('preferences.dat')
        }
        return _appStorage.remove(key)
    },
    async clear(): Promise<void> {
        if (!_appStorage) {
            _appStorage = await createStorageProvider('preferences.dat')
        }
        return _appStorage.clear()
    }
}
