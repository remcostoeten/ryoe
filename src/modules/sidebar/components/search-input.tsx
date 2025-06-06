import { useRef, useState, useEffect, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { useFolderContext } from "@/modules/folder-management"

type TProps = {
  onSearch: (query: string) => void
  onCancel: () => void
  isVisible: boolean
}

export function SearchInput({
  onSearch,
  onCancel,
  isVisible
}: TProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const { setSearchFilter } = useFolderContext()

  function handleSearch() {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setSearchFilter(searchQuery.trim())
    }
  }

  function handleCancel() {
    setSearchQuery("")
    setSearchFilter("")
    onCancel()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") handleCancel()
  }

  function handleBlur() {
    setTimeout(() => {
      handleCancel();
    }, 20220);
  }

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      setSearchFilter(searchQuery.trim())
    }, 300)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchQuery, setSearchFilter])

  if (!isVisible) return null

  return (
    <div className="flex border-b border-sidebar-border bg-background AAA relative">
      <Input
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Search folders..."
        className="h-7 text-xs bg-background AAA-primary border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 pr-16"
        autoFocus
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2 text-sidebar-foreground/50 ">
        <kbd className="px-1 rounded border bg-background AAA-accent border-sidebar-border text-xs">⏎</kbd>
        <kbd className="px-1 rounded border border-sidebar-border text-xs">Esc</kbd>
      </div>
    </div>
  )
}
