import type { ComponentType } from 'react'
import type { ComponentDemo, DemoState, DemoAction, DemoComponentProps } from '../types'

export interface CreateComponentDemoOptions<T = any> {
    id: string
    title: string
    description: string
    component: ComponentType<T>
    code: string
    category?: string
    defaultProps?: T
    states?: Omit<DemoState, 'id'>[]
    actions?: Omit<DemoAction, 'id'>[]
    showPropsEditor?: boolean
    renderWrapper?: ComponentDemo['renderWrapper']
}

export function createComponentDemo<T = DemoComponentProps>(
    options: CreateComponentDemoOptions<T>
): ComponentDemo {
    const {
        id,
        title,
        description,
        component,
        code,
        category,
        defaultProps,
        states = [],
        actions = [],
        showPropsEditor = true,
        renderWrapper
    } = options

    return {
        id,
        title,
        description,
        component,
        code,
        category,
        defaultProps: defaultProps as DemoComponentProps,
        showPropsEditor,
        renderWrapper,

        // Transform states to add IDs
        states: states.map((state, index) => ({
            ...state,
            id: `${id}-state-${index}`
        })),

        // Transform actions to add IDs
        actions: actions.map((action, index) => ({
            ...action,
            id: `${id}-action-${index}`
        }))
    }
}

// Helper for creating Toast demos specifically
export function createToastDemo(options: {
    id: string
    title: string
    description: string
    actions: Array<{
        label: string
        toastType: 'success' | 'error' | 'warning' | 'info' | 'neutral'
        message: string
        duration?: number
    }>
}): ComponentDemo {
    const { toast } = require('@/components/ui/toast')

    return createComponentDemo({
        id: options.id,
        title: options.title,
        description: options.description,
        component: () => null, // Toast is a service, not a component
        code: `import { toast } from '@/components/ui/toast'

// Usage examples:
${options.actions.map(action =>
            `toast.${action.toastType}('${action.message}'${action.duration ? `, ${action.duration}` : ''})`
        ).join('\n')}`,
        actions: options.actions.map(action => ({
            label: action.label,
            description: `Show ${action.toastType} toast: "${action.message}"`,
            action: () => toast[action.toastType](action.message, action.duration),
            variant: action.toastType === 'error' ? 'destructive' as const : 'default' as const
        })),
        showPropsEditor: false
    })
} 