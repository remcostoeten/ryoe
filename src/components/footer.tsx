"use client"

import { appConfig } from "@/app/config"
import { fetchLatestCommitInfo } from "@/lib/git-info"
import { useEffect, useState } from "react"
import { GitBranch, GitCommit, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { GitTreeVisualization } from "./layout/footer/git-tree-visualization"

export function Footer() {
  const [commitInfo, setCommitInfo] = useState({
    branch: "loading",
    message: "Loading...",
    timestamp: "",
    hash: "",
  })

  useEffect(() => {
    const getLatestCommit = async () => {
      try {
        const info = await fetchLatestCommitInfo()
        setCommitInfo({
          branch: info.branch || "master",
          message: info.commitMessage.split("\n")[0],
          timestamp: new Date(info.commitDate).toLocaleString(),
          hash: info.commitHash.substring(0, 7),
        })
      } catch (error) {
        setCommitInfo({
          branch: "error",
          message: "Failed to load commit info",
          timestamp: new Date().toLocaleString(),
          hash: "unknown",
        })
      }
    }

    getLatestCommit()
  }, [])

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-800/50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-300">{appConfig.name}</span>
            <span className="text-gray-500">|</span>
            <span className="font-mono text-gray-400">v{appConfig.version}</span>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-gray-400">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>{commitInfo.branch}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Branch: {commitInfo.branch}</p>
              </TooltipContent>
            </Tooltip>

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex cursor-pointer items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span className="font-mono">{commitInfo.hash}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-gray-900 border border-gray-800 p-0 rounded-md shadow-xl"
                sideOffset={5}
              >
                <div className="p-2 border-b border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300">Git History</h3>
                </div>
                <GitTreeVisualization branch={commitInfo.branch} />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(commitInfo.timestamp).toLocaleTimeString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{commitInfo.timestamp}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  )
}
