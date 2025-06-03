'use client'

import { useEffect, useState, useMemo } from 'react'

type TocItem = {
    id: string
    title: string
    level: number
}

export function useToc() {
    const [toc, setToc] = useState<TocItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Use MutationObserver to watch for DOM changes
        const observer = new MutationObserver(() => {
            const headings = Array.from(document.querySelectorAll('h2, h3, h4'))

            const tocItems = headings
                .filter((heading) => heading.id) // Only include headings with IDs
                .map((heading) => {
                    // Determine heading level (h2 = 2, h3 = 3, etc.)
                    const level = Number.parseInt(
                        heading.tagName.substring(1),
                        10
                    )

                    return {
                        id: heading.id,
                        title: heading.textContent || '',
                        level
                    }
                })

            setToc(tocItems)
            setIsLoading(false)
        })

        // Initial scan
        const initialScan = () => {
            const headings = Array.from(document.querySelectorAll('h2, h3, h4'))

            const tocItems = headings
                .filter((heading) => heading.id)
                .map((heading) => {
                    const level = Number.parseInt(
                        heading.tagName.substring(1),
                        10
                    )

                    return {
                        id: heading.id,
                        title: heading.textContent || '',
                        level
                    }
                })

            setToc(tocItems)
            setIsLoading(false)
        }

        // Run initial scan
        initialScan()

        // Watch for changes in the document
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['id']
        })

        return () => {
            observer.disconnect()
        }
    }, [])

    const memoizedToc = useMemo(() => toc, [toc])

    return { toc: memoizedToc, isLoading }
}
