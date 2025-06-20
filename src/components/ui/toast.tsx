'use client'

import { AlertCircle, Bell, CheckCircle, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'neutral'

type TToast = {
	id: string
	message: string
	type: ToastType
	duration?: number
	visible?: boolean
}

type TContextValue = {
	toasts: TToast[]
	addToast: (message: string, type: ToastType, duration?: number) => void
	removeToast: (id: string) => void
}

const ToastContext = createContext<TContextValue | null>(null)

function useToastContext() {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}

// Create a singleton for toast functions
let toastFns: {
	success: (message: string, duration?: number) => void
	error: (message: string, duration?: number) => void
	warning: (message: string, duration?: number) => void
	info: (message: string, duration?: number) => void
	neutral: (message: string, duration?: number) => void
} | null = null

// Hook to initialize toast functions
export function useInitializeToast() {
	const { addToast } = useToastContext()

	if (!toastFns) {
		toastFns = {
			success: (message: string, duration?: number) => addToast(message, 'success', duration),
			error: (message: string, duration?: number) => addToast(message, 'error', duration),
			warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
			info: (message: string, duration?: number) => addToast(message, 'info', duration),
			neutral: (message: string, duration?: number) => addToast(message, 'neutral', duration),
		}
	}
}

function ToastItem({
	toast,
	onRemove,
	index,
	isHovered,
}: {
	toast: TToast
	onRemove: () => void
	index: number
	total: number
	isHovered: boolean
}) {
	const [isExiting, setIsExiting] = useState(false)

	useEffect(() => {
		const duration = toast.duration || 5000
		const exitDelay = duration - 400 // Adjusted for new animation duration

		const exitTimer = setTimeout(() => {
			setIsExiting(true)
		}, exitDelay)

		const removeTimer = setTimeout(() => {
			onRemove()
		}, duration)

		return () => {
			clearTimeout(exitTimer)
			clearTimeout(removeTimer)
		}
	}, [toast.duration, onRemove])

	const icons = {
		success: <CheckCircle className='shrink-0 w-[18px] h-[18px] text-emerald-400' />,
		error: <AlertCircle className='shrink-0 w-[18px] h-[18px] text-red-400' />,
		warning: <AlertCircle className='shrink-0 w-[18px] h-[18px] text-amber-400' />,
		info: <Bell className='shrink-0 w-[18px] h-[18px] text-blue-400' />,
		neutral: <AlertCircle className='shrink-0 w-[18px] h-[18px] text-gray-400' />,
	}

	const backgrounds = {
		success: 'bg-emerald-500/[0.04] border-emerald-500/10',
		error: 'bg-red-500/[0.04] border-red-500/10',
		warning: 'bg-amber-500/[0.04] border-amber-500/10',
		info: 'bg-blue-500/[0.04] border-blue-500/10',
		neutral: 'bg-gray-500/[0.04] border-gray-500/10',
	}

	const glows = {
		success: 'before:bg-emerald-500/10',
		error: 'before:bg-red-500/10',
		warning: 'before:bg-amber-500/10',
		info: 'before:bg-blue-500/10',
		neutral: 'before:bg-gray-500/10',
	}

	// When hovered, spread toasts vertically with equal spacing
	// When not hovered, stack them with partial visibility
	const offsetY = isHovered ? index * 70 : index * 8 // Large vertical offset when hovered
	const scale = isHovered ? 1 : 1 - index * 0.05 // Full scale when hovered
	const opacity = isHovered ? 1 : 1 - index * 0.2 // Full opacity when hovered
	const zIndex = 50 - index

	return (
		<div
			className='absolute bottom-0 right-0 w-full transition-all duration-300 ease-out'
			style={{
				transform: `translateY(${-offsetY}px) scale(${scale})`,
				opacity: opacity,
				zIndex: zIndex,
			}}
		>
			<div
				className={`
					relative flex items-center justify-between gap-3 p-4 pr-2
					rounded-xl shadow-lg backdrop-blur-xl
					border border-white/[0.08]
					${backgrounds[toast.type]}
					${glows[toast.type]}
					before:absolute before:inset-0 before:rounded-xl before:blur-xl before:-z-10
					${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
					hover:translate-x-[-4px] hover:scale-[1.02]
					transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
				`}
				role='alert'
			>
				<div className='flex items-center gap-3 min-w-0'>
					{icons[toast.type]}
					<p className='text-[13px] leading-[1.35] font-medium text-white/90 tracking-[-0.1px]'>
						{toast.message}
					</p>
				</div>
				<button
					onClick={e => {
						e.stopPropagation()
						setIsExiting(true)
						setTimeout(onRemove, 400)
					}}
					className='shrink-0 rounded-full p-1.5 text-white/40 hover:text-white/90 hover:bg-background/[0.06] transition-all duration-200'
					aria-label='Close notification'
				>
					<X className='w-3.5 h-3.5' />
				</button>
			</div>
		</div>
	)
}

function ClientOnlyPortal({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return createPortal(children, document.body)
}

function ToastContainer({
	toasts,
	removeToast,
}: {
	toasts: TToast[]
	removeToast: (id: string) => void
}) {
	const [isHovered, setIsHovered] = useState(false)
	const maxVisibleToasts = 3 // Show only 3 toasts at a time in the stack
	const visibleToasts = toasts.slice(0, maxVisibleToasts)

	return (
		<ClientOnlyPortal>
			<div
				className='fixed bottom-6 right-6 z-50 min-w-[320px] max-w-[380px]'
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<div className='relative'>
					{visibleToasts.map((toast, index) => (
						<ToastItem
							key={toast.id}
							toast={toast}
							onRemove={() => removeToast(toast.id)}
							index={index}
							total={visibleToasts.length}
							isHovered={isHovered}
						/>
					))}
					{toasts.length > maxVisibleToasts && (
						<div className='absolute bottom-[-24px] right-0 text-xs text-white/50'>
							+{toasts.length - maxVisibleToasts} more
						</div>
					)}
				</div>
			</div>
		</ClientOnlyPortal>
	)
}

// Internal component to initialize toast functions
function ToastInitializer() {
	useInitializeToast()
	return null
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<TToast[]>([])
	const [isReady, setIsReady] = useState(false)

	// Set isReady to true after component mounts
	useEffect(() => {
		setIsReady(true)
	}, [])

	const addToast = useCallback(
		(message: string, type: ToastType = 'neutral', duration = 5000) => {
			const id = Math.random().toString(36).substring(2, 9)
			// Only update state if component is mounted
			if (isReady) {
				setToasts(prev => [...prev, { id, message, type, duration, visible: true }])
			} else {
				// If component isn't mounted yet, schedule the toast for the next tick
				setTimeout(() => {
					setToasts(prev => [...prev, { id, message, type, duration, visible: true }])
				}, 0)
			}
		},
		[isReady]
	)

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			<ToastInitializer />
			{children}
			<ToastContainer toasts={toasts} removeToast={removeToast} />
		</ToastContext.Provider>
	)
}

// Export the toast functions
export const toast = {
	success: (message: string, duration?: number) => {
		if (!toastFns) {
			console.error('Toast system not initialized')
			return
		}
		toastFns.success(message, duration)
	},
	error: (message: string, duration?: number) => {
		if (!toastFns) {
			console.error('Toast system not initialized')
			return
		}
		toastFns.error(message, duration)
	},
	warning: (message: string, duration?: number) => {
		if (!toastFns) {
			console.error('Toast system not initialized')
			return
		}
		toastFns.warning(message, duration)
	},
	info: (message: string, duration?: number) => {
		if (!toastFns) {
			console.error('Toast system not initialized')
			return
		}
		toastFns.info(message, duration)
	},
	neutral: (message: string, duration?: number) => {
		if (!toastFns) {
			console.error('Toast system not initialized')
			return
		}
		toastFns.neutral(message, duration)
	},
}
