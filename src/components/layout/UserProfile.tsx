import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, Database, HardDrive, User, AlertTriangle, Trash2 } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useOnboarding'
import { logout, removeUserAndRestartOnboarding } from '@/services/user-service'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export function UserProfile() {
	const { user, isLoading } = useCurrentUser()
	const [showSettings, setShowSettings] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	if (isLoading || !user) {
		return (
			<div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30'>
				<div className='w-8 h-8 rounded-full bg-muted animate-pulse' />
				<div className='w-20 h-4 bg-muted rounded animate-pulse' />
			</div>
		)
	}

	const handleLogout = async () => {
		if (showLogoutConfirm) {
			setIsLoggingOut(true)
			try {
				const result = await removeUserAndRestartOnboarding()
				if (!result.success) {
					throw new Error(result.error || 'Failed to logout')
				}
				// The page will reload automatically
			} catch (error) {
				console.error('Failed to logout:', error)
				alert('Failed to logout. Please try again.')
				setIsLoggingOut(false)
			}
			setShowLogoutConfirm(false)
		} else {
			setShowLogoutConfirm(true)
		}
	}

	const handleCancelLogout = () => {
		setShowLogoutConfirm(false)
	}

	const handleSimpleLogout = async () => {
		setIsLoggingOut(true)
		try {
			const result = await logout()
			if (!result.success) {
				throw new Error(result.error || 'Failed to logout')
			}

			// Clear query cache
			queryClient.clear()

			// Navigate to onboarding
			navigate('/onboarding')
		} catch (error) {
			console.error('Failed to logout:', error)
			alert('Failed to logout. Please try again.')
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<div className='relative'>
			<motion.button
				onClick={() => setShowSettings(!showSettings)}
				className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-card/80 via-card/90 to-background/95 backdrop-blur-sm border border-border/30 text-foreground/90 hover:text-foreground hover:bg-card/90 transition-all duration-200 shadow-sm hover:shadow-md'
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				<div className='w-8 h-8 rounded-full bg-gradient-to-br from-foreground/90 to-foreground/70 flex items-center justify-center text-background text-sm font-medium shadow-sm'>
					{user.name.charAt(0).toUpperCase()}
				</div>
				<span className='text-sm font-medium'>{user.name}</span>
				<Settings className='w-4 h-4' />
			</motion.button>

			<AnimatePresence>
				{showSettings && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 z-40'
							onClick={() => setShowSettings(false)}
						/>

						{/* Settings Popover */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							className='absolute top-full right-0 mt-2 w-80 bg-gradient-to-br from-card/95 via-card/98 to-background/95 backdrop-blur-sm border border-border/40 rounded-xl shadow-xl z-50'
						>
							<div className='p-6 space-y-6'>
								{/* User Info */}
								<div className='flex items-center gap-3 pb-4 border-b border-border/30'>
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-foreground/90 to-foreground/70 flex items-center justify-center text-background text-lg font-medium shadow-sm'>
										{user.name.charAt(0).toUpperCase()}
									</div>
									<div>
										<div className='text-foreground/90 font-medium'>{user.name}</div>
										<div className='text-muted-foreground/70 text-sm'>User #{user.id}</div>
									</div>
								</div>

								{/* Storage Type */}
								<div className='space-y-3'>
									<label className='text-foreground/80 text-sm font-medium flex items-center gap-2'>
										<Database className='w-4 h-4' />
										Storage Type
									</label>
									<div className='grid grid-cols-2 gap-2'>
										<div className={`p-3 rounded-lg border transition-all duration-300 ${user.preferences.storageType === 'turso'
											? 'bg-gradient-to-br from-foreground/10 to-foreground/5 border-foreground/30 text-foreground/80'
											: 'bg-card/50 border-border/40 text-muted-foreground/60'
											}`}>
											<Database className='h-5 w-5 mx-auto mb-1' />
											<div className='text-xs'>Turso</div>
										</div>
										<div className={`p-3 rounded-lg border transition-all duration-300 ${user.preferences.storageType === 'local'
											? 'bg-gradient-to-br from-foreground/10 to-foreground/5 border-foreground/30 text-foreground/80'
											: 'bg-card/50 border-border/40 text-muted-foreground/60'
											}`}>
											<HardDrive className='h-5 w-5 mx-auto mb-1' />
											<div className='text-xs'>Local</div>
										</div>
									</div>
								</div>

								{/* MDX Path */}
								<div className='space-y-2'>
									<label className='text-foreground/80 text-sm font-medium'>
										Storage Path
									</label>
									<div className='text-muted-foreground/70 text-sm bg-card/50 p-2 rounded border border-border/30 font-mono'>
										{user.preferences.mdxStoragePath}
									</div>
								</div>

								{/* Actions */}
								<div className='pt-4 border-t border-border/30 space-y-2'>
									{/* Simple Logout */}
									<button
										onClick={handleSimpleLogout}
										disabled={isLoggingOut}
										className='flex items-center gap-2 w-full px-3 py-2 text-muted-foreground/80 hover:text-foreground hover:bg-card/50 rounded-lg transition-all duration-200'
									>
										<LogOut className='w-4 h-4' />
										<span className='text-sm'>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
									</button>

									{/* Reset App */}
									{showLogoutConfirm ? (
										<div className='p-3 border border-red-400/30 rounded-lg bg-red-500/5'>
											<div className='flex items-start gap-2 mb-3'>
												<AlertTriangle className='w-4 h-4 text-red-400 mt-0.5' />
												<div>
													<h4 className='text-red-400 font-medium text-sm'>
														Reset App
													</h4>
													<p className='text-muted-foreground/70 text-xs mt-1'>
														This will delete your user data and restart onboarding.
													</p>
												</div>
											</div>
											<div className='flex gap-2'>
												<button
													onClick={handleLogout}
													disabled={isLoggingOut}
													className='flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50'
												>
													<Trash2 className='w-3 h-3' />
													{isLoggingOut ? 'Resetting...' : 'Confirm Reset'}
												</button>
												<button
													onClick={handleCancelLogout}
													disabled={isLoggingOut}
													className='flex items-center gap-2 px-3 py-1.5 bg-card/50 text-muted-foreground/80 rounded text-xs hover:bg-card/80 transition-colors'
												>
													Cancel
												</button>
											</div>
										</div>
									) : (
										<button
											onClick={handleLogout}
											className='flex items-center gap-2 w-full px-3 py-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200'
										>
											<AlertTriangle className='w-4 h-4' />
											<span className='text-sm'>Reset App & Restart Onboarding</span>
										</button>
									)}
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	)
}
