import { appConfig } from '@/app/config'
import { isTauriEnvironment } from '@/lib/environment'
import { getBuildInfo } from '@/lib/git-info'

export function Footer() {
    const environment = isTauriEnvironment() ? 'Desktop' : 'Web'
    const buildInfo = getBuildInfo()

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
                    <span>{buildInfo}</span>
                </div>
            </div>
        </footer>
    )
}
