import { useState, useEffect, useCallback } from 'react'
import { PortManagerService } from '@/services/port-manager-service'
import type { TPortScanResult, TPortManagerState, TPortManagerConfig } from '@/types/port-manager'

const DEFAULT_CONFIG: TPortManagerConfig = {
	autoRefreshInterval: 5000, // 5 seconds
	showOnlyDevelopmentPorts: true,
	groupByProcess: false,
	notifications: true,
}

export function usePortManager(config: Partial<TPortManagerConfig> = {}) {
	const finalConfig = { ...DEFAULT_CONFIG, ...config }

	const [state, setState] = useState<TPortManagerState>({
		ports: [],
		isScanning: false,
		selectedPorts: [],
	})

	const [autoRefresh, setAutoRefresh] = useState(false)

	// Scan ports
	const scanPorts = useCallback(async () => {
		setState(prev => ({ ...prev, isScanning: true, error: undefined }))

		try {
			const result: TPortScanResult = await PortManagerService.scanPorts()
			const filteredPorts = finalConfig.showOnlyDevelopmentPorts
				? result.ports.filter(port => port.is_development)
				: result.ports

			setState(prev => ({
				...prev,
				ports: filteredPorts,
				isScanning: false,
				lastScanTime: new Date(),
			}))
		} catch (error) {
			setState(prev => ({
				...prev,
				isScanning: false,
				error: error instanceof Error ? error.message : 'Failed to scan ports',
			}))
		}
	}, [finalConfig.showOnlyDevelopmentPorts])

	// Kill a single port
	const killPort = useCallback(
		async (port: number) => {
			try {
				const success = await PortManagerService.killPort(port)
				if (success) {
					// Refresh ports after killing
					await scanPorts()
					return { success: true }
				} else {
					return { success: false, error: 'Failed to kill port' }
				}
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			}
		},
		[scanPorts]
	)

	// Kill multiple ports
	const killMultiplePorts = useCallback(
		async (ports: number[]) => {
			const results = await PortManagerService.killMultiplePorts(ports)
			// Refresh after killing
			await scanPorts()
			return results
		},
		[scanPorts]
	)

	// Kill selected ports
	const killSelectedPorts = useCallback(async () => {
		if (state.selectedPorts.length === 0) return []
		const results = await killMultiplePorts(state.selectedPorts)
		setState(prev => ({ ...prev, selectedPorts: [] }))
		return results
	}, [state.selectedPorts, killMultiplePorts])

	// Toggle port selection
	const togglePortSelection = useCallback((port: number) => {
		setState(prev => ({
			...prev,
			selectedPorts: prev.selectedPorts.includes(port)
				? prev.selectedPorts.filter(p => p !== port)
				: [...prev.selectedPorts, port],
		}))
	}, [])

	// Select all ports
	const selectAllPorts = useCallback(() => {
		setState(prev => ({
			...prev,
			selectedPorts: prev.ports.map(p => p.port),
		}))
	}, [])

	// Clear selection
	const clearSelection = useCallback(() => {
		setState(prev => ({ ...prev, selectedPorts: [] }))
	}, [])

	// Get grouped ports
	const getGroupedPorts = useCallback(() => {
		return PortManagerService.groupPortsByProcess(state.ports)
	}, [state.ports])

	// Get development ports only
	const getDevelopmentPorts = useCallback(() => {
		return state.ports.filter(port => port.is_development)
	}, [state.ports])

	// Auto-refresh effect
	useEffect(() => {
		if (!autoRefresh) return

		const interval = setInterval(() => {
			scanPorts()
		}, finalConfig.autoRefreshInterval)

		return () => clearInterval(interval)
	}, [autoRefresh, finalConfig.autoRefreshInterval, scanPorts])

	// Initial scan
	useEffect(() => {
		scanPorts()
	}, [scanPorts])

	return {
		// State
		ports: state.ports,
		isScanning: state.isScanning,
		lastScanTime: state.lastScanTime,
		error: state.error,
		selectedPorts: state.selectedPorts,

		// Actions
		scanPorts,
		killPort,
		killMultiplePorts,
		killSelectedPorts,

		// Selection
		togglePortSelection,
		selectAllPorts,
		clearSelection,

		// Utilities
		getGroupedPorts,
		getDevelopmentPorts,

		// Auto-refresh
		autoRefresh,
		setAutoRefresh,

		// Config
		config: finalConfig,
	}
}
