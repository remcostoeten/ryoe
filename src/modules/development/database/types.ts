export interface DatabaseAction {
    id: string
    title: string
    description: string
    type: 'query' | 'mutation' | 'health-check' | 'reset'
    action: () => Promise<void> | void
    icon?: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'destructive' | 'warning'
    requiresConfirmation?: boolean
    confirmationMessage?: string
}

export interface DatabaseManagementProps {
    onActionComplete?: (actionId: string, success: boolean) => void
    className?: string
} 