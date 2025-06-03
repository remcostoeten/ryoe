import { appConfig } from '@/app/config'
import { fetchLatestCommitInfo } from '@/lib/git-info'
import { useEffect, useState } from 'react'

export function Footer() {
    const [commitInfo, setCommitInfo] = useState({
        branch: 'main',
        message: 'Loading...',
        timestamp: ''
    })

    useEffect(() => {
        // Fetch latest commit info when component mounts
        const getLatestCommit = async () => {
            try {
                const info = await fetchLatestCommitInfo()
                setCommitInfo({
                    branch: 'master', // Hardcoded to master as requested
                    message: info.commitMessage.split('\n')[0], // First line only
                    timestamp: new Date(info.commitDate).toLocaleString()
                })
            } catch {
                console.warn('Failed to fetch commit info')
            }
        }

        getLatestCommit()
    }, [])

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-800/50 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-3 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-300">
                        {appConfig.name}
                    </span>
                    <span className="text-gray-600">●</span>
                    <span className="font-mono text-gray-300">
                        v{appConfig.version}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{commitInfo.branch}</span>
                    <span className="text-gray-600">●</span>
                    <span className="font-mono text-gray-400">
                        {commitInfo.message} • {commitInfo.timestamp}
                    </span>
                </div>
            </div>
        </footer>
    )
}
