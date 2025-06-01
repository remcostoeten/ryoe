import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app'
import { initTheme } from './lib/theme'

// Initialize theme when the app starts
initTheme()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
