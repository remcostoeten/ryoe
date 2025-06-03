import { useState, useEffect } from 'react'
import { appConfig } from '@/app/config'
import { fetchLatestCommitInfo } from '@/lib/git-info'

export function VersionTest() {
    const [commitInfo, setCommitInfo] = useState({
        commitHash: 'loading...',
        commitDate: 'loading...',
        commitMessage: 'loading...'
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getCommitInfo = async () => {
            try {
                const info = await fetchLatestCommitInfo()
                setCommitInfo({
                    commitHash: info.commitHash.substring(0, 7),
                    commitDate: new Date(info.commitDate).toLocaleString(),
                    commitMessage: info.commitMessage.split('\n')[0] // First line only
                })
            } catch (error) {
                console.error('Failed to fetch commit info:', error)
                setCommitInfo({
                    commitHash: 'unavailable',
                    commitDate: 'unavailable',
                    commitMessage: 'unavailable'
                })
            } finally {
                setIsLoading(false)
            }
        }

        getCommitInfo()
    }, [])

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Version Test</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <strong>App Name:</strong> {appConfig.name}
                </div>
                <div>
                    <strong>App Version:</strong> {appConfig.version}
                </div>
                <div>
                    <strong>Global __APP_VERSION__:</strong>{' '}
                    {typeof __APP_VERSION__ !== 'undefined'
                        ? __APP_VERSION__
                        : 'undefined'}
                </div>
                <div>
                    <strong>Global __APP_NAME__:</strong>{' '}
                    {typeof __APP_NAME__ !== 'undefined'
                        ? __APP_NAME__
                        : 'undefined'}
                </div>

                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-1">Latest Commit Info</h4>
                    {isLoading ? (
                        <div className="text-gray-500">
                            Loading commit information...
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div>
                                <strong>Commit Hash:</strong>{' '}
                                {commitInfo.commitHash}
                            </div>
                            <div>
                                <strong>Commit Date:</strong>{' '}
                                {commitInfo.commitDate}
                            </div>
                            <div>
                                <strong>Commit Message:</strong>{' '}
                                {commitInfo.commitMessage}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
