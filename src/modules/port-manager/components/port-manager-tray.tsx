import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Network } from 'lucide-react'
import { PortManagerDropdown } from './port-manager-dropdown'
import { usePortManager } from '../hooks/use-port-manager'
import { isTauriEnvironment } from '@/shared/utils'

interface TPortManagerTrayProps {
  className?: string
}

export function PortManagerTray({ className }: TPortManagerTrayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { getDevelopmentPorts } = usePortManager({
    showOnlyDevelopmentPorts: true,
    autoRefreshInterval: 30000, // 30 seconds for tray
  })

  const developmentPorts = getDevelopmentPorts()
  const activePorts = developmentPorts.filter(p => p.state === 'LISTEN' || p.state === 'LISTENING')

  // Update system tray badge/title when ports change
  useEffect(() => {
    if (isTauriEnvironment() && typeof window !== 'undefined') {
      // Update window title to show active port count
      const originalTitle = document.title
      if (activePorts.length > 0) {
        document.title = `${originalTitle} (${activePorts.length} ports)`
      } else {
        document.title = originalTitle
      }

      return () => {
        document.title = originalTitle
      }
    }
  }, [activePorts.length])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          title={`Port Manager (${activePorts.length} active ports)`}
        >
          <Network className="h-4 w-4" />
          {activePorts.length > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {activePorts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="p-0 w-auto" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <PortManagerDropdown />
      </PopoverContent>
    </Popover>
  )
}
