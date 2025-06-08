import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Activity,
  Network,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/utilities'
import { usePortManager } from '../hooks/use-port-manager'
import { getPortCategory } from '@/types/port-manager'

interface TPortManagerDropdownProps {
  className?: string
  maxHeight?: string
}

export function PortManagerDropdown({ 
  className,
  maxHeight = '400px' 
}: TPortManagerDropdownProps) {
  const {
    isScanning,
    error,
    scanPorts,
    killPort,
    getDevelopmentPorts,
  } = usePortManager({
    showOnlyDevelopmentPorts: true,
    autoRefreshInterval: 10000, // 10 seconds for dropdown
  })

  const [killingPorts, setKillingPorts] = useState<Set<number>>(new Set())

  const developmentPorts = getDevelopmentPorts()
  const activePorts = developmentPorts.filter(p => p.state === 'LISTEN' || p.state === 'LISTENING')

  const handleKillPort = async (port: number) => {
    setKillingPorts(prev => new Set(prev).add(port))
    
    try {
      await killPort(port)
    } catch (error) {
      console.error('Failed to kill port:', error)
    } finally {
      setKillingPorts(prev => {
        const newSet = new Set(prev)
        newSet.delete(port)
        return newSet
      })
    }
  }

  const openInBrowser = (port: number) => {
    window.open(`http://localhost:${port}`, '_blank')
  }

  // Auto-scan on mount
  useEffect(() => {
    scanPorts()
  }, [scanPorts])

  if (error) {
    return (
      <Card className={cn('w-80', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scanPorts}
            className="mt-2 w-full"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-80', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Network className="h-4 w-4" />
            Development Ports
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={scanPorts}
            disabled={isScanning}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={cn(
              'h-3 w-3',
              isScanning && 'animate-spin'
            )} />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activePorts.length} active
          </span>
          <span>{developmentPorts.length} total</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {developmentPorts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {isScanning ? 'Scanning ports...' : 'No development ports found'}
          </div>
        ) : (
          <div 
            className="space-y-1 max-h-80 overflow-y-auto"
            style={{ maxHeight }}
          >
            {developmentPorts.map((port) => {
              const isActive = port.state === 'LISTEN' || port.state === 'LISTENING'
              const isKilling = killingPorts.has(port.port)
              const category = getPortCategory(port.port)

              return (
                <div
                  key={port.port}
                  className={cn(
                    'flex items-center justify-between p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors',
                    !isActive && 'opacity-60'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        :{port.port}
                      </span>
                      <Badge 
                        variant={isActive ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {category !== 'Other' && (
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      )}
                    </div>
                    
                    {port.process_name && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {port.process_name}
                        {port.pid && ` (${port.pid})`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInBrowser(port.port)}
                      disabled={!isActive}
                      className="h-6 w-6 p-0"
                      title="Open in browser"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKillPort(port.port)}
                      disabled={isKilling || !isActive}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Kill process"
                    >
                      {isKilling ? (
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {developmentPorts.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Navigate to full port manager page
                window.location.href = '/port-manager'
              }}
            >
              View All Ports
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
