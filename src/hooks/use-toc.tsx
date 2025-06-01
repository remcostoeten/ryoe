import { useEffect, useState } from 'react'

export interface TocItem {
    id: string
    title: string
    level: number
}

export function useToc() {
    const [toc, setToc] = useState<TocItem[]>([])

    useEffect(() => {
        const headings = Array.from(document.querySelectorAll('h2, h3, h4'))

        const tocItems = headings
            .filter((heading) => heading.id) // Only include headings with IDs
            .map((heading) => {
                // Determine heading level (h2 = 2, h3 = 3, etc.)
                const level = Number.parseInt(heading.tagName.substring(1), 10)

                return {
                    id: heading.id,
                    title: heading.textContent || '',
                    level
                }
            })

        setToc(tocItems)
    }, [])

    return toc
}
