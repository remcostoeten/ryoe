import { appConfig } from '@/app/config'

export function MinimalFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-800/50 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-center px-6 py-3 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-300">
                        {appConfig.name}
                    </span>
                    <span className="text-gray-600">●</span>
                    <span className="font-mono text-gray-300">
                        v{appConfig.version}
                    </span>
                </div>
            </div>
        </footer>
    )
}
