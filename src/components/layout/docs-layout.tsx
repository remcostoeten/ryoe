'use client'

import { useState, useEffect, type ReactNode } from 'react'
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

interface DocsLayoutProps {
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
    toc?: {
        title: string
        id: string
        level: number
    }[]
}

export function DocsLayout({
    children,
    title,
    previousPage,
    nextPage,
    toc = []
}: DocsLayoutProps) {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeSection, setActiveSection] = useState('')
    const [showScrollTop, setShowScrollTop] = useState(false)

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll progress
            const totalHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight
            const progress = (window.scrollY / totalHeight) * 100
            setScrollProgress(progress)

            // Show/hide scroll to top button
            setShowScrollTop(window.scrollY > 300)

            // Update active section based on scroll position
            const headings = Array.from(document.querySelectorAll('h2, h3, h4'))

            for (let i = headings.length - 1; i >= 0; i--) {
                const heading = headings[i]
                const rect = heading.getBoundingClientRect()

                if (rect.top <= 100) {
                    const id = heading.id
                    if (id) {
                        setActiveSection(id)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Navigation */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/docs">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">
                                        Back to Docs
                                    </span>
                                    <span className="sm:hidden">Back</span>
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-border hidden sm:block" />
                            <h1 className="text-lg sm:text-xl font-semibold truncate">
                                {title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/">
                                        <Home className="h-4 w-4 mr-2" />
                                        Home
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="relative group"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-60 group-hover:opacity-100">
                                        ⌘K
                                    </span>
                                </Button>
                            </div>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="md:hidden"
                                    >
                                        <Menu className="h-4 w-4" />
                                        <span className="sr-only">Menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-[300px] sm:w-[400px]"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="px-2 py-4 border-b">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                Documentation
                                            </h2>
                                        </div>
                                        <div className="py-4">
                                            <Input
                                                placeholder="Search documentation..."
                                                className="mb-4"
                                            />
                                            <div className="space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    asChild
                                                >
                                                    <Link to="/docs">
                                                        Documentation Home
                                                    </Link>
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
                                            </div>
                                        </div>
                                        {toc.length > 0 && (
                                            <div className="py-4 border-t">
                                                <h3 className="text-sm font-medium px-4 mb-2">
                                                    On This Page
                                                </h3>
                                                <ScrollArea className="h-[calc(100vh-300px)]">
                                                    <div className="space-y-1 px-2">
                                                        {toc.map((item) => (
                                                            <a
                                                                key={item.id}
                                                                href={`#${item.id}`}
                                                                className={cn(
                                                                    'block py-1 px-2 text-sm rounded-md transition-colors',
                                                                    item.level ===
                                                                        2
                                                                        ? 'pl-2'
                                                                        : item.level ===
                                                                            3
                                                                          ? 'pl-4'
                                                                          : 'pl-6',
                                                                    activeSection ===
                                                                        item.id
                                                                        ? 'bg-primary/10 text-primary font-medium'
                                                                        : 'hover:bg-muted'
                                                                )}
                                                            >
                                                                {item.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
                {/* Scroll Progress Indicator */}
                <div
                    className="h-0.5 bg-primary transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </header>

            {/* Main Content with Sidebar */}
            <div className="flex-1 flex">
                {/* Table of Contents Sidebar - Desktop Only */}
                {toc.length > 0 && (
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r h-[calc(100vh-65px)] sticky top-[65px]">
                        <div className="p-4 h-full">
                            <div className="sticky top-[85px]">
                                <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                                    ON THIS PAGE
                                </h3>
                                <ScrollArea className="h-[calc(100vh-150px)]">
                                    <div className="space-y-1 pr-2">
                                        {toc.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={cn(
                                                    'block py-1 text-sm rounded-md transition-colors',
                                                    item.level === 2
                                                        ? 'pl-2'
                                                        : item.level === 3
                                                          ? 'pl-4'
                                                          : 'pl-6',
                                                    activeSection === item.id
                                                        ? 'text-primary font-medium'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                            >
                                                {item.title}
                                            </a>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            {children}
                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="border-t bg-muted/50">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                            <div className="flex items-center justify-between">
                                {previousPage ? (
                                    <Button variant="outline" asChild>
                                        <Link to={previousPage.path}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            {previousPage.title}
                                        </Link>
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                {nextPage && (
                                    <Button asChild>
                                        <Link to={nextPage.path}>
                                            {nextPage.title}
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Fixed Controls */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
                {showScrollTop && (
                    <Button
                        size="icon"
                        className="rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                        onClick={scrollToTop}
                    >
                        <ChevronUp className="h-5 w-5" />
                        <span className="sr-only">Scroll to top</span>
                    </Button>
                )}
            </div>
        </div>
    )
}
