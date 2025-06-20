import { createToastDemo } from '../factories'
import { registerDemo } from '../registry'

// Create Toast demo
const toastDemo = createToastDemo({
    id: 'toast-demo',
    title: 'Toast Notifications',
    description: 'Interactive toast notifications with different types and states',
    actions: [
        {
            label: 'Success Toast',
            toastType: 'success',
            message: 'Operation completed successfully!',
            duration: 3000
        },
        {
            label: 'Error Toast',
            toastType: 'error',
            message: 'Something went wrong. Please try again.',
            duration: 5000
        },
        {
            label: 'Warning Toast',
            toastType: 'warning',
            message: 'This action cannot be undone.',
            duration: 4000
        },
        {
            label: 'Info Toast',
            toastType: 'info',
            message: 'New update available. Click to refresh.',
            duration: 6000
        },
        {
            label: 'Neutral Toast',
            toastType: 'neutral',
            message: 'This is a neutral notification.',
            duration: 3000
        },
        {
            label: 'Long Duration',
            toastType: 'success',
            message: 'This toast will stay for 10 seconds.',
            duration: 10000
        },
        {
            label: 'Quick Toast',
            toastType: 'info',
            message: 'Quick message!',
            duration: 1500
        }
    ]
})

// Register the demo
registerDemo(toastDemo, 'UI Components', ['toast', 'notification', 'feedback', 'ui'])

export { toastDemo } 