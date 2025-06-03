// Dynamic values from build-time injection
export const APP_NAME = __APP_NAME__ || 'ryoe'
export const APP_VERSION = '0.04'

// Static configuration
export const APP_AUTHOR = 'Remco Stoeten'
export const APP_AUTHOR_URL = 'https://github.com/remcostoeten'
export const APP_REPOSITORY_URL = 'https://github.com/remcostoeten/ryoe'
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
// test hook
