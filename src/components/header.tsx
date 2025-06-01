import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils' // Assuming this utility is available
import { Logo } from './logo'

const AnimatedNavLink = ({
    href,
    children
}: {
    href: string
    children: React.ReactNode
}) => {
    const defaultTextColor = 'text-gray-300'
    const hoverTextColor = 'text-white'
    const textSizeClass = 'text-sm'

    return (
        <a
            href={href}
            className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}
        >
            <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
                <span className={defaultTextColor}>{children}</span>
                <span className={hoverTextColor}>{children}</span>
            </div>
        </a>
    )
}

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full')
    const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        if (shapeTimeoutRef.current) {
            clearTimeout(shapeTimeoutRef.current)
        }

        if (isOpen) {
            setHeaderShapeClass('rounded-xl')
        } else {
            shapeTimeoutRef.current = setTimeout(() => {
                setHeaderShapeClass('rounded-full')
            }, 300)
        }

        return () => {
            if (shapeTimeoutRef.current) {
                clearTimeout(shapeTimeoutRef.current)
            }
        }
    }, [isOpen])

    const navLinksData = [
        { label: 'Home', href: '/' },
        { label: 'Docs', href: '/docs' }
    ]

    return (
        <header
            className={cn(
                `fixed left-1/2 top-6 z-20 flex w-[calc(100%-2rem)] flex-col
                       -translate-x-1/2 transform items-center
                       border border-[#333] bg-[#1f1f1f57]
                       px-6 py-3 !pl-22 backdrop-blur-sm transition-[border-radius]
                       duration-0 ease-in-out sm:w-auto !max-h-[] !py-5`,
                headerShapeClass
            )}
        >
            <div className="flex w-full items-center justify-between gap-x-6 sm:gap-x-8">
                <div className="absolute flex left-4 items-center gap-2">
                    <Logo />{' '}
                </div>

                <nav className="hidden items-center space-x-4 text-sm sm:flex sm:space-x-6">
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
                            ></path>
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
                            ></path>
                        </svg>
                    )}
                </button>
            </div>

            <div
                className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
                    isOpen
                        ? 'max-h-[1000px] pt-4 opacity-100'
                        : 'max-h-0 pt-0 opacity-0 pointer-events-none'
                }`}
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
