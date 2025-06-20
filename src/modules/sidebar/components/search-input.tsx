import { useRef, useState, useEffect, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'

type TProps = {
	onSearch: (query: string) => void
	onCancel: () => void
	isVisible: boolean
	placeholder?: string
	onQueryChange?: (query: string) => void
}

export function SearchInput({
	onSearch,
	onCancel,
	isVisible,
	placeholder = 'Search...',
	onQueryChange,
}: TProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const debounceTimer = useRef<NodeJS.Timeout | null>(null)

	function handleSearch() {
		if (searchQuery.trim()) {
			onSearch(searchQuery.trim())
		}
	}

	function handleCancel() {
		setSearchQuery('')
		onCancel()
	}

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') handleSearch()
		if (e.key === 'Escape') handleCancel()
	}

	function handleBlur() {
		// Small delay to allow for potential click events before canceling
		setTimeout(() => {
			handleCancel()
		}, 150)
	}

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current)

		debounceTimer.current = setTimeout(() => {
			if (onQueryChange) {
				onQueryChange(searchQuery.trim())
			}
		}, 300)

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current)
		}
	}, [searchQuery, onQueryChange])

	if (!isVisible) return null

	return (
		<div className='flex border-b border-sidebar-border bg-background AAA relative'>
			<Input
				value={searchQuery}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setSearchQuery(e.target.value)
				}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				placeholder={placeholder}
				className='h-7 text-xs bg-background AAA-primary border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 pr-16'
				autoFocus
			/>
			<div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2 text-sidebar-foreground/50 '>
				<kbd className='px-1 rounded border bg-background AAA-accent border-sidebar-border text-xs'>
					⏎
				</kbd>
				<kbd className='px-1 rounded border border-sidebar-border text-xs'>Esc</kbd>
			</div>
		</div>
	)
}
