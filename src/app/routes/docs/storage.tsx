import { Suspense, lazy } from 'react'
import { DocsLayout } from '@/components/layout/docs-layout'
import { useToc } from '@/hooks/use-toc'
import { CodeBlockSkeleton } from '@/components/ui/code-block'

const StorageMDX = lazy(() => import('@/docs/storage.mdx'))

const StorageContentSkeleton = () => (
    <div className="space-y-8">
        <div className="space-y-4">
            <div className="h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            </div>
        </div>

        <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
            <CodeBlockSkeleton lines={6} />
        </div>

        <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
            <CodeBlockSkeleton lines={8} />
        </div>

        <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <CodeBlockSkeleton lines={3} />
        </div>
    </div>
)

export default function StoragePage() {
    const { toc, isLoading: tocLoading } = useToc()

    return (
        <DocsLayout
            title="Storage & File System"
            previousPage={{
                title: 'Documentation Home',
                path: '/docs'
            }}
            nextPage={{
                title: 'Database Operations',
                path: '/docs/db-operations'
            }}
            toc={toc}
            isLoading={tocLoading}
        >
            <Suspense fallback={<StorageContentSkeleton />}>
                <StorageMDX />
            </Suspense>
        </DocsLayout>
    )
}
