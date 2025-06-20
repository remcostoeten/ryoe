'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type TSidebarSearchContextValue = {
	searchFilter: string
	setSearchFilter: (filter: string) => void
}

const SidebarSearchContext = createContext<TSidebarSearchContextValue | undefined>(undefined)

export function useSidebarSearch() {
	const context = useContext(SidebarSearchContext)
	if (context === undefined) {
		throw new Error('useSidebarSearch must be used within a SidebarSearchProvider')
	}
	return context
}

type TSidebarSearchProviderProps = {
	children: ReactNode
}

export function SidebarSearchProvider({ children }: TSidebarSearchProviderProps) {
	const [searchFilter, setSearchFilter] = useState('')

	const contextValue: TSidebarSearchContextValue = {
		searchFilter,
		setSearchFilter,
	}

	return (
		<SidebarSearchContext.Provider value={contextValue}>
			{children}
		</SidebarSearchContext.Provider>
	)
}
