import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, HardDrive } from 'lucide-react'
import { OnboardingDirectoryPicker } from '@/components/ui/directory-picker'
import type { OnboardingStepProps, UserPreferences } from '../../types/onboarding'

export function SettingsStep({ onNext, onBack, data, isLoading }: OnboardingStepProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(
    data.preferences || {
      theme: 'dark',
      mdxStoragePath: '~/.config/ryoe',
      storageType: 'turso',
      autoSave: true
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ preferences })
  }

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 text-center"
    >
      <div className="space-y-1">
        <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
          Configure Settings
        </h1>
        <p className="text-[1.25rem] text-white/50 font-light">
          Customize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MDX Storage Path */}
        <OnboardingDirectoryPicker
          label="MDX Files Location"
          value={preferences.mdxStoragePath}
          onChange={(path) => updatePreference('mdxStoragePath', path)}
          placeholder="~/.config/ryoe"
          disabled={isLoading}
        />

        {/* Storage Type Selection */}
        <div className="space-y-3">
          <label className="block text-white/80 text-sm font-medium text-left">
            Storage Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => updatePreference('storageType', 'turso')}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                preferences.storageType === 'turso'
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              <Database className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Turso Cloud</div>
              <div className="text-xs text-white/40">Sync across devices</div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => updatePreference('storageType', 'local')}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                preferences.storageType === 'local'
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              <HardDrive className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Local Storage</div>
              <div className="text-xs text-white/40">Stay offline</div>
            </motion.button>
          </div>
        </div>

        {/* Auto Save Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-left">
            <div className="text-white text-sm font-medium">Auto Save</div>
            <div className="text-white/40 text-xs">Automatically save changes</div>
          </div>
          <motion.button
            type="button"
            onClick={() => updatePreference('autoSave', !preferences.autoSave)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              preferences.autoSave ? 'bg-white' : 'bg-white/20'
            }`}
            disabled={isLoading}
          >
            <motion.div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
                preferences.autoSave ? 'bg-black left-7' : 'bg-white left-1'
              }`}
              animate={{ x: preferences.autoSave ? 0 : 0 }}
            />
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="rounded-full bg-white/10 text-white font-medium px-8 py-3 hover:bg-white/20 transition-colors border border-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            Back
          </motion.button>
          
          <motion.button
            type="submit"
            className="flex-1 rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
