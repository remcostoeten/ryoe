import { getAppStorage } from '../storage'
import { STORAGE_KEYS } from '../config/constants'

export type Theme = 'dark' | 'light' | 'system'

export async function setTheme(theme: Theme): Promise<void> {
  const storage = getAppStorage()
  
  // Apply theme to DOM
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyThemeToDOM(prefersDark ? 'dark' : 'light')
  } else {
    applyThemeToDOM(theme)
  }

  // Save theme preference
  try {
    await storage.set(STORAGE_KEYS.THEME, theme)
  } catch (error) {
    console.error('Failed to save theme preference:', error)
  }
}

function applyThemeToDOM(theme: 'dark' | 'light'): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export async function getStoredTheme(): Promise<Theme | null> {
  try {
    const storage = getAppStorage()
    return await storage.get<Theme>(STORAGE_KEYS.THEME)
  } catch (error) {
    console.error('Failed to read theme preference:', error)
    return null
  }
}

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export async function initTheme(): Promise<void> {
  try {
    const storedTheme = await getStoredTheme()
    
    if (storedTheme) {
      await setTheme(storedTheme)
    } else {
      // Default to system theme
      await setTheme('system')
    }
    
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', async (e) => {
        const currentStoredTheme = await getStoredTheme()
        if (currentStoredTheme === 'system') {
          applyThemeToDOM(e.matches ? 'dark' : 'light')
        }
      })
    }
  } catch (error) {
    console.error('Failed to initialize theme:', error)
    // Fallback to dark theme
    applyThemeToDOM('dark')
  }
}

export async function toggleTheme(): Promise<void> {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  await setTheme(newTheme)
}
