import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Square, Trash2, Info, ExternalLink, Activity, Zap, AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/utils'
import type { TPortInfo } from '@/types/port-manager'
import { getPortCategory } from '@/types/port-manager'

interface TPortCardProps {
	port: TPortInfo
	isSelected: boolean
	onToggleSelection: (port: number) => void
	onKillPort: (port: number) => Promise<{ success: boolean; error?: string }>
	className?: string
}

export function PortCard({
	port,
	isSelected,
	onToggleSelection,
	onKillPort,
	className,
}: TPortCardProps) {
	const [isKilling, setIsKilling] = useState(false)
	const [lastAction, setLastAction] = useState<{
		success: boolean
		error?: string
	} | null>(null)

	const handleKillPort = async () => {
		setIsKilling(true)
		setLastAction(null)

		try {
			const result = await onKillPort(port.port)
			setLastAction(result)
		} catch (error) {
			setLastAction({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setIsKilling(false)
		}
	}

	const openInBrowser = () => {
		window.open(`http://localhost:${port.port}`, '_blank')
	}

	const category = getPortCategory(port.port)
	const isActive = port.state === 'LISTEN' || port.state === 'LISTENING'

	return (
		<Card
			className={cn(
				'transition-all duration-200 hover:shadow-md',
				isSelected && 'ring-2 ring-primary',
				!isActive && 'opacity-60',
				className
			)}
		>
			<CardHeader className='pb-3'>
				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-3'>
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onToggleSelection(port.port)}
						/>
						<div>
							<CardTitle className='text-lg font-mono'>:{port.port}</CardTitle>
							<div className='flex items-center gap-2 mt-1'>
								<Badge
									variant={isActive ? 'default' : 'secondary'}
									className='text-xs'
								>
									{port.state}
								</Badge>
								{port.is_development && (
									<Badge variant='outline' className='text-xs'>
										DEV
									</Badge>
								)}
								<Badge variant='secondary' className='text-xs'>
									{category}
								</Badge>
							</div>
						</div>
					</div>

					<div className='flex items-center gap-1'>
						{isActive ? (
							<Activity className='h-4 w-4 text-green-500' />
						) : (
							<Square className='h-4 w-4 text-gray-400' />
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className='pt-0'>
				<div className='space-y-3'>
					{/* Process Information */}
					{port.process_name && (
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<Zap className='h-3 w-3' />
							<span className='font-mono'>{port.process_name}</span>
							{port.pid && (
								<Badge variant='outline' className='text-xs'>
									PID: {port.pid}
								</Badge>
							)}
						</div>
					)}

					{/* Address Information */}
					<div className='text-xs text-muted-foreground space-y-1'>
						<div className='flex items-center gap-2'>
							<span className='font-medium'>Local:</span>
							<span className='font-mono'>{port.local_address}</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='font-medium'>Protocol:</span>
							<span className='font-mono'>{port.protocol}</span>
						</div>
					</div>

					{/* Action Result */}
					{lastAction && (
						<div
							className={cn(
								'text-xs p-2 rounded-md flex items-center gap-2',
								lastAction.success
									? 'bg-green-50 text-green-700 border border-green-200'
									: 'bg-red-50 text-red-700 border border-red-200'
							)}
						>
							{lastAction.success ? (
								<>
									<Activity className='h-3 w-3' />
									Port killed successfully
								</>
							) : (
								<>
									<AlertTriangle className='h-3 w-3' />
									{lastAction.error || 'Failed to kill port'}
								</>
							)}
						</div>
					)}

					{/* Actions */}
					<div className='flex items-center gap-2 pt-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={openInBrowser}
							disabled={!isActive}
							className='flex-1'
						>
							<ExternalLink className='h-3 w-3 mr-1' />
							Open
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								/* TODO: Show port details */
							}}
							className='flex-1'
						>
							<Info className='h-3 w-3 mr-1' />
							Info
						</Button>

						<Button
							variant='destructive'
							size='sm'
							onClick={handleKillPort}
							disabled={isKilling || !isActive}
							className='flex-1'
						>
							{isKilling ? (
								<div className='h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1' />
							) : (
								<Trash2 className='h-3 w-3 mr-1' />
							)}
							Kill
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
