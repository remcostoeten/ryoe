import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import type { OnboardingStepProps } from '../../types/onboarding'

interface CompletionStepProps extends OnboardingStepProps {
  onComplete: () => void
}

export function CompletionStep({ data, isLoading, onComplete }: CompletionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
      className="space-y-6 text-center"
    >
      <div className="space-y-1">
        <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
          You're all set!
        </h1>
        <p className="text-[1.25rem] text-white/50 font-light">
          Welcome to Ryoe, {data.username}
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="py-10"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Setup Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10"
      >
        <div className="text-white/80 text-sm font-medium">Setup Summary</div>
        <div className="space-y-2 text-xs text-white/60">
          <div className="flex justify-between">
            <span>Username:</span>
            <span className="text-white">{data.username}</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-white capitalize">{data.preferences?.storageType}</span>
          </div>
          <div className="flex justify-between">
            <span>MDX Path:</span>
            <span className="text-white">{data.preferences?.mdxStoragePath}</span>
          </div>
          <div className="flex justify-between">
            <span>Auto Save:</span>
            <span className="text-white">{data.preferences?.autoSave ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onComplete}
        disabled={isLoading}
        className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/25"
      >
        {isLoading ? 'Finalizing setup...' : 'Enter Ryoe'}
      </motion.button>
    </motion.div>
  )
}
