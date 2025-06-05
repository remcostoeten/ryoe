"use client"

import { useState, useEffect, useRef } from "react"
import { useDatabaseHealth } from "@/modules/database-actions/hooks/use-database-health"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Database,
  GitBranch,
  Clock,
  Zap,
  X,
  Table,
  GitCommitIcon,
  User,
  Calendar,
  Search,
  ChevronRight,
  ChevronDown,
  GitMerge,
  GitPullRequest,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { appConfig } from "@/app/config"
import { fetchLatestCommitInfo, getLastCommitDate } from "@/core/git/git-info"
import { fetchGitTree, calculateTreePositions, getBranchTypeInfo, type GitCommit } from "@/lib/calculate-tree-positions"
import { executeQuery } from "@/api/db"

type TProps = {
  className?: string
  interval?: number
}

type DatabaseTable = {
  name: string
  rowCount: number
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    primaryKey: boolean
  }>
}

const statusConfig = {
  checking: {
    variant: "secondary" as const,
    label: "Checking",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    dotColor: "bg-gray-500",
    pulseClass: "animate-pulse",
  },
  healthy: {
    variant: "success" as const,
    label: "Connected",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    dotColor: "bg-emerald-500",
    pulseClass: "animate-pulse",
  },
  error: {
    variant: "destructive" as const,
    label: "Connection Failed",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    dotColor: "bg-rose-500",
    pulseClass: "animate-bounce",
  },
  disconnected: {
    variant: "warning" as const,
    label: "Not Available",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    dotColor: "bg-amber-500",
    pulseClass: "animate-pulse",
  },
} as const

