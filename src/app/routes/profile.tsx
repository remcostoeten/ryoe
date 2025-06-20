import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ErrorBoundary } from 'react-error-boundary'
import { Settings, LogOut, Database, HardDrive, Save, Trash2, AlertTriangle } from 'lucide-react'
import { DirectoryPicker } from '@/components/ui/directory-picker'
import { useCurrentUser } from '@/features/onboarding/hooks/useOnboarding'
import { updateUserPreferences } from '@/features/onboarding/api/onboarding-api'
import { resetAllData, validateReset } from '@/services/database-reset-service'
import type { UserPreferences } from '@/features/onboarding/types/onboarding'

function ProfilePageContent() {
	const { user, isLoading } = useCurrentUser()
	const [isUpdating, setIsUpdating] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [editedPreferences, setEditedPreferences] = useState<UserPreferences | null>(null)
	const [showResetConfirm, setShowResetConfirm] = useState(false)
	const [isResetting, setIsResetting] = useState(false)

	if (isLoading) {
		return (
			<div className='min-h-screen p-6 pt-20'>
				<div className='max-w-4xl mx-auto'>
					<div className='animate-pulse space-y-6'>
						<div className='h-8 bg-gray-700 rounded w-1/3'></div>
						<div className='h-64 bg-gray-700 rounded'></div>
					</div>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen p-6 pt-20'>
				<div className='max-w-4xl mx-auto text-center'>
					<h1 className='text-2xl font-bold text-gray-200 mb-4'>Profile Not Found</h1>
					<p className='text-gray-400'>
						Please complete onboarding to access your profile.
					</p>
				</div>
			</div>
		)
	}

	const handleEditToggle = () => {
		if (editMode) {
			setEditedPreferences(null)
		} else {
			setEditedPreferences({ ...user.preferences })
		}
		setEditMode(!editMode)
	}

	const handleSaveChanges = async () => {
		if (!editedPreferences) return

		setIsUpdating(true)
		try {
			await updateUserPreferences(editedPreferences)
			setEditMode(false)
			setEditedPreferences(null)
			// You might want to trigger a refetch here
		} catch (error) {
			console.error('Failed to update preferences:', error)
		} finally {
			setIsUpdating(false)
		}
	}

	const handleStorageTypeChange = async (storageType: 'local' | 'turso') => {
		if (editMode && editedPreferences) {
			setEditedPreferences({ ...editedPreferences, storageType })
		} else {
			setIsUpdating(true)
			try {
				await updateUserPreferences({ storageType })
			} catch (error) {
				console.error('Failed to update storage type:', error)
			} finally {
				setIsUpdating(false)
			}
		}
	}

	const currentPreferences = editMode ? editedPreferences : user.preferences

	const handleDatabaseReset = async () => {
		if (showResetConfirm) {
			setIsResetting(true)
			try {
				console.log('Starting database reset...')

				// Perform the reset
				const resetResult = await resetAllData()
				if (!resetResult.success) {
					throw new Error(resetResult.error || 'Failed to reset database')
				}

				// Validate the reset
				const validationResult = await validateReset()
				if (!validationResult.success || !validationResult.data) {
					console.warn('Reset validation failed, but continuing...')
				}

				console.log('Database reset successful, reloading app...')

				// Reload the page to restart the app
				setTimeout(() => {
					window.location.reload()
				}, 1000) // Small delay to show success message
			} catch (error) {
				console.error('Database reset failed:', error)
				alert('Failed to reset database. Please try again.')
				setIsResetting(false)
			}
			setShowResetConfirm(false)
		} else {
			setShowResetConfirm(true)
		}
	}

	const handleCancelReset = () => {
		setShowResetConfirm(false)
	}

	return (
		<div className='min-h-screen p-6 pt-20'>
			<div className='max-w-4xl mx-auto space-y-8'>
				{/* Header */}
				<div className='flex justify-between items-center'>
					<h1 className='text-3xl font-bold text-gray-200'>Profile Settings</h1>
					<div className='flex gap-2'>
						{editMode ? (
							<>
								<motion.button
									onClick={handleSaveChanges}
									disabled={isUpdating}
									className='flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Save className='w-4 h-4' />
									{isUpdating ? 'Saving...' : 'Save Changes'}
								</motion.button>
								<motion.button
									onClick={handleEditToggle}
									className='flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Cancel
								</motion.button>
							</>
						) : (
							<motion.button
								onClick={handleEditToggle}
								className='flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Settings className='w-4 h-4' />
								Edit Profile
							</motion.button>
						)}
					</div>
				</div>

				{/* Profile Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='bg-gray-900 border border-gray-700 rounded-lg p-6'
				>
					{/* User Info Section */}
					<div className='flex items-center gap-4 pb-6 border-b border-gray-700'>
						<div className='w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-medium'>
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<h2 className='text-xl font-semibold text-gray-200'>{user.name}</h2>
							<p className='text-gray-400'>User #{user.id}</p>
						</div>
					</div>

					{/* Settings Sections */}
					<div className='space-y-6 pt-6'>
						{/* Storage Type */}
						<div className='space-y-3'>
							<label className='block text-gray-300 text-sm font-medium'>
								Storage Type
							</label>
							<div className='grid grid-cols-2 gap-3 max-w-md'>
								<motion.button
									type='button'
									onClick={() => handleStorageTypeChange('turso')}
									disabled={isUpdating}
									className={`p-4 rounded-lg border transition-all duration-300 ${currentPreferences?.storageType === 'turso'
											? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
											: 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700'
										}`}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Database className='h-6 w-6 mx-auto mb-2' />
									<div className='text-sm font-medium'>Turso Cloud</div>
									<div className='text-xs text-gray-400'>Sync across devices</div>
								</motion.button>

								<motion.button
									type='button'
									onClick={() => handleStorageTypeChange('local')}
									disabled={isUpdating}
									className={`p-4 rounded-lg border transition-all duration-300 ${currentPreferences?.storageType === 'local'
											? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
											: 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700'
										}`}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<HardDrive className='h-6 w-6 mx-auto mb-2' />
									<div className='text-sm font-medium'>Local Storage</div>
									<div className='text-xs text-gray-400'>Stay offline</div>
								</motion.button>
							</div>
						</div>

						{/* MDX Storage Path */}
						<div className='space-y-3'>
							{editMode ? (
								<DirectoryPicker
									label='MDX Storage Path'
									value={editedPreferences?.mdxStoragePath || ''}
									onChange={path =>
										setEditedPreferences(prev =>
											prev
												? {
													...prev,
													mdxStoragePath: path,
												}
												: null
										)
									}
									placeholder='~/.config/ryoe'
									className='max-w-md'
								/>
							) : (
								<>
									<label className='block text-gray-300 text-sm font-medium'>
										MDX Storage Path
									</label>
									<div className='text-gray-400 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-600 font-mono max-w-md'>
										{currentPreferences?.mdxStoragePath}
									</div>
								</>
							)}
						</div>

						{/* Theme Setting */}
						<div className='space-y-3'>
							<label className='block text-gray-300 text-sm font-medium'>Theme</label>
							<div className='text-gray-400 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-600 max-w-md'>
								{currentPreferences?.theme || 'dark'} mode
							</div>
						</div>
					</div>

					{/* Danger Zone */}
					<div className='pt-6 mt-6 border-t border-gray-700'>
						<h3 className='text-lg font-medium text-gray-200 mb-4'>Danger Zone</h3>
						<div className='space-y-3'>
							{/* Database Reset Button */}
							<div className='p-4 border border-rose-400/30 rounded-lg bg-rose-500/5'>
								<div className='flex items-start gap-3 mb-3'>
									<AlertTriangle className='w-5 h-5 text-rose-400 mt-0.5' />
									<div>
										<h4 className='text-rose-400 font-medium'>
											Reset All Data
										</h4>
										<p className='text-gray-400 text-sm mt-1'>
											This will completely wipe all database tables and local
											storage. The onboarding flow will restart when you
											reload the app.
										</p>
									</div>
								</div>

								{showResetConfirm ? (
									<div className='flex gap-2'>
										<motion.button
											onClick={handleDatabaseReset}
											disabled={isResetting}
											className='flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50'
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<Trash2 className='w-4 h-4' />
											{isResetting ? 'Resetting...' : 'Confirm Reset'}
										</motion.button>
										<motion.button
											onClick={handleCancelReset}
											disabled={isResetting}
											className='flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Cancel
										</motion.button>
									</div>
								) : (
									<motion.button
										onClick={handleDatabaseReset}
										className='flex items-center gap-2 px-4 py-2 text-rose-400 border border-rose-400/30 rounded-lg hover:bg-rose-500/10 transition-colors'
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Trash2 className='w-4 h-4' />
										Reset All Data
									</motion.button>
								)}
							</div>

							{/* Legacy Reset Button */}
							<motion.button
								onClick={() => {
									if (
										confirm(
											'Are you sure you want to reset the app? This will clear all settings.'
										)
									) {
										localStorage.clear()
										window.location.reload()
									}
								}}
								className='flex items-center gap-2 px-4 py-2 text-rose-400 border border-rose-400/30 rounded-lg hover:bg-rose-500/10 transition-colors'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<LogOut className='w-4 h-4' />
								Reset Local Storage Only
							</motion.button>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}

function ErrorFallback({
	error,
	resetErrorBoundary,
}: {
	error: Error
	resetErrorBoundary: () => void
}) {
	return (
		<div className='min-h-screen p-6 pt-20'>
			<div className='max-w-4xl mx-auto text-center'>
				<h1 className='text-2xl font-bold text-gray-200 mb-4'>Profile Error</h1>
				<p className='text-gray-400 mb-4'>
					{error.message.includes('QueryClient')
						? 'React Query is not properly initialized. Please refresh the page.'
						: error.message}
				</p>
				<button
					onClick={resetErrorBoundary}
					className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
				>
					Try Again
				</button>
			</div>
		</div>
	)
}

export function ProfilePage() {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Suspense
				fallback={
					<div className='min-h-screen p-6 pt-20'>
						<div className='max-w-4xl mx-auto'>
							<div className='animate-pulse space-y-6'>
								<div className='h-8 bg-gray-700 rounded w-1/3'></div>
								<div className='h-64 bg-gray-700 rounded'></div>
							</div>
						</div>
					</div>
				}
			>
				<ProfilePageContent />
			</Suspense>
		</ErrorBoundary>
	)
}

export const Component = ProfilePage
