import { invoke } from '@tauri-apps/api/core'
import type { TPortScanResult, TPortInfo } from '@/types/port-manager'

export class PortManagerService {
  /**
   * Scan all listening ports on the system
   */
  static async scanPorts(): Promise<TPortScanResult> {
    try {
      const result = await invoke<TPortScanResult>('scan_ports')
      return result
    } catch (error) {
      console.error('Failed to scan ports:', error)
      throw new Error(`Port scan failed: ${error}`)
    }
  }

  /**
   * Kill a process running on a specific port
   */
  static async killPort(port: number): Promise<boolean> {
    try {
      const result = await invoke<boolean>('kill_port', { port })
      return result
    } catch (error) {
      console.error(`Failed to kill port ${port}:`, error)
      throw new Error(`Failed to kill port ${port}: ${error}`)
    }
  }

  /**
   * Get development ports only
   */
  static async getDevelopmentPorts(): Promise<TPortInfo[]> {
    const scanResult = await this.scanPorts()
    return scanResult.ports.filter(port => port.is_development)
  }

  /**
   * Group ports by process name
   */
  static groupPortsByProcess(ports: TPortInfo[]): Record<string, TPortInfo[]> {
    return ports.reduce((groups, port) => {
      const processName = port.process_name || 'Unknown'
      if (!groups[processName]) {
        groups[processName] = []
      }
      groups[processName].push(port)
      return groups
    }, {} as Record<string, TPortInfo[]>)
  }

  /**
   * Kill multiple ports
   */
  static async killMultiplePorts(ports: number[]): Promise<{ port: number; success: boolean; error?: string }[]> {
    const results: { port: number; success: boolean; error?: string }[] = []

    for (const port of ports) {
      try {
        const success = await this.killPort(port)
        results.push({ port, success })
      } catch (error) {
        results.push({
          port,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  /**
   * Check if a specific port is in use
   */
  static async isPortInUse(port: number): Promise<boolean> {
    const scanResult = await this.scanPorts()
    return scanResult.ports.some(p => p.port === port)
  }

  /**
   * Get port information for a specific port
   */
  static async getPortInfo(port: number): Promise<TPortInfo | null> {
    const scanResult = await this.scanPorts()
    return scanResult.ports.find(p => p.port === port) || null
  }

  /**
   * Get ports in a specific range
   */
  static async getPortsInRange(startPort: number, endPort: number): Promise<TPortInfo[]> {
    const scanResult = await this.scanPorts()
    return scanResult.ports.filter(port => port.port >= startPort && port.port <= endPort)
  }

  /**
   * Get common development ports that are currently in use
   */
  static async getActiveDevPorts(): Promise<TPortInfo[]> {
    const devPorts = await this.getDevelopmentPorts()
    return devPorts.filter(port => port.state === 'LISTEN' || port.state === 'LISTENING')
  }
}
