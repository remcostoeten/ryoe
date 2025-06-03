interface CacheEntry<T> {
    data: T
    timestamp: number
}

interface HttpClientOptions {
    baseUrl?: string
    headers?: Record<string, string>
    cacheTtl?: number
}

function createHttpClient(options: HttpClientOptions = {}) {
    const cache = new Map<string, CacheEntry<any>>()
    const { baseUrl = '', headers = {}, cacheTtl = 5 * 60 * 1000 } = options

    function isCacheValid<T>(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp < cacheTtl
    }

    async function fetchWithCache<T>(
        url: string,
        fetchOptions: RequestInit = {}
    ): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
        const cacheKey = `${fullUrl}:${JSON.stringify(fetchOptions)}`

        const cachedEntry = cache.get(cacheKey)
        if (cachedEntry && isCacheValid(cachedEntry)) {
            return cachedEntry.data
        }

        const response = await fetch(fullUrl, {
            ...fetchOptions,
            headers: {
                ...headers,
                ...fetchOptions.headers
            }
        })

        if (!response.ok) {
            throw new Error(
                `HTTP error ${response.status}: ${response.statusText}`
            )
        }

        const data = await response.json()

        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        })

        return data
    }

    function clearCache() {
        cache.clear()
    }

    return {
        get: <T>(url: string, options: RequestInit = {}) =>
            fetchWithCache<T>(url, { ...options, method: 'GET' }),
        clearCache
    }
}

export { createHttpClient }
