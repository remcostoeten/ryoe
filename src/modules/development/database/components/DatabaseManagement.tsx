import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { Separator } from '@/components/ui/separator'
import {
    Database,
    RefreshCw,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Activity,
    Zap,
    HardDrive
} from 'lucide-react'
import { DatabaseHealthIndicator } from '@/modules/database-actions/ui/database-health-indicator'
import { useDatabaseHealth } from '@/modules/database-actions/hooks/use-database-health'
import { useResetAllData, useHardResetDatabase } from '@/mutations/database-reset-mutations'
import type { DatabaseAction, DatabaseManagementProps } from '../types'
import { cn } from '@/shared/utils'

export function DatabaseManagement({ onActionComplete, className }: DatabaseManagementProps) {
    const [isConfirmingAction, setIsConfirmingAction] = useState<string | null>(null)

    const { health, refresh: refreshHealth } = useDatabaseHealth()
    const resetAllDataMutation = useResetAllData({
        onSuccess: () => {
            toast.success('Database reset completed successfully')
            onActionComplete?.('reset-soft', true)
        },
        onError: (error) => {
            toast.error(`Database reset failed: ${String(error)}`)
            onActionComplete?.('reset-soft', false)
        }
    })

    const hardResetMutation = useHardResetDatabase({
        onSuccess: () => {
            toast.success('Hard database reset completed successfully')
            onActionComplete?.('reset-hard', true)
        },
        onError: (error) => {
            toast.error(`Hard database reset failed: ${String(error)}`)
            onActionComplete?.('reset-hard', false)
        }
    })

    const databaseActions: DatabaseAction[] = [
        {
            id: 'health-check',
            title: 'Health Check',
            description: 'Check database connection and status',
            type: 'health-check',
            icon: Activity,
            action: refreshHealth,
            variant: 'default'
        },
        {
            id: 'reset-soft',
            title: 'Soft Reset',
            description: 'Clear all data but preserve table structure',
            type: 'reset',
            icon: RefreshCw,
            action: () => resetAllDataMutation.mutate(),
            variant: 'warning',
            requiresConfirmation: true,
            confirmationMessage: 'This will delete all data but preserve table structure. Continue?'
        },
        {
            id: 'reset-hard',
            title: 'Hard Reset',
            description: 'Drop and recreate all tables (destructive)',
            type: 'reset',
            icon: Trash2,
            action: () => hardResetMutation.mutate(),
            variant: 'destructive',
            requiresConfirmation: true,
            confirmationMessage: 'This will completely destroy and recreate the database. This action cannot be undone. Continue?'
        }
    ]

    const handleActionClick = (action: DatabaseAction) => {
        if (action.requiresConfirmation) {
            setIsConfirmingAction(action.id)
        } else {
            executeAction(action)
        }
    }

    const executeAction = (action: DatabaseAction) => {
        try {
            action.action()
            setIsConfirmingAction(null)
        } catch (error) {
            toast.error(`Failed to execute ${action.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            onActionComplete?.(action.id, false)
        }
    }

    const cancelConfirmation = () => {
        setIsConfirmingAction(null)
    }

    const confirmAction = () => {
        const action = databaseActions.find(a => a.id === isConfirmingAction)
        if (action) {
            executeAction(action)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-emerald-500'
            case 'error': return 'text-red-500'
            case 'checking': return 'text-yellow-500'
            default: return 'text-gray-500'
        }
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Database Status Card */}
            <Card className="bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30">
                                <Database className="w-5 h-5 text-foreground/80" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Database Status</CardTitle>
                                <p className="text-sm text-muted-foreground/80">Monitor database connection health</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', getStatusColor(health.status))} />
                            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <DatabaseHealthIndicator
                            showRefresh={true}
                            showDetails={true}
                            className="justify-start"
                        />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Response Time</span>
                                <p className="font-mono">{health.responseTime ? `${health.responseTime}ms` : 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Last Checked</span>
                                <p className="font-mono">{health.lastChecked.toLocaleTimeString()}</p>
                            </div>
                        </div>

                        {health.message && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                                <p className="text-sm text-muted-foreground">{health.message}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Database Actions Card */}
            <Card className="bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30">
                            <Zap className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Database Actions</CardTitle>
                            <p className="text-sm text-muted-foreground/80">Manage and reset database state</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {databaseActions.map((action, index) => {
                            const Icon = action.icon || HardDrive
                            const isLoading = (action.id === 'reset-soft' && resetAllDataMutation.isPending) ||
                                (action.id === 'reset-hard' && hardResetMutation.isPending)

                            return (
                                <div key={action.id}>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn(
                                                'w-5 h-5',
                                                action.variant === 'destructive' && 'text-red-400',
                                                action.variant === 'warning' && 'text-yellow-400',
                                                action.variant === 'default' && 'text-blue-400'
                                            )} />
                                            <div>
                                                <h4 className="font-medium">{action.title}</h4>
                                                <p className="text-sm text-muted-foreground/70">{action.description}</p>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant={action.variant === 'destructive' ? 'destructive' :
                                                action.variant === 'warning' ? 'outline' : 'default'}
                                            onClick={() => handleActionClick(action)}
                                            disabled={isLoading}
                                            className="min-w-20"
                                        >
                                            {isLoading ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                action.title
                                            )}
                                        </Button>
                                    </div>

                                    {index < databaseActions.length - 1 && <Separator className="opacity-30" />}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            {isConfirmingAction && (
                <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-lg font-semibold">Confirm Action</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            {databaseActions.find(a => a.id === isConfirmingAction)?.confirmationMessage}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={cancelConfirmation}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmAction}
                                className="min-w-20"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
} 