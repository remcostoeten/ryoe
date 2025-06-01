import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app'
import { initTheme } from './lib/theme'
import { setupHMRErrorHandling, showConnectionStatus } from './lib/dev-server'

// Initialize theme when the app starts
initTheme()

// Setup development server utilities
if (import.meta.env.DEV) {
    setupHMRErrorHandling()
    showConnectionStatus()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
