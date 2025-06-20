import { Suspense, lazy } from 'react'
import { DocsLayout } from '@/components/layout/docs-layout'
import { useToc } from '@/hooks/use-toc'

// Lazy load the MDX content
const WindowManagementMDX = lazy(() => import('@/docs/window-management.mdx'))

// Loading skeleton for window management content
const WindowManagementContentSkeleton = () => (
	<div className='space-y-8 animate-pulse'>
		{/* Title */}
		<div className='space-y-4'>
			<div className='h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg' />
			<div className='space-y-2'>
				<div className='h-4 bg-muted rounded' />
				<div className='h-4 bg-muted rounded w-5/6' />
			</div>
		</div>

		{/* Features section */}
		<div className='space-y-4'>
			<div className='h-8 bg-muted rounded w-1/3' />
			<div className='space-y-3'>
				<div className='h-4 bg-muted rounded' />
				<div className='h-4 bg-muted rounded w-4/5' />
				<div className='h-4 bg-muted rounded w-3/4' />
			</div>
		</div>

		{/* Implementation section */}
		<div className='space-y-4'>
			<div className='h-8 bg-muted rounded w-1/2' />
			<div className='h-32 bg-muted rounded' />
		</div>

		{/* Code examples */}
		<div className='space-y-4'>
			<div className='h-8 bg-muted rounded w-2/5' />
			<div className='h-40 bg-muted rounded' />
		</div>

		{/* Benefits section */}
		<div className='space-y-4'>
			<div className='h-8 bg-muted rounded w-1/4' />
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<div className='h-6 bg-muted rounded w-3/4' />
					<div className='h-4 bg-muted rounded' />
					<div className='h-4 bg-muted rounded w-5/6' />
				</div>
				<div className='space-y-2'>
					<div className='h-6 bg-muted rounded w-2/3' />
					<div className='h-4 bg-muted rounded' />
					<div className='h-4 bg-muted rounded w-4/5' />
				</div>
			</div>
		</div>
	</div>
)

export default function WindowManagementPage() {
	const { toc, isLoading: tocLoading } = useToc()

	return (
		<DocsLayout
			previousPage={{
				title: 'Storage API Reference',
				path: '/docs/storage-api',
			}}
			nextPage={{
				title: 'Documentation Home',
				path: '/docs',
			}}
			toc={toc}
			isLoading={tocLoading}
		>
			<Suspense fallback={<WindowManagementContentSkeleton />}>
				<WindowManagementMDX />
			</Suspense>
		</DocsLayout>
	)
}
