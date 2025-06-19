"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

type TProps = {
  onCreateFolder: (folderName: string) => void
  onCancel: () => void
  isVisible: boolean
}

export function FolderCreationInput({ 
  onCreateFolder, 
  onCancel, 
  isVisible 
}: TProps) {
  const [folderName, setFolderName] = useState("")

function handleSubmit() {
  if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
    }
  }

  function handleCancel() {
  setFolderName("")
    onCancel()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (!isVisible) return null

  return (
    <div className="flex  border-b border-sidebar-border bg-background AAA" style={{alignItems: 'center'}}>
      <Input
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Folder name..."
        className="h-7 text-xs bg-background AAA-primary border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
        autoFocus
      />
    </div>
  )
}
