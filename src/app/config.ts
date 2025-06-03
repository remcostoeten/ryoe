// Dynamic values from build-time injection
export const APP_NAME = __APP_NAME__ || 'Notr'
export const APP_VERSION = __APP_VERSION__ || '0.01'

// Static configuration
export const APP_AUTHOR = 'Remco Stoeten'
export const APP_AUTHOR_URL = 'https://github.com/remcostoeten'
export const APP_REPOSITORY_URL = 'https://github.com/remcostoeten/notr-tauri'
export const APP_DESCRIPTION =
    'A native desktop note-taking app built with Tauri, React, and Rust'

export const appConfig = {
    name: APP_NAME,
    version: APP_VERSION,
    author: {
        name: APP_AUTHOR,
        url: APP_AUTHOR_URL
    },
    repository: APP_REPOSITORY_URL,
    description: APP_DESCRIPTION
} as const
