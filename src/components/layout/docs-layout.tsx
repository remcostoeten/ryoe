'use client'

import {
    useState,
    useEffect,
    useMemo,
    memo,
    Suspense,
    type ReactNode
} from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    ArrowLeft,
    ExternalLink,
    Menu,
    ChevronUp,
    Home,
    BookOpen,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { MobileTocSkeleton, TocSkeleton } from '../ui/loaders'

type TocItem = {
    title: string
    id: string
    level: number
}

type DocsLayoutProps = {
    children: ReactNode
    title: string
    previousPage?: {
        title: string
        path: string
    }
    nextPage?: {
        title: string
        path: string
    }
    toc?: TocItem[]
    isLoading?: boolean
}

// Enhanced content skeleton
const ContentSkeleton = memo(() => (
    <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="space-y-8">
                {/* Title and intro */}
                <div className="space-y-4">
                    <div className="h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                    </div>
                </div>

                {/* Section with code block */}
                <div className="space-y-4">
                    <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-32 bg-muted/50 rounded-lg border animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
                    </div>
                </div>

                {/* Another section */}
                <div className="space-y-4">
                    <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-muted rounded animate-pulse"
                                style={{ width: `${70 + Math.random() * 30}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* List section */}
                <div className="space-y-4">
                    <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-muted rounded-full animate-pulse" />
                                <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </main>
))

const TableOfContents = memo(
    ({ toc, activeSection }: { toc: TocItem[]; activeSection: string }) => (
        <aside
            className="hidden lg:block w-64 xl:w-72 shrink-0 border-r h-[calc(100vh-65px)] sticky top-[65px]"
            role="complementary"
            aria-label="Table of contents"
        >
            <nav className="p-4 h-full" aria-label="Page contents">
                <div className="sticky top-[85px]">
                    <h2
                        className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2"
                        id="toc-heading"
                    >
                        <BookOpen className="h-3 w-3" />
                        ON THIS PAGE
                    </h2>
                    <ScrollArea
                        className="h-[calc(100vh-150px)]"
                        aria-labelledby="toc-heading"
                    >
                        <ul className="space-y-1 pr-2" role="list">
                            {toc.map((item) => (
                                <li key={item.id} role="listitem">
                                    <a
                                        href={`#${item.id}`}
                                        className={cn(
                                            'block py-1.5 px-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border-l-2 border-transparent',
                                            item.level === 2
                                                ? 'ml-0'
                                                : item.level === 3
                                                  ? 'ml-3'
                                                  : 'ml-6',
                                            activeSection === item.id
                                                ? 'text-primary font-medium bg-primary/5 border-l-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-l-muted-foreground/30'
                                        )}
                                        aria-current={
                                            activeSection === item.id
                                                ? 'location'
                                                : undefined
                                        }
                                    >
                                        <span className="block truncate">
                                            {item.title}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>

                    {/* Subtle fade at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>
            </nav>
        </aside>
    )
)

// Enhanced mobile navigation
const MobileNavigation = memo(
    ({
        toc,
        activeSection,
        isLoading
    }: {
        toc: TocItem[]
        activeSection: string
        isLoading: boolean
    }) => (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px]"
                aria-label="Navigation menu"
            >
                <div className="flex flex-col h-full">
                    <header className="px-2 py-4 border-b">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Documentation
                        </h2>
                    </header>

                    <div className="py-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documentation..."
                                className="pl-10"
                                aria-label="Search documentation"
                            />
                        </div>

                        <nav className="space-y-1" aria-label="Main navigation">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link to="/docs">Documentation Home</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link to="/docs/storage">
                                    Storage & File System
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link to="/docs/db-operations">
                                    Database Operations
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link to="/docs/storage-api">
                                    Storage API Reference
                                </Link>
                            </Button>
                        </nav>
                    </div>

                    {isLoading ? (
                        <MobileTocSkeleton />
                    ) : toc.length > 0 ? (
                        <div className="py-4 border-t">
                            <h3 className="text-sm font-medium px-4 mb-2 flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                On This Page
                            </h3>
                            <ScrollArea className="h-[calc(100vh-300px)]">
                                <nav
                                    className="space-y-1 px-2"
                                    aria-label="Page contents"
                                >
                                    {toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={cn(
                                                'block py-1.5 px-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                                item.level === 2
                                                    ? 'pl-2'
                                                    : item.level === 3
                                                      ? 'pl-4'
                                                      : 'pl-6',
                                                activeSection === item.id
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'hover:bg-muted'
                                            )}
                                            aria-current={
                                                activeSection === item.id
                                                    ? 'location'
                                                    : undefined
                                            }
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </ScrollArea>
                        </div>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    )
)

// Main layout component
export const DocsLayout = memo(
    ({
        children,
        title,
        previousPage,
        nextPage,
        toc = [],
        isLoading = false
    }: DocsLayoutProps) => {
        const [scrollProgress, setScrollProgress] = useState(0)
        const [activeSection, setActiveSection] = useState('')
        const [showScrollTop, setShowScrollTop] = useState(false)

        // Memoize scroll handler
        const handleScroll = useMemo(() => {
            let ticking = false

            return () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const totalHeight =
                            document.documentElement.scrollHeight -
                            document.documentElement.clientHeight
                        const progress =
                            totalHeight > 0
                                ? (window.scrollY / totalHeight) * 100
                                : 0
                        setScrollProgress(progress)

                        setShowScrollTop(window.scrollY > 300)

                        const headings = Array.from(
                            document.querySelectorAll('h2, h3, h4')
                        )

                        for (let i = headings.length - 1; i >= 0; i--) {
                            const heading = headings[i]
                            const rect = heading.getBoundingClientRect()

                            // Adjust for global header (80px) + docs header (approx 80px) = 160px
                            if (rect.top <= 160) {
                                const id = heading.id
                                if (id && id !== activeSection) {
                                    setActiveSection(id)
                                    break
                                }
                            }
                        }

                        ticking = false
                    })
                    ticking = true
                }
            }
        }, [activeSection])

        useEffect(() => {
            window.addEventListener('scroll', handleScroll, { passive: true })
            return () => window.removeEventListener('scroll', handleScroll)
        }, [handleScroll])

        const scrollToTop = useMemo(
            () => () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            },
            []
        )

        return (
            <div className="min-h-screen flex flex-col">
                {/* Add padding to account for global header */}
                <div className="h-20" aria-hidden="true" />
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-20 z-40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/docs">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        <ArrowLeft
                                            className="h-4 w-4 mr-2"
                                            aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">
                                            Back to Docs
                                        </span>
                                        <span className="sm:hidden">Back</span>
                                    </Button>
                                </Link>
                                <div
                                    className="h-6 w-px bg-border hidden sm:block"
                                    aria-hidden="true"
                                />
                                <h1 className="text-lg sm:text-xl font-semibold truncate">
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden md:flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            to="/"
                                            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <Home
                                                className="h-4 w-4 mr-2"
                                                aria-hidden="true"
                                            />
                                            Home
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="relative group focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        aria-label="Search documentation (Cmd+K)"
                                    >
                                        <Search
                                            className="h-4 w-4 mr-2"
                                            aria-hidden="true"
                                        />
                                        Search
                                        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-60 group-hover:opacity-100">
                                            ⌘K
                                        </kbd>
                                    </Button>
                                </div>
                                <MobileNavigation
                                    toc={toc}
                                    activeSection={activeSection}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="h-0.5 bg-primary transition-all duration-150 ease-out"
                        style={{ width: `${scrollProgress}%` }}
                        role="progressbar"
                        aria-label="Reading progress"
                        aria-valuenow={Math.round(scrollProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </header>

                <div className="flex-1 flex">
                    {isLoading ? (
                        <TocSkeleton />
                    ) : toc.length > 0 ? (
                        <TableOfContents
                            toc={toc}
                            activeSection={activeSection}
                        />
                    ) : null}

                    {isLoading ? (
                        <ContentSkeleton />
                    ) : (
                        <main className="flex-1 min-w-0" role="main">
                            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                                <article className="prose prose-slate dark:prose-invert max-w-none">
                                    <Suspense fallback={<ContentSkeleton />}>
                                        {children}
                                    </Suspense>
                                </article>
                            </div>

                            <nav
                                className="border-t bg-muted/50"
                                aria-label="Page navigation"
                            >
                                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                                    <div className="flex items-center justify-between">
                                        {previousPage ? (
                                            <Button variant="outline" asChild>
                                                <Link
                                                    to={previousPage.path}
                                                    className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                >
                                                    <ArrowLeft
                                                        className="h-4 w-4 mr-2"
                                                        aria-hidden="true"
                                                    />
                                                    {previousPage.title}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div />
                                        )}
                                        {nextPage && (
                                            <Button asChild>
                                                <Link
                                                    to={nextPage.path}
                                                    className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                >
                                                    {nextPage.title}
                                                    <ExternalLink
                                                        className="h-4 w-4 ml-2"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </nav>
                        </main>
                    )}
                </div>

                {/* Fixed Controls */}
                <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
                    {showScrollTop && (
                        <Button
                            size="icon"
                            className="rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                        >
                            <ChevronUp className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    )}
                </div>
            </div>
        )
    }
)

DocsLayout.displayName = 'DocsLayout'
