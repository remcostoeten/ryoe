/**
 * Development server utilities to handle HMR reconnection issues
 */

export function setupHMRErrorHandling() {
    if (typeof window === 'undefined') return

    // Handle HMR connection errors gracefully
    const originalConsoleError = console.error
    console.error = (...args) => {
        const message = args.join(' ')

        // Filter out common HMR reconnection messages that aren't actual errors
        if (
            message.includes('[vite] connecting...') ||
            message.includes('[vite] connected.') ||
            message.includes('WebSocket connection') ||
            message.includes('HMR') ||
            message.includes('hmr')
        ) {
            // Only show these as warnings, not errors
            console.warn('HMR:', ...args)
            return
        }

        // Show actual errors normally
        originalConsoleError(...args)
    }

    // Handle WebSocket connection errors
    const originalWebSocket = window.WebSocket
    window.WebSocket = class extends originalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
            super(url, protocols)

            this.addEventListener('error', (event) => {
                // Don't show WebSocket errors for HMR connections
                if (
                    url.toString().includes('vite') ||
                    url.toString().includes('hmr')
                ) {
                    console.warn(
                        'HMR WebSocket connection issue (this is normal during development)'
                    )
                    event.preventDefault()
                }
            })

            this.addEventListener('close', () => {
                // Don't show close messages for HMR connections
                if (
                    url.toString().includes('vite') ||
                    url.toString().includes('hmr')
                ) {
                    console.warn(
                        'HMR WebSocket closed (will attempt to reconnect)'
                    )
                }
            })
        }
    }
}

export function isDevMode(): boolean {
    return import.meta.env.DEV
}

export function showConnectionStatus() {
    if (!isDevMode()) return

    // Create a simple connection status indicator
    const statusEl = document.createElement('div')
    statusEl.id = 'hmr-status'
    statusEl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        display: none;
    `
    statusEl.textContent = 'Connecting...'
    document.body.appendChild(statusEl)

    // Show status when HMR is reconnecting
    let reconnectTimeout: NodeJS.Timeout
    const showReconnecting = () => {
        statusEl.style.display = 'block'
        statusEl.textContent = 'Reconnecting...'
        statusEl.style.background = '#f59e0b'

        clearTimeout(reconnectTimeout)
        reconnectTimeout = setTimeout(() => {
            statusEl.style.display = 'none'
        }, 3000)
    }

    const showConnected = () => {
        statusEl.style.display = 'block'
        statusEl.textContent = 'Connected'
        statusEl.style.background = '#10b981'

        clearTimeout(reconnectTimeout)
        reconnectTimeout = setTimeout(() => {
            statusEl.style.display = 'none'
        }, 1000)
    }

    // Listen for HMR events
    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeUpdate', showReconnecting)
        import.meta.hot.on('vite:afterUpdate', showConnected)
    }
}
