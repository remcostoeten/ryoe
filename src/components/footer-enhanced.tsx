import { useState, useEffect } from 'react'
import { appConfig } from '@/app/config'
import { isTauriEnvironment } from '@/lib/environment'
import { checkDatabaseHealth, type DatabaseHealth } from '@/api/db'

export function FooterEnhanced() {
    const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null)
    const currentYear = new Date().getFullYear()
    const environment = isTauriEnvironment() ? 'Desktop' : 'Web'

    useEffect(() => {
        // Check database health periodically (works in both environments now)
        const checkHealth = async () => {
            try {
                const health = await checkDatabaseHealth()
                setDbHealth(health)
            } catch (error) {
                console.warn('Failed to check database health:', error)
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-400'
            case 'error':
                return 'text-red-400'
            case 'disconnected':
                return 'text-yellow-400'
            default:
                return 'text-gray-400'
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'healthy':
                return '●'
            case 'error':
                return '●'
            case 'disconnected':
                return '●'
            default:
                return '○'
        }
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-[#333] bg-[#1f1f1f57] backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-400">
                {/* Left section */}
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-300">
                        {appConfig.name}
                    </span>
                    <span className="text-gray-500">●</span>
                    <span>v{appConfig.version}</span>
                    <span className="text-gray-500">●</span>
                    <span className="text-gray-500">{environment}</span>

                    {/* Database status (only in Tauri environment) */}
                    {isTauriEnvironment() && dbHealth && (
                        <>
                            <span className="text-gray-500">●</span>
                            <span
                                className={`flex items-center space-x-1 ${getStatusColor(dbHealth.status)}`}
                                title={`Database: ${dbHealth.message}`}
                            >
                                <span>{getStatusIcon(dbHealth.status)}</span>
                                <span>DB</span>
                            </span>
                        </>
                    )}
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-2">
                    <span>Built with ❤️ by</span>
                    <a
                        href={appConfig.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors duration-200 underline decoration-gray-500 hover:decoration-white"
                    >
                        {appConfig.author.name}
                    </a>
                    <span className="text-gray-500">●</span>
                    <span>Latest build</span>
                    <span className="text-gray-500">●</span>
                    <span>© {currentYear}</span>
                </div>
            </div>
        </footer>
    )
}
