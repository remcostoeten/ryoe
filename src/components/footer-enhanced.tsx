import { useState, useEffect } from "react"
import { appConfig } from "@/app/config"
import { isTauriEnvironment } from "@/utilities"
import { checkDatabaseHealth, type DatabaseHealth } from "@/api/db"
import { fetchLatestCommitInfo } from "@/core/git/git-info"
import { GitBranch, GitCommit, Clock, Database, Monitor, Globe } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { GitTreeVisualization } from "./layout/footer/git-tree-visualization"

interface CommitInfo {
  branch: string
  message: string
  timestamp: string
  hash: string
  author: string
}

export function FooterEnhanced() {
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null)
  const [commitInfo, setCommitInfo] = useState<CommitInfo>({
    branch: "loading",
    message: "Loading...",
    timestamp: "",
    hash: "loading",
    author: "",
  })
  const [isLoadingCommit, setIsLoadingCommit] = useState(true)

  const currentYear = new Date().getFullYear()
  const environment = isTauriEnvironment() ? "Desktop" : "Web"

  // Database health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkDatabaseHealth()
        setDbHealth(health)
      } catch (error) {
        console.warn("Failed to check database health:", error)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  // Git commit info
  useEffect(() => {
    const getCommitInfo = async () => {
      try {
        setIsLoadingCommit(true)
        const info = await fetchLatestCommitInfo()
        setCommitInfo({
          branch: info.branch || "master",
          message: info.commitMessage.split("\n")[0],
          timestamp: new Date(info.commitDate).toLocaleString(),
          hash: info.commitHash.substring(0, 7),
          author: info.author || "Unknown",
        })
      } catch (error) {
        console.error("Failed to fetch commit info:", error)
        setCommitInfo({
          branch: "error",
          message: "Failed to load commit info",
          timestamp: new Date().toLocaleString(),
          hash: "unknown",
          author: "Unknown",
        })
      } finally {
        setIsLoadingCommit(false)
      }
    }

    getCommitInfo()
  }, [])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "disconnected":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "healthy":
        return "●"
      case "error":
        return "●"
      case "disconnected":
        return "●"
      default:
        return "○"
    }
  }

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-[#333] bg-[#1f1f1f57] backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-400">
          {/* Left section - App info */}
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-300">{appConfig.name}</span>
            <span className="text-gray-500">●</span>
            <span>v{appConfig.version}</span>
            <span className="text-gray-500">●</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-gray-400">
                  {environment === "Desktop" ? <Monitor className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                  <span>{environment}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1f1f1f] border-[#333]">
                <p>Running in {environment} mode</p>
              </TooltipContent>
            </Tooltip>

            {/* Database status (only in Tauri environment) */}
            {isTauriEnvironment() && dbHealth && (
              <>
                <span className="text-gray-500">●</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center space-x-1 ${getStatusColor(dbHealth.status)}`}>
                      <Database className="h-3 w-3" />
                      <span>{getStatusIcon(dbHealth.status)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#1f1f1f] border-[#333]">
                    <p>Database: {dbHealth.message}</p>
                    {dbHealth.lastChecked && (
                      <p className="text-xs text-gray-400">
                        Last checked: {new Date(dbHealth.lastChecked).toLocaleTimeString()}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-gray-400">
                  <GitBranch className="h-3 w-3" />
                  <span>{commitInfo.branch}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1f1f1f] border-[#333]">
                <p>Branch: {commitInfo.branch}</p>
              </TooltipContent>
            </Tooltip>

            <span className="text-gray-500">●</span>

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex cursor-pointer items-center space-x-1 text-gray-400 hover:text-gray-200 transition-colors">
                  <GitCommit className="h-3 w-3" />
                  <span className="font-mono">{isLoadingCommit ? "..." : commitInfo.hash}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#1f1f1f] border-[#333] p-0 rounded-md shadow-xl" sideOffset={5}>
                <div className="p-3 border-b border-[#333]">
                  <h3 className="text-sm font-medium text-gray-300">Git History</h3>
                  <div className="text-xs text-gray-400 mt-1">Latest: {commitInfo.message}</div>
                </div>
                <GitTreeVisualization branch={commitInfo.branch} />
              </PopoverContent>
            </Popover>

            <span className="text-gray-500">●</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{commitInfo.timestamp ? new Date(commitInfo.timestamp).toLocaleTimeString() : "..."}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1f1f1f] border-[#333]">
                <p>Last commit: {commitInfo.timestamp}</p>
                <p className="text-xs text-gray-400">By: {commitInfo.author}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right section - Author info */}
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
            <span>© {currentYear}</span>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  )
}