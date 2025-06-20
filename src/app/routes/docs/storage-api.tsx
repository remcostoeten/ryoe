import { Suspense, lazy } from 'react'
import { DocsLayout } from '@/components/layout/docs-layout'
import { useToc } from '@/hooks/use-toc'
import { Skeleton } from '@/components/ui/skeleton'

const StorageApiMDX = lazy(() => import('@/docs/storage-api.mdx'))

const ApiContentSkeleton = () => (
	<div className='space-y-8'>
		<div className='space-y-4'>
			<Skeleton className='h-10 w-2/3' />
			<Skeleton className='h-4 w-full' />
			<Skeleton className='h-4 w-4/5' />
		</div>

		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className='space-y-4'>
				<Skeleton className='h-8 w-1/2' />
				<Skeleton className='h-24 w-full rounded-lg bg-muted' />
				<div className='space-y-2'>
					{Array.from({ length: 3 }).map((_, j) => (
						<Skeleton key={j} className='h-4 w-full' />
					))}
				</div>
			</div>
		))}

		<div className='space-y-4'>
			<Skeleton className='h-8 w-1/3' />
			<div className='space-y-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='flex gap-4'>
						<Skeleton className='h-6 w-20' />
						<Skeleton className='h-6 flex-1' />
					</div>
				))}
			</div>
		</div>
	</div>
)

export default function StorageApiPage() {
	const { toc, isLoading: tocLoading } = useToc()

	return (
		<DocsLayout
			previousPage={{
				title: 'Database Operations',
				path: '/docs/db-operations',
			}}
			toc={toc}
			isLoading={tocLoading}
		>
			<Suspense fallback={<ApiContentSkeleton />}>
				<StorageApiMDX />
			</Suspense>
		</DocsLayout>
	)
}