export function EnhancedDatabaseWidget({ className, interval = 30000 }: TProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [commitInfo, setCommitInfo] = useState({
    commitHash: "loading...",
    commitDate: "loading...",
    commitMessage: "loading...",
    author: "loading...",
    branch: "loading...",
  })
  const [gitHistory, setGitHistory] = useState<GitCommit[]>([])
  const [treePositions, setTreePositions] = useState<ReturnType<typeof calculateTreePositions> | null>(null)
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([])
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingCommit, setIsLoadingCommit] = useState(true)
  const [isLoadingGit, setIsLoadingGit] = useState(true)
  const [isLoadingTables, setIsLoadingTables] = useState(true)
  const widgetRef = useRef<HTMLDivElement>(null)
  const gitCanvasRef = useRef<HTMLCanvasElement>(null)
  const { health, isLoading, refresh } = useDatabaseHealth({ interval })

  const config = statusConfig[health.status]

  // Handle ESC key and outside clicks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Fetch commit info and git history
  useEffect(() => {
    const getCommitInfo = async () => {
      try {
        const info = await fetchLatestCommitInfo()
        setCommitInfo({
          commitHash: info.commitHash.substring(0, 7),
          commitDate: new Date(info.commitDate).toLocaleString(),
          commitMessage: info.commitMessage.split("\n")[0],
          author: info.author || "Unknown",
          branch: info.branch || "main",
        })
      } catch (error) {
        console.error("Failed to fetch commit info:", error)
        setCommitInfo({
          commitHash: getCommitInfo(),
          commitDate: getLastCommitDate(),
          commitMessage: "Failed to fetch commit info",
          author: "Unknown",
          branch: "unknown",
        })
      } finally {
        setIsLoadingCommit(false)
      }
    }

    const getGitHistory = async () => {
      try {
        const history = await fetchGitTree(appConfig.repository, "master", 15)
        setGitHistory(history)

        // Calculate positions for visualization
        const positions = calculateTreePositions(history)
        setTreePositions(positions)
      } catch (error) {
        console.error("Failed to fetch git history:", error)
      } finally {
        setIsLoadingGit(false)
      }
    }

    getCommitInfo()
    if (isOpen) {
      getGitHistory()
    }
  }, [isOpen])

  // Draw git tree visualization
  useEffect(() => {
    if (!gitCanvasRef.current || !treePositions || gitHistory.length === 0) return

    const canvas = gitCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = 480
    const height = Math.max(gitHistory.length * 60, 300)
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw connections between commits
    ctx.lineWidth = 2

    gitHistory.forEach((commit, index) => {
      const pos = treePositions.positions[commit.sha]
      if (!pos) return

      // Draw connections to parents
      commit.parents.forEach((parentSha) => {
        const parentPos = treePositions.positions[parentSha]
        if (!parentPos) return

        // Set line color based on branch
        ctx.strokeStyle = commit.branchColor

        // Start path
        ctx.beginPath()
        ctx.moveTo(pos.x + 20, pos.y + 20) // Center of current commit

        // If it's a merge, draw a curved line
        if (commit.parents.length > 1 && parentSha !== commit.parents[0]) {
          // Bezier curve for merge connections
          const controlY = (pos.y + parentPos.y) / 2
          ctx.bezierCurveTo(pos.x + 20, controlY, parentPos.x + 20, controlY, parentPos.x + 20, parentPos.y + 20)
        } else {
          // Straight line for direct parent
          ctx.lineTo(parentPos.x + 20, parentPos.y + 20)
        }

        ctx.stroke()
      })
    })

    // Draw commit nodes
    gitHistory.forEach((commit, index) => {
      const pos = treePositions.positions[commit.sha]
      if (!pos) return

      // Draw commit circle
      ctx.fillStyle = commit.branchColor
      ctx.beginPath()

      // Different shapes for different branch types
      const branchInfo = getBranchTypeInfo(commit.branchType)

      if (commit.branchType === "merge") {
        // Diamond for merge commits
        ctx.fillStyle = commit.branchColor
        ctx.beginPath()
        ctx.arc(pos.x + 20, pos.y + 20, 8, 0, Math.PI * 2)
        ctx.fill()

        // Inner circle
        ctx.fillStyle = "#1a1a1a"
        ctx.beginPath()
        ctx.arc(pos.x + 20, pos.y + 20, 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (commit.branchType === "hotfix") {
        // Triangle for hotfix
        ctx.fillStyle = commit.branchColor
        ctx.beginPath()
        ctx.moveTo(pos.x + 20, pos.y + 12)
        ctx.lineTo(pos.x + 28, pos.y + 28)
        ctx.lineTo(pos.x + 12, pos.y + 28)
        ctx.closePath()
        ctx.fill()
      } else {
        // Circle for regular commits
        ctx.beginPath()
        ctx.arc(pos.x + 20, pos.y + 20, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Highlight selected commit
      if (selectedCommit?.sha === commit.sha) {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x + 20, pos.y + 20, 10, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [gitHistory, treePositions, selectedCommit])

  // Fetch database tables
  useEffect(() => {
    const fetchDatabaseTables = async () => {
      try {
        // Get table names
        const tablesResult = await executeQuery(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        )

        if (tablesResult.status === "success" && tablesResult.result) {
          const tableNames = tablesResult.result
            .split("\n")
            .slice(2) // Skip header
            .filter((line) => line.trim())
            .map((line) => line.trim())

          const tables: DatabaseTable[] = []

          for (const tableName of tableNames) {
            try {
              // Get table info
              const schemaResult = await executeQuery(`PRAGMA table_info(${tableName})`)
              const countResult = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`)

              let columns: DatabaseTable["columns"] = []
              let rowCount = 0

              if (schemaResult.status === "success" && schemaResult.result) {
                const schemaLines = schemaResult.result
                  .split("\n")
                  .slice(2)
                  .filter((line) => line.trim())
                columns = schemaLines.map((line) => {
                  const parts = line.split(" | ")
                  return {
                    name: parts[1] || "",
                    type: parts[2] || "",
                    nullable: parts[3] === "0",
                    primaryKey: parts[5] === "1",
                  }
                })
              }

              if (countResult.status === "success" && countResult.result) {
                const countLine = countResult.result.split("\n")[2]
                if (countLine) {
                  rowCount = Number.parseInt(countLine.trim()) || 0
                }
              }

              tables.push({
                name: tableName,
                rowCount,
                columns,
              })
            } catch (error) {
              console.error(`Failed to fetch info for table ${tableName}:`, error)
            }
          }

          setDatabaseTables(tables)
        }
      } catch (error) {
        console.error("Failed to fetch database tables:", error)
      } finally {
        setIsLoadingTables(false)
      }
    }

    if (isOpen) {
      fetchDatabaseTables()
    }
  }, [isOpen])

  function formatLastChecked(date: Date) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      return date.toLocaleTimeString()
    }
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const filteredCommits = gitHistory.filter(
    (commit) =>
      commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.sha.includes(searchTerm.toLowerCase()),
  )

  const filteredTables = databaseTables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div ref={widgetRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          "h-8 px-3 gap-2 transition-all duration-200 hover:scale-105",
          config.bgColor,
          config.borderColor,
          "border backdrop-blur-sm bg-[rgb(11,11,11)]/90 hover:bg-[rgb(11,11,11)]",
        )}
      >
        <div className="relative">
          <Database className="h-4 w-4 text-gray-300" />
          <span className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full", config.dotColor, config.pulseClass)} />
        </div>
        <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
      </Button>

      {/* Animated Panel */}
      <div
        className={cn(
          "absolute top-full right-0 mt-2 z-50 transition-all duration-300 ease-out origin-top-right",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none",
        )}
        style={{
          transformOrigin: "top right",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Card className="w-[480px] h-[600px] shadow-2xl border border-gray-800 backdrop-blur-sm bg-[rgb(11,11,11)]/95 text-gray-100">
          <CardHeader className="pb-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                <Database className="h-5 w-5 text-emerald-400" />
                System Monitor
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 hover:bg-gray-800 text-gray-400 hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-[calc(100%-80px)]">
            <Tabs defaultValue="status" className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border-b border-gray-800 rounded-none">
                <TabsTrigger
                  value="status"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-400"
                >
                  Status
                </TabsTrigger>
                <TabsTrigger
                  value="git"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-400"
                >
                  Git History
                </TabsTrigger>
                <TabsTrigger
                  value="database"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-400"
                >
                  Database
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="p-4 space-y-4 h-[calc(100%-48px)] overflow-auto">
                {/* Database Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={config.variant}
                      className={cn("gap-2 px-3 py-1 bg-gray-800/50 border-gray-700", config.color)}
                    >
                      <span className={cn("w-2 h-2 rounded-full", config.dotColor, config.pulseClass)} />
                      {config.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refresh}
                      disabled={isLoading}
                      className="h-7 w-7 p-0 hover:bg-gray-800 text-gray-400"
                    >
                      <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-300">Last Check</div>
                        <div className="text-gray-500 text-xs">{formatLastChecked(health.lastChecked)}</div>
                      </div>
                    </div>
                    {health.responseTime && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-300">Response</div>
                          <div className="text-gray-500 text-xs">{health.responseTime}ms</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <div className="text-sm font-medium mb-1 text-gray-300">Status Message</div>
                    <div className="text-sm text-gray-400">{health.message}</div>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                {/* Version Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-300">Version Info</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium text-gray-500">App</div>
                      <div className="font-mono text-gray-300">{appConfig.name}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">Version</div>
                      <div className="font-mono text-gray-300">{appConfig.version}</div>
                    </div>
                  </div>

                  {isLoadingCommit ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Loading commit info...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-medium text-gray-500">Commit</div>
                          <div className="font-mono text-gray-300">{commitInfo.commitHash}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-500">Date</div>
                          <div className="font-mono text-xs text-gray-300">{commitInfo.commitDate}</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-500 text-xs mb-1">Message</div>
                        <div className="text-xs bg-gray-900/50 border border-gray-800 p-2 rounded font-mono text-gray-400">
                          {commitInfo.commitMessage}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="git" className="p-4 space-y-4 h-[calc(100%-48px)]">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search commits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-gray-300 placeholder:text-gray-500"
                  />
                </div>

                <div className="flex flex-col h-[calc(100%-60px)]">
                  {/* Git tree visualization */}
                  <div className="relative h-[200px] mb-2 border border-gray-800 rounded-lg overflow-hidden">
                    {isLoadingGit ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <div className="relative h-full overflow-auto">
                        <canvas ref={gitCanvasRef} className="absolute top-0 left-0" style={{ minHeight: "100%" }} />
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-2 px-2 py-1 bg-gray-900/50 rounded-md">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#88c0d0]"></span>
                      <span className="text-xs text-gray-400">Main</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#a3be8c]"></span>
                      <span className="text-xs text-gray-400">Feature</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#d08770]"></span>
                      <span className="text-xs text-gray-400">Merge</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#bf616a]"></span>
                      <span className="text-xs text-gray-400">Hotfix</span>
                    </div>
                  </div>

                  {/* Commit list */}
                  <ScrollArea className="flex-1">
                    {isLoadingGit ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredCommits.map((commit, index) => (
                          <div
                            key={commit.sha}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                              selectedCommit?.sha === commit.sha
                                ? "bg-gray-800/80 border-gray-700"
                                : "bg-gray-900/30 border-gray-800 hover:bg-gray-800/50",
                            )}
                            onClick={() => setSelectedCommit(selectedCommit?.sha === commit.sha ? null : commit)}
                            style={{
                              borderLeftColor: commit.branchColor,
                              borderLeftWidth: "3px",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                {commit.branchType === "merge" ? (
                                  <GitMerge className="h-4 w-4" style={{ color: commit.branchColor }} />
                                ) : commit.branchType === "hotfix" ? (
                                  <GitPullRequest className="h-4 w-4" style={{ color: commit.branchColor }} />
                                ) : (
                                  <GitCommitIcon className="h-4 w-4" style={{ color: commit.branchColor }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                                    {commit.shortSha}
                                  </code>
                                  <span className="text-xs" style={{ color: commit.branchColor }}>
                                    {getBranchTypeInfo(commit.branchType).label}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-300 mb-1 line-clamp-2">{commit.message}</div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {commit.author}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(commit.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {selectedCommit?.sha === commit.sha && commit.parents.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <GitBranch className="h-3 w-3" />
                                  Parents: {commit.parents.map((p) => p.substring(0, 7)).join(", ")}
                                </div>
                                {commit.parents.length > 1 && (
                                  <div className="text-xs text-gray-500">
                                    This is a merge commit with {commit.parents.length} parents
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="database" className="p-4 space-y-4 h-[calc(100%-48px)]">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search tables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-gray-300 placeholder:text-gray-500"
                  />
                </div>

                <ScrollArea className="h-[calc(100%-60px)]">
                  {isLoadingTables ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTables.map((table) => (
                        <div key={table.name} className="border border-gray-800 rounded-lg bg-gray-900/30">
                          <div
                            className="p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
                            onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Table className="h-4 w-4 text-emerald-400" />
                                <span className="font-medium text-gray-300">{table.name}</span>
                                <Badge variant="secondary" className="bg-gray-800 text-gray-400 text-xs">
                                  {table.rowCount} rows
                                </Badge>
                              </div>
                              {expandedTable === table.name ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {expandedTable === table.name && (
                            <div className="px-3 pb-3 border-t border-gray-800">
                              <div className="space-y-2 mt-3">
                                <div className="text-xs font-medium text-gray-400 mb-2">Columns:</div>
                                {table.columns.map((column, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-300 font-mono">{column.name}</span>
                                      {column.primaryKey && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-emerald-500/30 text-emerald-400"
                                        >
                                          PK
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 font-mono">{column.type}</span>
                                      {!column.nullable && <span className="text-rose-400 text-xs">NOT NULL</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
