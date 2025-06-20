'use client'

import { useLocation } from 'react-router'
import { TopActionBar } from './top-action-bar'
import { DocsActionBar } from './docs-action-bar'

type TActionBarResolverProps = {
	onSearch: (query: string) => void
	onCancelSearch: () => void
}

export function ActionBarResolver({ onSearch, onCancelSearch }: TActionBarResolverProps) {
	const location = useLocation()
	const pathname = location.pathname

	// Determine which action bar to show based on current route
	const isDocsPage = pathname.startsWith('/docs')

	if (isDocsPage) {
		return <DocsActionBar onSearch={onSearch} onCancelSearch={onCancelSearch} />
	}

	// Default to folder action bar for all other authenticated pages
	return <TopActionBar />
}
