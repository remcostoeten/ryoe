import { useDatabaseHealth } from '@/hooks/use-database-health'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    RefreshCw,
    Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatabaseHealthIndicatorProps {
    /** Show refresh button. Default: true */
    showRefresh?: boolean
    /** Show detailed status text. Default: true */
    showDetails?: boolean
    /** Custom className */
    className?: string
    /** Health check interval in milliseconds. Default: 30000 (30 seconds) */
    interval?: number
}

const statusConfig = {
    checking: {
        icon: Loader2,
        variant: 'secondary' as const,
        label: 'Checking',
        color: 'text-gray-500'
    },
    healthy: {
        icon: CheckCircle,
        variant: 'success' as const,
        label: 'Connected',
        color: 'text-emerald-600'
    },
    error: {
        icon: XCircle,
        variant: 'destructive' as const,
        label: 'Connection Failed',
        color: 'text-rose-600'
    },
    disconnected: {
        icon: AlertCircle,
        variant: 'warning' as const,
        label: 'Reconnecting',
        color: 'text-amber-600'
    }
} as const

export function DatabaseHealthIndicator({
    showRefresh = true,
    showDetails = true,
    className,
    interval = 30000
}: DatabaseHealthIndicatorProps) {
    const { health, isLoading, refresh } = useDatabaseHealth({ interval })

    const config = statusConfig[health.status]
    const Icon = config.icon

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

    const tooltipContent = (
        <div className="space-y-1">
            <div className="font-medium">Database Status</div>
            <div className="text-sm">{health.message}</div>
            <div className="text-xs text-muted-foreground">
                Last checked: {formatLastChecked(health.lastChecked)}
            </div>
            {health.responseTime && (
                <div className="text-xs text-muted-foreground">
                    Response time: {health.responseTime}ms
                </div>
            )}
        </div>
    )

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <Badge
                            variant={config.variant}
                            className={cn(
                                'gap-1.5 px-2 transition-colors duration-200 bg-opacity-50',
                                health.status === 'error' &&
                                    'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200',
                                health.status === 'disconnected' &&
                                    'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
                                health.status === 'healthy' &&
                                    'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-3.5 w-3.5',
                                    config.color,
                                    health.status === 'checking' &&
                                        'animate-spin',
                                    health.status === 'error' &&
                                        'text-rose-600',
                                    health.status === 'disconnected' &&
                                        'text-amber-600',
                                    health.status === 'healthy' &&
                                        'text-emerald-600'
                                )}
                            />
                            {config.label}
                        </Badge>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>

            {showDetails && (
                <span className="text-sm text-muted-foreground">
                    {health.responseTime ? `${health.responseTime}ms` : ''}
                </span>
            )}

            {showRefresh && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                >
                    <RefreshCw
                        className={cn('h-3 w-3', isLoading && 'animate-spin')}
                    />
                </Button>
            )}
        </div>
    )
}
