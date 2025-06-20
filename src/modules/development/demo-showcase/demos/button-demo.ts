import { Button } from '@/components/ui/button'
import { createComponentDemo } from '../factories'
import { registerDemo } from '../registry'
import { Plus, Trash2 } from 'lucide-react'

// Create Button demo
const buttonDemo = createComponentDemo({
    id: 'button-demo',
    title: 'Button Component',
    description: 'Versatile button component with different variants, sizes, and states',
    component: Button,
    code: `import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>`,
    category: 'UI Components',
    defaultProps: {
        children: 'Click me',
        variant: 'default',
        size: 'default'
    },
    states: [
        {
            label: 'Default',
            description: 'Standard button appearance',
            props: {
                children: 'Default Button',
                variant: 'default'
            }
        },
        {
            label: 'Destructive',
            description: 'For dangerous actions like delete',
            props: {
                children: 'Delete Item',
                variant: 'destructive'
            }
        },
        {
            label: 'Outline',
            description: 'Secondary button with border',
            props: {
                children: 'Cancel',
                variant: 'outline'
            }
        },
        {
            label: 'Ghost',
            description: 'Minimal button without background',
            props: {
                children: 'Ghost Button',
                variant: 'ghost'
            }
        },
        {
            label: 'Small',
            description: 'Compact button size',
            props: {
                children: 'Small Button',
                size: 'sm'
            }
        },
        {
            label: 'Large',
            description: 'Large button size',
            props: {
                children: 'Large Button',
                size: 'lg'
            }
        },
        {
            label: 'Disabled',
            description: 'Disabled button state',
            props: {
                children: 'Disabled Button',
                disabled: true
            }
        }
    ],
    actions: [
        {
            label: 'Show Success',
            description: 'Trigger success notification',
            action: () => {
                const { toast } = require('@/components/ui/toast')
                toast.success('Button action completed!')
            },
            icon: Plus,
            variant: 'default'
        },
        {
            label: 'Show Error',
            description: 'Trigger error notification',
            action: () => {
                const { toast } = require('@/components/ui/toast')
                toast.error('Button action failed!')
            },
            icon: Trash2,
            variant: 'destructive'
        }
    ]
})

// Register the demo
registerDemo(buttonDemo, 'UI Components', ['button', 'interactive', 'form', 'ui'])

export { buttonDemo } 