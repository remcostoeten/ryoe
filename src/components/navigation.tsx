'use client'

import { Link, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities'
import { Home, FileText, Folder, BookOpen, LogIn, User, Network } from 'lucide-react'
import { useCurrentUser } from '@/features/onboarding/hooks/useOnboarding'
import { Logo } from './logo'

const baseNavigationItems = [
    {
        label: 'Home',
        href: '/',
        icon: Home
    },
    {
        label: 'Notes',
        href: '/notes',
        icon: FileText
    },
    {
        label: 'Folders',
        href: '/folders',
        icon: Folder
    },
    {
        label: 'Port Manager',
        href: '/port-manager',
        icon: Network
    },
    {
        label: 'Docs',
        href: '/docs',
        icon: BookOpen
    }
]

const authenticatedItems = [
    {
        label: 'Profile',
        href: '/profile',
        icon: User
    }
]

const unauthenticatedItems = [
    {
        label: 'Sign In',
        href: '/sign-in',
        icon: LogIn
    }
]

export function Navigation() {
    const location = useLocation()
    const { user, isLoading } = useCurrentUser()

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                        <Logo/>
                    <div className="hidden md:flex items-center gap-1">
                        {baseNavigationItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.href ||
                                           (item.href !== '/' && location.pathname.startsWith(item.href))
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    asChild
                                    className={cn(
                                        "gap-2",
                                        isActive && "bg-muted"
                                    )}
                                >
                                    <Link to={item.href}>
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </Button>
                            )
                        })}

                        {/* Profile link - always show when not loading */}
                        {!isLoading && (
                            authenticatedItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href ||
                                               (item.href !== '/' && location.pathname.startsWith(item.href))

                                return (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        asChild
                                        className={cn(
                                            "gap-2",
                                            isActive && "bg-muted"
                                        )}
                                    >
                                        <Link to={item.href}>
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </Button>
                                )
                            })
                        )}

                        {/* Sign in link - only show if no user */}
                        {!isLoading && !user && (
                            unauthenticatedItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href ||
                                               (item.href !== '/' && location.pathname.startsWith(item.href))

                                return (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        asChild
                                        className={cn(
                                            "gap-2",
                                            isActive && "bg-muted"
                                        )}
                                    >
                                        <Link to={item.href}>
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </Button>
                                )
                            })
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/docs">
                                <BookOpen className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
