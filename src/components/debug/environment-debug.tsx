import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    isTauriEnvironment,
    debugEnvironment,
    waitForTauri,
    getEnvironmentType
} from '@/lib/environment'
import { checkDatabaseHealth, createUser } from '@/api/db'

export function EnvironmentDebug() {
    const [envInfo, setEnvInfo] = useState<any>(null)
    const [dbHealth, setDbHealth] = useState<any>(null)
    const [tauriWaitResult, setTauriWaitResult] = useState<boolean | null>(null)

    useEffect(() => {
        const gatherInfo = async () => {
            // Wait for Tauri to be available
            const tauriAvailable = await waitForTauri(3000)
            setTauriWaitResult(tauriAvailable)

            // Gather environment info
            const info = {
                isTauri: isTauriEnvironment(),
                envType: getEnvironmentType(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
                windowKeys: typeof window !== 'undefined'
                    ? Object.keys(window).filter(key => key.includes('TAURI')).slice(0, 10)
                    : [],
                tauriGlobals: typeof window !== 'undefined' ? {
                    __TAURI__: '__TAURI__' in window,
                    __TAURI_INVOKE__: '__TAURI_INVOKE__' in window,
                    __TAURI_METADATA__: '__TAURI_METADATA__' in window,
                    __TAURI_INTERNALS__: '__TAURI_INTERNALS__' in window,
                } : {},
                tauriWaitResult: tauriAvailable,
                tursoConfig: {
                    databaseUrl: import.meta.env.VITE_TURSO_DATABASE_URL ? 'Set' : 'Missing',
                    authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN ? 'Set' : 'Missing',
                    databaseUrlValue: import.meta.env.VITE_TURSO_DATABASE_URL || 'Not set',
                }
            }
            setEnvInfo(info)

            // Check database health
            try {
                const health = await checkDatabaseHealth()
                setDbHealth(health)
            } catch (error) {
                setDbHealth({ error: error instanceof Error ? error.message : 'Unknown error' })
            }
        }

        gatherInfo()
    }, [])

    const handleTestUserCreation = async () => {
        try {
            const userId = await createUser('Test User', '/test/path')
            alert(`User created successfully with ID: ${userId}`)
        } catch (error) {
            alert(`User creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const handleDebugLog = () => {
        debugEnvironment()
    }

    if (!envInfo) {
        return <div>Loading debug info...</div>
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🔍 Environment Debug Information
                    <Badge variant={envInfo.isTauri ? 'success' : 'secondary'}>
                        {envInfo.envType}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">Environment Detection</h3>
                        <div className="space-y-1 text-sm">
                            <div>Is Tauri: <Badge variant={envInfo.isTauri ? 'success' : 'destructive'}>{envInfo.isTauri ? 'Yes' : 'No'}</Badge></div>
                            <div>Environment Type: <Badge>{envInfo.envType}</Badge></div>
                            <div>Tauri Wait Result: <Badge variant={tauriWaitResult ? 'success' : 'destructive'}>{tauriWaitResult ? 'Available' : 'Not Available'}</Badge></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Turso Configuration</h3>
                        <div className="space-y-1 text-sm">
                            <div>Database URL: <Badge variant={envInfo.tursoConfig.databaseUrl === 'Set' ? 'success' : 'destructive'}>{envInfo.tursoConfig.databaseUrl}</Badge></div>
                            <div>Auth Token: <Badge variant={envInfo.tursoConfig.authToken === 'Set' ? 'success' : 'destructive'}>{envInfo.tursoConfig.authToken}</Badge></div>
                            <div className="text-xs text-muted-foreground mt-1">URL: {envInfo.tursoConfig.databaseUrlValue}</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Tauri Globals</h3>
                        <div className="space-y-1 text-sm">
                            {Object.entries(envInfo.tauriGlobals).map(([key, value]) => (
                                <div key={key}>
                                    {key}: <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Present' : 'Missing'}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Window Keys (Tauri-related)</h3>
                        <div className="text-sm">
                            {envInfo.windowKeys.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {envInfo.windowKeys.map((key: string) => (
                                        <li key={key}>{key}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-muted-foreground">No Tauri-related keys found</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Database Health</h3>
                        <div className="text-sm">
                            {dbHealth ? (
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(dbHealth, null, 2)}
                                </pre>
                            ) : (
                                <span className="text-muted-foreground">Loading...</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleDebugLog} variant="outline">
                        Log Debug Info to Console
                    </Button>
                    <Button onClick={handleTestUserCreation} variant="outline">
                        Test User Creation
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                    <strong>User Agent:</strong> {envInfo.userAgent}
                </div>
            </CardContent>
        </Card>
    )
}
