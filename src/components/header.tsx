'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

type TProps = {
    href: string
    children: React.ReactNode
}

function AnimatedNavLink({ href, children }: TProps) {
    return (
        <a
            href={href}
            className="group relative h-5 flex items-center overflow-hidden text-sm"
        >
            <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
                <span className="text-gray-300">{children}</span>
                <span className="text-white">{children}</span>
            </div>
        </a>
    )
}

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full')
    const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const toggleMenu = () => setIsOpen((prev) => !prev)

    useEffect(() => {
        if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current)

        if (isOpen) {
            setHeaderShapeClass('rounded-xl')
        } else {
            shapeTimeoutRef.current = setTimeout(() => {
                setHeaderShapeClass('rounded-full')
            }, 300)
        }

        return () => {
            if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current)
        }
    }, [isOpen])

    const navLinksData = [
        { label: 'Home', href: '/' },
        { label: 'Notes', href: '/notes' },
        { label: 'Folders', href: '/folders' },
        { label: 'Docs', href: '/docs' },
        { label: 'Logo', href: '/logo' },
        { label: 'Sign In', href: '/sign-in' }
    ]

    return (
        <header
            className={cn(
                `fixed left-1/2 top-6 z-20 flex w-[calc(100%-2rem)] flex-col
         -translate-x-1/2 transform items-center border border-[#333]
         bg-[#1f1f1f57] px-6 py-5 !pl-22 backdrop-blur-sm transition-[border-radius]
         duration-300 ease-in-out sm:w-auto`,
                headerShapeClass
            )}
        >
            <div className="flex w-full items-center justify-between gap-x-6 sm:gap-x-8">
                <div className="absolute left-4 flex items-center gap-2">
                    <Logo />
                </div>

                <nav className="hidden items-center space-x-6 text-sm sm:flex">
                    {navLinksData.map((link) => (
                        <AnimatedNavLink key={link.href} href={link.href}>
                            {link.label}
                        </AnimatedNavLink>
                    ))}
                </nav>

                <button
                    className="flex h-8 w-8 items-center justify-center text-gray-300 focus:outline-none sm:hidden"
                    onClick={toggleMenu}
                    aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
                >
                    {isOpen ? (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
            </div>

            <div
                className={cn(
                    'flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden',
                    isOpen
                        ? 'max-h-[1000px] pt-4 opacity-100'
                        : 'max-h-0 pt-0 opacity-0 pointer-events-none'
                )}
            >
                <nav className="flex w-full flex-col items-center space-y-4 text-base">
                    {navLinksData.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="w-full text-center text-gray-300 transition-colors hover:text-white"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    )
}
