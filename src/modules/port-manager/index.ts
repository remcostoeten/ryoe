// Components
export { PortManager } from './components/port-manager'
export { PortCard } from './components/port-card'
export { PortManagerDropdown } from './components/port-manager-dropdown'
export { PortManagerTray } from './components/port-manager-tray'

// Hooks
export { usePortManager } from './hooks/use-port-manager'

// Re-export types
export type {
  TPortInfo,
  TPortScanResult,
  TPortManagerState,
  TPortManagerConfig,
  TPortAction,
  TPortStatus,
  TPortGroup
} from '@/types/port-manager'

export { 
  DEV_PORT_CATEGORIES,
  getPortCategory,
  isCommonDevPort
} from '@/types/port-manager'
