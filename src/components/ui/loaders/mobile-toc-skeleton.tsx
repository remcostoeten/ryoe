import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const MobileTocSkeleton = memo(() => (
	<div className='py-4 border-t'>
		<div className='px-4 mb-2'>
			<Skeleton className='h-4 w-20' />
		</div>
		<div className='px-2 space-y-2 max-h-[calc(100vh-300px)] overflow-hidden'>
			{/* Hierarchical skeleton items */}
			<Skeleton className='h-3 w-28 ml-2' />
			<Skeleton className='h-3 w-24 ml-4' />
			<Skeleton className='h-3 w-20 ml-4' />
			<Skeleton className='h-3 w-32 ml-2' />
			<Skeleton className='h-3 w-26 ml-4' />
			<Skeleton className='h-3 w-18 ml-6' />
			<Skeleton className='h-3 w-22 ml-6' />
			<Skeleton className='h-3 w-30 ml-2' />
			<Skeleton className='h-3 w-24 ml-4' />
		</div>
	</div>
))

MobileTocSkeleton.displayName = 'MobileTocSkeleton'
