/**
 * Validation utility functions
 */

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function isValidPath(path: string): boolean {
  // Basic path validation - not empty and doesn't contain invalid characters
  if (!path || path.trim().length === 0) return false
  
  // Check for invalid characters (basic check)
  const invalidChars = /[<>:"|?*]/
  return !invalidChars.test(path)
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

export function hasMinLength(str: string, minLength: number): boolean {
  return str.length >= minLength
}

export function hasMaxLength(str: string, maxLength: number): boolean {
  return str.length <= maxLength
}

export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}

export function isPositiveNumber(num: number): boolean {
  return typeof num === 'number' && num > 0
}

export function isNonNegativeNumber(num: number): boolean {
  return typeof num === 'number' && num >= 0
}
