'use client'

import { useState, useEffect, useMemo, memo, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, ExternalLink, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/shared/utils'
import { TocSkeleton } from '../ui/loaders'

type TocItem = {
	title: string
	id: string
	level: number
}

type DocsLayoutProps = {
	children: ReactNode
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

const ContentSkeleton = memo(() => (
	<main className='flex-1 min-w-0'>
		<div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
			<div className='space-y-8'>
				{/* Title and intro */}
				<div className='space-y-4'>
					<div className='h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse' />
					<div className='space-y-2'>
						<div className='h-4 bg-muted rounded animate-pulse' />
						<div className='h-4 bg-muted rounded animate-pulse w-5/6' />
					</div>
				</div>

				{/* Section with code block */}
				<div className='space-y-4'>
					<div className='h-8 bg-muted rounded animate-pulse w-1/2' />
					<div className='h-32 bg-muted/50 rounded-lg border animate-pulse' />
					<div className='space-y-2'>
						<div className='h-4 bg-muted rounded animate-pulse' />
						<div className='h-4 bg-muted rounded animate-pulse w-4/5' />
					</div>
				</div>

				{/* Another section */}
				<div className='space-y-4'>
					<div className='h-8 bg-muted rounded animate-pulse w-2/3' />
					<div className='space-y-2'>
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className='h-4 bg-muted rounded animate-pulse'
								style={{ width: `${70 + Math.random() * 30}%` }}
							/>
						))}
					</div>
				</div>

				{/* List section */}
				<div className='space-y-4'>
					<div className='h-8 bg-muted rounded animate-pulse w-1/3' />
					<div className='space-y-3'>
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className='flex items-center gap-3'>
								<div className='h-2 w-2 bg-muted rounded-full animate-pulse' />
								<div className='h-4 bg-muted rounded animate-pulse flex-1' />
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
			className='hidden lg:block w-64 xl:w-72 shrink-0 border-r h-[calc(100vh-64px)] sticky top-16'
			role='complementary'
			aria-label='Table of contents'
		>
			<nav className='p-4 h-full' aria-label='Page contents'>
				<div className='sticky top-[85px]'>
					<h2
						className='text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2'
						id='toc-heading'
					>
						<BookOpen className='h-3 w-3' />
						ON THIS PAGE
					</h2>
					<ScrollArea className='h-[calc(100vh-200px)]' aria-labelledby='toc-heading'>
						<ul className='space-y-1 pr-2' role='list'>
							{toc.map(item => (
								<li key={item.id} role='listitem'>
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
											activeSection === item.id ? 'location' : undefined
										}
									>
										<span className='block truncate'>{item.title}</span>
									</a>
								</li>
							))}
						</ul>
					</ScrollArea>

					{/* Subtle fade at bottom */}
					<div className='absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none' />
				</div>
			</nav>
		</aside>
	)
)

// Main layout component
export const DocsLayout = memo(
	({ children, previousPage, nextPage, toc = [], isLoading = false }: DocsLayoutProps) => {
		const [activeSection, setActiveSection] = useState('')
		const [showScrollTop, setShowScrollTop] = useState(false)

		// Memoize scroll handler
		const handleScroll = useMemo(() => {
			let ticking = false

			return () => {
				if (!ticking) {
					requestAnimationFrame(() => {
						setShowScrollTop(window.scrollY > 300)

						const headings = Array.from(document.querySelectorAll('h2, h3, h4'))

						for (let i = headings.length - 1; i >= 0; i--) {
							const heading = headings[i]
							const rect = heading.getBoundingClientRect()

							// Account for navigation header (64px)
							if (rect.top <= 80) {
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
			<div className='min-h-screen flex flex-col'>
				<div className='flex-1 flex'>
					{isLoading ? (
						<TocSkeleton />
					) : toc.length > 0 ? (
						<TableOfContents toc={toc} activeSection={activeSection} />
					) : null}

					{isLoading ? (
						<ContentSkeleton />
					) : (
						<main className='flex-1 min-w-0' role='main'>
							<div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
								<article className='prose prose-slate dark:prose-invert max-w-none'>
									<Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
								</article>
							</div>

							<nav className='border-t bg-muted/50' aria-label='Page navigation'>
								<div className='max-w-4xl mx-auto px-4 sm:px-6 py-6'>
									<div className='flex items-center justify-between'>
										{previousPage ? (
											<Button variant='outline' asChild>
												<Link
													to={previousPage.path}
													className='focus:ring-2 focus:ring-primary focus:ring-offset-2'
												>
													<ArrowLeft
														className='h-4 w-4 mr-2'
														aria-hidden='true'
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
													className='focus:ring-2 focus:ring-primary focus:ring-offset-2'
												>
													{nextPage.title}
													<ExternalLink
														className='h-4 w-4 ml-2'
														aria-hidden='true'
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
				<div className='fixed bottom-6 right-6 flex flex-col gap-2 z-40'>
					{showScrollTop && (
						<Button
							size='icon'
							className='rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2'
							onClick={scrollToTop}
							aria-label='Scroll to top'
						>
							<ChevronUp className='h-5 w-5' aria-hidden='true' />
						</Button>
					)}
				</div>
			</div>
		)
	}
)

DocsLayout.displayName = 'DocsLayout'
