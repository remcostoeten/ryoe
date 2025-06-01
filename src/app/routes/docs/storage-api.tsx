import { DocsLayout } from '@/components/layout/docs-layout'
import StorageApiMDX from '@/docs/storage-api.mdx'
import { useToc } from '@/hooks/use-toc'

export default function StorageApiPage() {
    const toc = useToc()

    return (
        <DocsLayout
            title="Storage API Reference"
            previousPage={{
                title: 'Database Operations',
                path: '/docs/db-operations'
            }}
            toc={toc}
        >
            <StorageApiMDX />
        </DocsLayout>
    )
}
