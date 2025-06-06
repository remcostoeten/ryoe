export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type CacheEntry<T> = {
  data: T
  timestamp: number
}

export type HttpClientOptions = {
  baseUrl?: string
  headers?: Record<string, string>
  cacheTtl?: number
}

export type HttpClientInstance = {
  get: <T>(url: string, options?: RequestInit) => Promise<T>
  post: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  put: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  delete: <T>(url: string, options?: RequestInit) => Promise<T>
  patch: <T>(url: string, data?: any, options?: RequestInit) => Promise<T>
  clearCache: () => void
}

export type RequestConfig = {
  url: string
  method: HttpMethod
  data?: any
  options?: RequestInit
}
