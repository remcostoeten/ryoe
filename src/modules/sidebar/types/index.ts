import type React from "react"
import type { LucideIcon } from "lucide-react"

export type TNavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive: boolean
}

export type TSidebarData = {
  navMain: TNavItem[]
}

export type TAppSidebarProps = React.ComponentProps<typeof import("@/components/ui/sidebar").Sidebar>

export type TTopActionBarProps = {
  onCreateFolder?: () => void
  onSearch?: (query: string) => void
}
