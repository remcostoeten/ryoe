export interface TPortInfo {
	port: number
	pid?: number
	process_name?: string
	protocol: string
	state: string
	local_address: string
	foreign_address?: string
	is_development: boolean
}

export interface TPortScanResult {
	ports: TPortInfo[]
	total_count: number
	development_count: number
}

export interface TPortManagerState {
	ports: TPortInfo[]
	isScanning: boolean
	lastScanTime?: Date
	error?: string
	selectedPorts: number[]
}

export interface TPortAction {
	port: number
	action: 'kill' | 'restart' | 'info'
	timestamp: Date
	success: boolean
	error?: string
}

export interface TPortManagerConfig {
	autoRefreshInterval: number // in milliseconds
	showOnlyDevelopmentPorts: boolean
	groupByProcess: boolean
	notifications: boolean
}

export type TPortStatus = 'active' | 'inactive' | 'unknown'

export interface TPortGroup {
	process_name: string
	ports: TPortInfo[]
	total_ports: number
}

// Common development port ranges and their typical uses
export const DEV_PORT_CATEGORIES = {
	'React/Next.js': [3000, 3001, 3002, 3003, 3004, 3005],
	'Express/Node.js': [4000, 4001, 4002, 4003, 4004, 4005],
	'Python/Flask': [5000, 5001, 5002, 5003, 5004, 5005],
	Vite: [5173, 5174, 5175, 5176, 5177, 5178],
	Django: [8000, 8001, 8002, 8003, 8004, 8005],
	'Java/Tomcat': [8080, 8081, 8082, 8083, 8084, 8085],
	Tauri: [1420, 1421, 1422, 1423, 1424, 1425],
	Storybook: [6006, 6007, 6008, 6009, 6010, 6011],
	Various: [7000, 7001, 7002, 7003, 7004, 7005, 9000, 9001, 9002, 9003, 9004, 9005],
} as const

export function getPortCategory(port: number): string {
	for (const [category, ports] of Object.entries(DEV_PORT_CATEGORIES)) {
		if ((ports as readonly number[]).includes(port)) {
			return category
		}
	}
	return 'Other'
}

export function isCommonDevPort(port: number): boolean {
	return Object.values(DEV_PORT_CATEGORIES).some(ports =>
		(ports as readonly number[]).includes(port)
	)
}
