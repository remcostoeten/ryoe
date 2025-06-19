import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/components/ui/card'
import { Button } from '@/presentation/components/ui/components/ui/button'
import { Input } from '@/presentation/components/ui/components/ui/input'
import { Checkbox } from '@/presentation/components/ui/components/ui/checkbox'
import {
  RefreshCw,
  Search,
  Trash2,
  Square,
  Activity,
  Network,
  Zap
} from 'lucide-react'
import { cn } from '@/shared/utils'
import { usePortManager } from '../hooks/use-port-manager'
import { PortCard } from './port-card'

export function PortManager() {
  const {
    ports,
    isScanning,
    lastScanTime,
    error,
    selectedPorts,
    scanPorts,
    killPort,
    killSelectedPorts,
    togglePortSelection,
    selectAllPorts,
    clearSelection,
    getDevelopmentPorts,
    autoRefresh,
    setAutoRefresh,
  } = usePortManager()

  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyDev, setShowOnlyDev] = useState(true)
  const [sortBy, setSortBy] = useState<'port' | 'process' | 'status'>('port')

  // Filter and sort ports
  const filteredPorts = ports
    .filter(port => {
      const matchesSearch = searchTerm === '' || 
        port.port.toString().includes(searchTerm) ||
        port.process_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        port.local_address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDevFilter = !showOnlyDev || port.is_development
      
      return matchesSearch && matchesDevFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'port':
          return a.port - b.port
        case 'process':
          return (a.process_name || '').localeCompare(b.process_name || '')
        case 'status':
          return a.state.localeCompare(b.state)
        default:
          return 0
      }
    })

  const developmentPorts = getDevelopmentPorts()
  const activePorts = ports.filter(p => p.state === 'LISTEN' || p.state === 'LISTENING')

  const handleKillSelected = async () => {
    if (selectedPorts.length === 0) return
    await killSelectedPorts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Port Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage development ports on your system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh && 'bg-green-50 border-green-200')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={scanPorts}
            disabled={isScanning}
          >
            {isScanning ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Scan Ports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Ports</p>
                <p className="text-2xl font-bold">{ports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activePorts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Development</p>
                <p className="text-2xl font-bold">{developmentPorts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedPorts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ports, processes, or addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="dev-only"
                checked={showOnlyDev}
                onCheckedChange={(checked) => setShowOnlyDev(checked === true)}
              />
              <label htmlFor="dev-only" className="text-sm">
                Development only
              </label>
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="port">Sort by Port</option>
              <option value="process">Sort by Process</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
          
          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllPorts}
              disabled={filteredPorts.length === 0}
            >
              Select All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedPorts.length === 0}
            >
              Clear Selection
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleKillSelected}
              disabled={selectedPorts.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Kill Selected ({selectedPorts.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Last Scan Time */}
      {lastScanTime && (
        <p className="text-sm text-muted-foreground">
          Last scan: {lastScanTime.toLocaleTimeString()}
        </p>
      )}

      {/* Port Grid */}
      {filteredPorts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No ports found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No active ports detected'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPorts.map((port) => (
            <PortCard
              key={port.port}
              port={port}
              isSelected={selectedPorts.includes(port.port)}
              onToggleSelection={togglePortSelection}
              onKillPort={killPort}
            />
          ))}
        </div>
      )}
    </div>
  )
}
