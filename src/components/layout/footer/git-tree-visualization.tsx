"use client"

import { useEffect, useRef, useState } from "react"
import { appConfig } from "@/app/config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type GitCommitInfo } from "@/core/git/git-info"
import { calculateTreePositions, getBranchTypeInfo, fetchGitTree } from "./git-tree"

// Enhanced GitCommit type that includes visualization data
interface GitCommit extends GitCommitInfo {
  shortSha: string
  parents: string[]
  branchType: "master" | "feature" | "merge" | "hotfix"
  branchColor: string
}

// Branch color palette - aesthetically pleasing colors for dark theme
const BRANCH_COLORS = {
  master: "#88c0d0", // Nord frost blue
  feature: "#a3be8c", // Nord green
  merge: "#d08770", // Nord orange
  hotfix: "#bf616a", // Nord red
  secondary: "#b48ead", // Nord purple
  tertiary: "#ebcb8b", // Nord yellow
} as const

const BRANCH_COLOR_PALETTE = [
  BRANCH_COLORS.master,
  BRANCH_COLORS.feature,
  BRANCH_COLORS.secondary,
  BRANCH_COLORS.tertiary,
  BRANCH_COLORS.merge,
  BRANCH_COLORS.hotfix,
]

// Detect branch type based on commit patterns
function detectBranchType(commit: GitCommitInfo, index: number): GitCommit["branchType"] {
  const message = commit.commitMessage.toLowerCase()

  // Check for merge patterns (we don't have parent info from git-info, so use message patterns)
  if (message.includes("merge") || message.includes("pull request")) {
    return "merge"
  }

  // Check for hotfix patterns
  if (message.includes("hotfix") || message.includes("fix:") || message.includes("patch")) {
    return "hotfix"
  }

  // Check for feature patterns
  if (message.includes("feat:") || message.includes("feature") || message.includes("add:")) {
    return "feature"
  }

  // Main branch (first few commits or conventional patterns)
  if (index < 3 || message.includes("release") || message.includes("version") || message.includes("initial")) {
    return "master"
  }

  // Default to feature for other commits
  return "feature"
}

// Assign colors based on branch lanes and types
function assignBranchColor(branchType: GitCommit["branchType"], laneIndex: number): string {
  switch (branchType) {
    case "master":
      return BRANCH_COLORS.master
    case "merge":
      return BRANCH_COLORS.merge
    case "hotfix":
      return BRANCH_COLORS.hotfix
    case "feature":
      // Cycle through colors for different feature branches
      return BRANCH_COLOR_PALETTE[laneIndex % BRANCH_COLOR_PALETTE.length]
    default:
      return BRANCH_COLORS.feature
  }
}

// Convert GitCommitInfo to GitCommit with visualization data
function enhanceCommitForVisualization(commit: GitCommitInfo, index: number): GitCommit {
  const branchType = detectBranchType(commit, index)
  return {
    ...commit,
    shortSha: commit.commitHash.substring(0, 7),
    parents: [], // We don't have parent info from git-info, so empty array
    branchType,
    branchColor: assignBranchColor(branchType, index)
  }
}

// Fetch commit history using the existing fetchGitTree function
async function fetchCommitHistory(owner: string, repo: string, branch: string, maxCommits: number): Promise<GitCommitInfo[]> {
  try {
    const repoUrl = `https://github.com/${owner}/${repo}`
    const commits = await fetchGitTree(repoUrl, branch, maxCommits)

    // Convert GitCommit from git-tree to GitCommitInfo format
    return commits.map(commit => ({
      commitHash: commit.sha,
      commitMessage: commit.message,
      commitDate: commit.date,
      author: commit.author,
      authorAvatar: commit.authorAvatar,
      authorUsername: commit.authorUsername,
      branch: branch
    }))
  } catch (error) {
    console.error('Failed to fetch commit history:', error)
    throw error
  }
}

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
            loadedStatus[commit.commitHash] = true
            resolve()
          }
          img.onerror = () => {
            loadedStatus[commit.commitHash] = false
            resolve()
          }
          img.src = commit.authorAvatar || `https://github.com/${commit.authorUsername || commit.author}.png`
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
        console.log('Loading git tree from real git data...')

        // Parse repository URL to get owner and repo
        const repoMatch = appConfig.repository.match(/github\.com\/([^/]+)\/([^/]+)/)
        const owner = repoMatch?.[1] || 'remcostoeten'
        const repo = repoMatch?.[2]?.replace('.git', '') || 'ryoe'

        // Fetch real commit history from GitHub API
        const commitHistory = await fetchCommitHistory(owner, repo, branch, 8)

        // Convert to GitCommit format with visualization data
        const enhancedCommits = commitHistory.map((commit, index) =>
          enhanceCommitForVisualization(commit, index)
        )

        setCommits(enhancedCommits)
        setError(null)
        console.log('Successfully loaded real git data:', enhancedCommits)
      } catch (err) {
        setError("Failed to load git tree")
        console.error('Git tree loading error:', err)
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
      const pos = positions[commit.commitHash]

      // Draw connections to parents
      commit.parents.forEach((parentSha) => {
        if (positions[parentSha]) {
          const parentPos = positions[parentSha]
          const parentCommit = commits.find((c) => c.commitHash === parentSha)

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

          ctx.lineWidth = commit.branchType === "master" ? 3 : 2
          ctx.stroke()
        }
      })
    })

    // Draw commit dots with branch colors and animation
    commits.forEach((commit, index) => {
      const pos = positions[commit.commitHash]

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
            const pos = positions[commit.commitHash]

            if (!pos) return null

            return (
              <div
                key={commit.commitHash}
                className="absolute transition-opacity duration-300"
                style={{
                  left: `${pos.x + 60}px`,
                  top: `${pos.y - 2}px`,
                  opacity: avatarsLoaded[commit.commitHash] ? 1 : 0,
                  transitionDelay: `${index * 120}ms`,
                }}
              >
                <Avatar className="h-6 w-6 border border-gray-800 shadow-md">
                  <AvatarImage src={commit.authorAvatar || `https://github.com/${commit.authorUsername || commit.author}.png`} alt={commit.author} />
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
            <div key={commit.commitHash} className="flex items-start gap-2">
              <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
                <AvatarImage src={commit.authorAvatar || `https://github.com/${commit.authorUsername || commit.author}.png`} alt={commit.author} />
                <AvatarFallback className="text-[8px] bg-gray-800 text-gray-300">
                  {commit.author.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: commit.branchColor }}
              />
              <div className="font-mono text-gray-400 flex-shrink-0">{commit.shortSha}</div>
              <div className="text-gray-300 truncate max-w-[150px]">{commit.commitMessage}</div>
              <div className="text-gray-500 text-xs flex-shrink-0">{info.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
