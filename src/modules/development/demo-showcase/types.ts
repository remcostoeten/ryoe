import type { ComponentType, ReactNode } from 'react'

export interface DemoComponentProps {
    [key: string]: any
}

export interface DemoAction {
    id: string
    label: string
    description?: string
    action: () => void | Promise<void>
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
    icon?: ComponentType<{ className?: string }>
    disabled?: boolean
}

export interface DemoState {
    id: string
    label: string
    description?: string
    props: DemoComponentProps
    data?: any
}

export interface ComponentDemo {
    id: string
    title: string
    description: string
    component: ComponentType<any>
    category?: string

    // Component usage code
    code: string

    // Different states to showcase
    states?: DemoState[]

    // Actions that can be triggered
    actions?: DemoAction[]

    // Default props
    defaultProps?: DemoComponentProps

    // Whether to show props editor
    showPropsEditor?: boolean

    // Custom render wrapper
    renderWrapper?: (children: ReactNode) => ReactNode
}

export interface DemoShowcaseProps {
    demos?: ComponentDemo[]
    selectedDemo?: string
    onDemoChange?: (demoId: string) => void
    className?: string
}

export interface DemoRegistryEntry {
    demo: ComponentDemo
    category: string
    tags: string[]
} 