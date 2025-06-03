"use client"

import { useEffect, useRef, useState } from "react"
import { type GitCommit, calculateTreePositions, fetchGitTree, getBranchTypeInfo } from "./git-tree"
import { appConfig } from "@/app/config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GitTreeVisualizationProps {
  branch: string
}

export function GitTreeVisualization({ branch }: GitTreeVisualizationProps) {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [avatarsLoaded, setAvatarsLoaded] = useState<Record<string, boolean>>({})

  // Preload avatars
  useEffect(() => {
    if (commits.length === 0) return

    const preloadAvatars = async () => {
      const loadedStatus: Record<string, boolean> = {}

      // Create promises for all avatar images
      const loadPromises = commits.map((commit) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            loadedStatus[commit.sha] = true
            resolve()
          }
          img.onerror = () => {
            loadedStatus[commit.sha] = false
            resolve()
          }
          img.src = commit.authorAvatar
        })
      })

      // Wait for all avatars to either load or fail
      await Promise.all(loadPromises)
      setAvatarsLoaded(loadedStatus)
    }

    preloadAvatars()
  }, [commits])

  useEffect(() => {
    const loadGitTree = async () => {
      try {
        setLoading(true)
        const gitCommits = await fetchGitTree(appConfig.repository, branch, 8)
        setCommits(gitCommits)
        setError(null)
      } catch (err) {
        setError("Failed to load git tree")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadGitTree()
  }, [branch])

  useEffect(() => {
    if (!canvasRef.current || commits.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate positions
    const { positions } = calculateTreePositions(commits)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    const maxX = Math.max(...Object.values(positions).map((p) => p.x)) + 100 // Extra space for avatars
    const maxY = Math.max(...Object.values(positions).map((p) => p.y)) + 80
    canvas.width = maxX
    canvas.height = maxY

    // Draw connections with bezier curves using branch colors
    commits.forEach((commit) => {
      const pos = positions[commit.sha]

      // Draw connections to parents
      commit.parents.forEach((parentSha) => {
        if (positions[parentSha]) {
          const parentPos = positions[parentSha]
          const parentCommit = commits.find((c) => c.sha === parentSha)

          ctx.beginPath()
          ctx.moveTo(pos.x + 12, pos.y + 12)

          // Bezier control points for smooth curves
          const controlPoint1X = pos.x + 12
          const controlPoint1Y = pos.y + (parentPos.y - pos.y) * 0.6
          const controlPoint2X = parentPos.x + 12
          const controlPoint2Y = parentPos.y - (parentPos.y - pos.y) * 0.4

          ctx.bezierCurveTo(
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y,
            parentPos.x + 12,
            parentPos.y + 12,
          )

          // Use gradient for merge commits
          if (commit.branchType === "merge") {
            const gradient = ctx.createLinearGradient(pos.x, pos.y, parentPos.x, parentPos.y)
            gradient.addColorStop(0, commit.branchColor)
            gradient.addColorStop(1, parentCommit?.branchColor || commit.branchColor)
            ctx.strokeStyle = gradient
          } else {
            ctx.strokeStyle = commit.branchColor + "80" // Add transparency
          }

          ctx.lineWidth = commit.branchType === "main" ? 3 : 2
          ctx.stroke()
        }
      })
    })

    // Draw commit dots with branch colors and animation
    commits.forEach((commit, index) => {
      const pos = positions[commit.sha]

      // Draw commit dot with animation
      setTimeout(() => {
        if (!ctx) return

        // Outer glow effect
        ctx.beginPath()
        ctx.arc(pos.x + 12, pos.y + 12, 10, 0, 2 * Math.PI)
        ctx.fillStyle = commit.branchColor + "20"
        ctx.fill()

        // Main commit circle
        ctx.beginPath()
        ctx.arc(pos.x + 12, pos.y + 12, 7, 0, 2 * Math.PI)
        ctx.fillStyle = commit.branchColor
        ctx.fill()

        // Inner highlight
        ctx.beginPath()
        ctx.arc(pos.x + 10, pos.y + 10, 2, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff40"
        ctx.fill()

        // Border
        ctx.beginPath()
        ctx.arc(pos.x + 12, pos.y + 12, 7, 0, 2 * Math.PI)
        ctx.strokeStyle = "#2e3440"
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Commit hash label
        ctx.font = "10px 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
        ctx.fillStyle = "#eceff4"
        ctx.fillText(commit.shortSha, pos.x + 25, pos.y + 16)
      }, index * 120) // Staggered animation
    })
  }, [commits])

  if (loading) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-gray-400"></div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-sm text-gray-400">Unable to load git history</div>
  }

  if (commits.length === 0) {
    return <div className="p-4 text-sm text-gray-400">No commit history available</div>
  }

  // Group commits by branch type for legend
  const branchTypes = [...new Set(commits.map((c) => c.branchType))]

  return (
    <div className="p-3">
      <div className="relative">
        <canvas ref={canvasRef} className="min-h-[220px] min-w-[250px]" />

        {/* Overlay avatars on top of the canvas */}
        <div className="absolute inset-0 pointer-events-none">
          {commits.map((commit, index) => {
            const { positions } = calculateTreePositions(commits)
            const pos = positions[commit.sha]

            if (!pos) return null

            return (
              <div
                key={commit.sha}
                className="absolute transition-opacity duration-300"
                style={{
                  left: `${pos.x + 60}px`,
                  top: `${pos.y - 2}px`,
                  opacity: avatarsLoaded[commit.sha] ? 1 : 0,
                  transitionDelay: `${index * 120}ms`,
                }}
              >
                <Avatar className="h-6 w-6 border border-gray-800 shadow-md">
                  <AvatarImage src={commit.authorAvatar || "/placeholder.svg"} alt={commit.author} />
                  <AvatarFallback className="text-[10px] bg-gray-800 text-gray-300">
                    {commit.author.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )
          })}
        </div>
      </div>

      {/* Branch Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {branchTypes.map((branchType) => {
          const commit = commits.find((c) => c.branchType === branchType)
          const info = getBranchTypeInfo(branchType)

          return (
            <div key={branchType} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: commit?.branchColor }} />
              <span className="text-gray-300">{info.label}</span>
            </div>
          )
        })}
      </div>

      {/* Recent Commits List with Avatars */}
      <div className="mt-3 space-y-2 text-xs">
        {commits.slice(0, 5).map((commit) => {
          const info = getBranchTypeInfo(commit.branchType)

          return (
            <div key={commit.sha} className="flex items-start gap-2">
              <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
                <AvatarImage src={commit.authorAvatar || "/placeholder.svg"} alt={commit.author} />
                <AvatarFallback className="text-[8px] bg-gray-800 text-gray-300">
                  {commit.author.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: commit.branchColor }}
              />
              <div className="font-mono text-gray-400 flex-shrink-0">{commit.shortSha}</div>
              <div className="text-gray-300 truncate max-w-[150px]">{commit.message}</div>
              <div className="text-gray-500 text-xs flex-shrink-0">{info.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
