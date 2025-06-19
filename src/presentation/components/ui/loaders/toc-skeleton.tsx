import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const TocSkeleton = memo(() => (
    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r h-[calc(100vh-65px)] sticky top-[65px]">
        <div className="p-4 h-full">
            <div className="sticky top-[85px]">
                {/* Header skeleton */}
                <div className="mb-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                </div>

                {/* TOC items skeleton with realistic hierarchy */}
                <div className="space-y-2 pr-2">
                    {/* Main section */}
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32 pl-2" />
                        <Skeleton className="h-3 w-28 pl-4 ml-2" />
                        <Skeleton className="h-3 w-24 pl-4 ml-2" />
                    </div>

                    {/* Another section */}
                    <div className="space-y-1 mt-3">
                        <Skeleton className="h-4 w-36 pl-2" />
                        <Skeleton className="h-3 w-30 pl-4 ml-2" />
                        <Skeleton className="h-3 w-26 pl-4 ml-2" />
                        <Skeleton className="h-3 w-20 pl-6 ml-4" />
                        <Skeleton className="h-3 w-22 pl-6 ml-4" />
                    </div>

                    {/* Third section */}
                    <div className="space-y-1 mt-3">
                        <Skeleton className="h-4 w-28 pl-2" />
                        <Skeleton className="h-3 w-32 pl-4 ml-2" />
                        <Skeleton className="h-3 w-24 pl-6 ml-4" />
                    </div>

                    {/* Fourth section */}
                    <div className="space-y-1 mt-3">
                        <Skeleton className="h-4 w-34 pl-2" />
                        <Skeleton className="h-3 w-26 pl-4 ml-2" />
                        <Skeleton className="h-3 w-28 pl-4 ml-2" />
                        <Skeleton className="h-3 w-18 pl-6 ml-4" />
                    </div>

                    {/* Additional items with varying lengths */}
                    <div className="space-y-1 mt-3">
                        <Skeleton className="h-4 w-30 pl-2" />
                        <Skeleton className="h-3 w-24 pl-4 ml-2" />
                    </div>
                </div>

                {/* Fade effect at bottom */}
                <div className="mt-8 h-8 bg-gradient-to-t from-background to-transparent" />
            </div>
        </div>
    </aside>
))

TocSkeleton.displayName = 'TocSkeleton'
