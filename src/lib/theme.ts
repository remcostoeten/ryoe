import { appStorage } from './storage'

type TTheme = 'dark' | 'light'

export async function setTheme(isDark: boolean): Promise<void> {
    if (isDark) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }

    const themeValue: TTheme = isDark ? 'dark' : 'light'

    try {
        await appStorage.set('theme', themeValue)
    } catch (error) {
        console.error('Failed to save theme preference:', error)
    }
}

export async function initTheme(): Promise<void> {
    try {
        const storedTheme = await appStorage.get<TTheme>('theme')

        if (storedTheme === 'dark') {
            setTheme(true)
        } else if (storedTheme === 'light') {
            setTheme(false)
        } else {
            setTheme(true)
        }
    } catch (error) {
        console.error('Failed to read theme preference:', error)
        setTheme(true)
    }
}

export async function toggleTheme(): Promise<void> {
    const isDarkMode = document.documentElement.classList.contains('dark')
    await setTheme(!isDarkMode)
}
