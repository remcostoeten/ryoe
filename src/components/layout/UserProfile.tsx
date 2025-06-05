import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, Database, HardDrive } from 'lucide-react'
import { useCurrentUser } from '@/features/onboarding/hooks/useOnboarding'
import { updateUserPreferences } from '@/features/onboarding/api/onboarding-api'

export function UserProfile() {
  const { user, isLoading } = useCurrentUser()
  const [showSettings, setShowSettings] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  const handleStorageTypeChange = async (storageType: 'local' | 'turso') => {
    setIsUpdating(true)
    try {
      await updateUserPreferences({ storageType })
      // You might want to trigger a refetch here
    } catch (error) {
      console.error('Failed to update storage type:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-200 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <Settings className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />

            {/* Settings Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
            >
              <div className="p-4 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">User #{user.id}</div>
                  </div>
                </div>

                {/* Storage Type */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Storage Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStorageTypeChange('turso')}
                      disabled={isUpdating}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        user.preferences.storageType === 'turso'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <Database className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Turso</div>
                    </button>
                    <button
                      onClick={() => handleStorageTypeChange('local')}
                      disabled={isUpdating}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        user.preferences.storageType === 'local'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <HardDrive className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Local</div>
                    </button>
                  </div>
                </div>

                {/* MDX Path */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">MDX Storage Path</label>
                  <div className="text-gray-400 text-sm bg-gray-800/50 p-2 rounded border border-gray-600 font-mono">
                    {user.preferences.mdxStoragePath}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-700">
                  <button
                    onClick={() => {
                      // Handle logout/reset
                      if (confirm('Are you sure you want to reset the app? This will clear all settings.')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Reset App</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
