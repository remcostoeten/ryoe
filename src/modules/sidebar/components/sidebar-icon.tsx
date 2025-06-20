import { PanelLeft } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'

export function SidebarIcon() {
	const { toggleSidebar } = useSidebar()

	return (
		<button
			onClick={toggleSidebar}
			className='inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			aria-label='Toggle sidebar'
		>
			<PanelLeft className='h-5 w-5' />
		</button>
	)
}
