import type { CacheEntry, HttpClientOptions, HttpClientInstance, HttpMethod } from './types'

function isCacheValid<T>(entry: CacheEntry<T>, cacheTtl: number): boolean {
	return Date.now() - entry.timestamp < cacheTtl
}

function buildFullUrl(baseUrl: string, url: string): string {
	return url.startsWith('http') ? url : `${baseUrl}${url}`
}

function createCacheKey(url: string, options: RequestInit): string {
	return `${url}:${JSON.stringify(options)}`
}

async function executeRequest<T>(
	url: string,
	method: HttpMethod,
	data?: any,
	options: RequestInit = {},
	headers: Record<string, string> = {}
): Promise<T> {
	const requestOptions: RequestInit = {
		...options,
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
			...options.headers,
		},
	}

	if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
		requestOptions.body = JSON.stringify(data)
	}

	const response = await fetch(url, requestOptions)

	if (!response.ok) {
		throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
	}

	return response.json()
}

async function fetchWithCache<T>(
	cache: Map<string, CacheEntry<any>>,
	url: string,
	method: HttpMethod,
	data: any,
	options: RequestInit,
	headers: Record<string, string>,
	cacheTtl: number
): Promise<T> {
	const fullUrl = buildFullUrl('', url)
	const cacheKey = createCacheKey(fullUrl, { ...options, method })

	// Only use cache for GET requests
	if (method === 'GET') {
		const cachedEntry = cache.get(cacheKey)
		if (cachedEntry && isCacheValid(cachedEntry, cacheTtl)) {
			return cachedEntry.data
		}
	}

	const result = await executeRequest<T>(fullUrl, method, data, options, headers)

	// Only cache GET requests
	if (method === 'GET') {
		cache.set(cacheKey, {
			data: result,
			timestamp: Date.now(),
		})
	}

	return result
}

export function createHttpClient(options: HttpClientOptions = {}): HttpClientInstance {
	const cache = new Map<string, CacheEntry<any>>()
	const { baseUrl = '', headers = {}, cacheTtl = 5 * 60 * 1000 } = options

	function get<T>(url: string, requestOptions: RequestInit = {}): Promise<T> {
		const fullUrl = buildFullUrl(baseUrl, url)
		return fetchWithCache<T>(
			cache,
			fullUrl,
			'GET',
			undefined,
			requestOptions,
			headers,
			cacheTtl
		)
	}

	function post<T>(url: string, data?: any, requestOptions: RequestInit = {}): Promise<T> {
		const fullUrl = buildFullUrl(baseUrl, url)
		return fetchWithCache<T>(cache, fullUrl, 'POST', data, requestOptions, headers, cacheTtl)
	}

	function put<T>(url: string, data?: any, requestOptions: RequestInit = {}): Promise<T> {
		const fullUrl = buildFullUrl(baseUrl, url)
		return fetchWithCache<T>(cache, fullUrl, 'PUT', data, requestOptions, headers, cacheTtl)
	}

	function deleteRequest<T>(url: string, requestOptions: RequestInit = {}): Promise<T> {
		const fullUrl = buildFullUrl(baseUrl, url)
		return fetchWithCache<T>(
			cache,
			fullUrl,
			'DELETE',
			undefined,
			requestOptions,
			headers,
			cacheTtl
		)
	}

	function patch<T>(url: string, data?: any, requestOptions: RequestInit = {}): Promise<T> {
		const fullUrl = buildFullUrl(baseUrl, url)
		return fetchWithCache<T>(cache, fullUrl, 'PATCH', data, requestOptions, headers, cacheTtl)
	}

	function clearCache(): void {
		cache.clear()
	}

	return {
		get,
		post,
		put,
		delete: deleteRequest,
		patch,
		clearCache,
	}
}
