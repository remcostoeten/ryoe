import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isTauriEnvironment, debugEnvironment, waitForTauri, getEnvironmentType } from "@/lib/environment"
import { checkDatabaseHealth, createUser } from "@/api/db"

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
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
        windowKeys:
          typeof window !== "undefined"
            ? Object.keys(window)
                .filter((key) => key.includes("TAURI") || key.includes("__TAURI"))
                .slice(0, 10)
            : [],
        tauriGlobals:
          typeof window !== "undefined"
            ? {
                __TAURI__: "__TAURI__" in window,
                __TAURI_INVOKE__: "__TAURI_INVOKE__" in window,
                __TAURI_METADATA__: "__TAURI_METADATA__" in window,
                __TAURI_INTERNALS__: "__TAURI_INTERNALS__" in window,
              }
            : {},
        tauriWaitResult: tauriAvailable,
        tursoConfig: {
          databaseUrl: import.meta.env.VITE_TURSO_DATABASE_URL ? "Set" : "Missing",
          authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN ? "Set" : "Missing",
          databaseUrlValue: import.meta.env.VITE_TURSO_DATABASE_URL || "Not set",
        },
      }
      setEnvInfo(info)

      // Check database health
      try {
        const health = await checkDatabaseHealth()
        setDbHealth(health)
      } catch (error) {
        setDbHealth({ error: error instanceof Error ? error.message : "Unknown error" })
      }
    }

    gatherInfo()
  }, [])

  const handleTestUserCreation = async () => {
    try {
      const userId = await createUser("Test User", "/test/path")
      alert(`User created successfully with ID: ${userId}`)
    } catch (error) {
      alert(`User creation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleDebugLog = () => {
    debugEnvironment()
  }

  if (!envInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading debug info...</div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          🔍 Environment Debug Information
          <Badge
            variant={envInfo.isTauri ? "default" : "secondary"}
            className={
              envInfo.isTauri
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
            }
          >
            {envInfo.envType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Environment Detection */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-300">Environment Detection</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Is Tauri:</span>
                <Badge
                  variant={envInfo.isTauri ? "default" : "destructive"}
                  className={
                    envInfo.isTauri
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }
                >
                  {envInfo.isTauri ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Environment Type:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{envInfo.envType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tauri Wait Result:</span>
                <Badge
                  variant={tauriWaitResult ? "default" : "destructive"}
                  className={
                    tauriWaitResult
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }
                >
                  {tauriWaitResult ? "Available" : "Not Available"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Turso Configuration */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-300">Turso Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database URL:</span>
                <Badge
                  variant={envInfo.tursoConfig.databaseUrl === "Set" ? "default" : "destructive"}
                  className={
                    envInfo.tursoConfig.databaseUrl === "Set"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }
                >
                  {envInfo.tursoConfig.databaseUrl}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Auth Token:</span>
                <Badge
                  variant={envInfo.tursoConfig.authToken === "Set" ? "default" : "destructive"}
                  className={
                    envInfo.tursoConfig.authToken === "Set"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }
                >
                  {envInfo.tursoConfig.authToken}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                <span className="font-medium">URL:</span> {envInfo.tursoConfig.databaseUrlValue}
              </div>
            </div>
          </div>

          {/* Tauri Globals */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-300">Tauri Globals</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(envInfo.tauriGlobals).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-400 font-mono text-xs">{key}:</span>
                  <Badge
                    variant={value ? "default" : "secondary"}
                    className={
                      value
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }
                  >
                    {value ? "Present" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Window Keys */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-300">Window Keys (Tauri-related)</h3>
            <div className="text-sm">
              {envInfo.windowKeys.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {envInfo.windowKeys.map((key: string) => (
                    <li key={key} className="text-gray-400 font-mono text-xs">
                      {key}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 italic">No Tauri-related keys found</span>
              )}
            </div>
          </div>

          {/* Database Health */}
          <div className="md:col-span-2 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-300">Database Health</h3>
            <div className="text-sm">
              {dbHealth ? (
                <pre className="bg-gray-900/50 border border-gray-700 p-3 rounded text-xs overflow-auto text-gray-300 font-mono">
                  {JSON.stringify(dbHealth, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-500 italic">Loading...</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button
            onClick={handleDebugLog}
            variant="outline"
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-200"
          >
            Log Debug Info to Console
          </Button>
          <Button
            onClick={handleTestUserCreation}
            variant="outline"
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-200"
          >
            Test User Creation
          </Button>
        </div>

        {/* User Agent */}
        <div className="text-xs text-gray-500 p-3 bg-gray-900/50 border border-gray-700 rounded">
          <strong className="text-gray-400">User Agent:</strong>
          <div className="mt-1 font-mono break-all">{envInfo.userAgent}</div>
        </div>
      </CardContent>
    </Card>
  )
}
