import { useDatabaseHealth } from '@/modules/database-actions/hooks/use-database-health'
import { Button } from '@/components/ui/button'
import { Badge, Tooltip, TooltipContent, TooltipTrigger } from '@/components/components/ui'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/shared/utils'

type TProps = {
    showRefresh?: boolean
    showDetails?: boolean
    className?: string
    interval?: number
}

const statusConfig = {
    checking: {
        variant: 'secondary' as const,
        label: 'Checking',
        color: 'text-gray-500'
    },
    healthy: {
        variant: 'success' as const,
        label: 'Connected',
        color: 'text-emerald-600'
    },
    error: {
        variant: 'destructive' as const,
        label: 'Connection Failed',
        color: 'text-rose-600'
    },
    disconnected: {
        variant: 'warning' as const,
        label: 'Not Available',
        color: 'text-amber-600'
    }
} as const

export function DatabaseHealthIndicator({
    showRefresh = true,
    showDetails = true,
    className,
    interval = 30000
}: TProps) {
    const { health, isLoading, refresh } = useDatabaseHealth({ interval })

    const config = statusConfig[health.status]

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

    const healthy = health.status === 'healthy'
    const disconnected = health.status === 'disconnected'
    const error = health.status === 'error'
    const checking = health.status === 'checking'

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={config.variant}
                            className={cn(
                                'gap-1.5 px-2 transition-colors duration-200',
                                health.status === 'error' &&
                                    'bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 border-rose-300/10',
                                health.status === 'disconnected' &&
                                    'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 border-amber-300/10',
                                health.status === 'healthy' &&
                                    'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 border-emerald-300/10',
                                health.status === 'checking' &&
                                    'bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 border-gray-300/10'
                            )}
                        >
                            <span
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    healthy && 'bg-emerald-600 pulse-emerald',
                                    disconnected && 'bg-amber-600 pulse-amber',
                                    error && 'bg-rose-600 pulse-rose',
                                    checking && 'bg-gray-600 pulse-gray'
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
