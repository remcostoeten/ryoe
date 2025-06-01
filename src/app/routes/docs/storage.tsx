import { DocsLayout } from '@/components/layout/docs-layout'
import StorageMDX from '@/docs/storage.mdx'
import { useToc } from '@/hooks/use-toc'

export default function StoragePage() {
    const toc = useToc()

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
        >
            <StorageMDX />
        </DocsLayout>
    )
}
