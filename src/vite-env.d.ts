/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_POWERSYNC_URL: string
    readonly VITE_POWERSYNC_TOKEN: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_TURSO_DATABASE_URL: string
    readonly VITE_TURSO_AUTH_TOKEN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Global constants injected by Vite
declare const __APP_VERSION__: string
declare const __APP_NAME__: string
