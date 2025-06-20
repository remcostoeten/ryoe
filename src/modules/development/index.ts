// Development Module - Main exports
export * from './database'
export * from './demo-showcase'

// Module registry for easy access
export const developmentModules = {
    database: () => import('./database'),
    demoShowcase: () => import('./demo-showcase'),
} as const

export type DevelopmentModuleKey = keyof typeof developmentModules 