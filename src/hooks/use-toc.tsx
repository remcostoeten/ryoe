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
            console.log('Found headings:', headings.length)
            console.log('Headings with IDs:', headings.filter(h => h.id).length)

            // Debug: log all headings
            headings.forEach((heading, index) => {
                console.log(`Heading ${index}:`, {
                    tag: heading.tagName,
                    id: heading.id,
                    text: heading.textContent,
                    hasId: !!heading.id
                })
            })

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

            console.log('TOC items:', tocItems)
            setToc(tocItems)
            setIsLoading(false)
        }

        // Run initial scan with a small delay to ensure MDX content is rendered
        const timeoutId = setTimeout(initialScan, 100)

        // Also run immediately in case content is already there
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
            clearTimeout(timeoutId)
        }
    }, [])

    const memoizedToc = useMemo(() => toc, [toc])

    return { toc: memoizedToc, isLoading }
}
