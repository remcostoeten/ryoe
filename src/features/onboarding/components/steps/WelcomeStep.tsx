import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import type { OnboardingStepProps } from '../../types/onboarding'

export function WelcomeStep({ onNext, data, isLoading }: OnboardingStepProps) {
  const [username, setUsername] = useState(data.username || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onNext({ username: username.trim() })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 text-center"
    >
      <div className="space-y-1">
        <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
          Welcome to Ryoe
        </h1>
        <p className="text-[1.8rem] text-white/70 font-light">
          Let's get you set up
        </p>
      </div>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border focus:border-white/30 text-center"
              required
              disabled={isLoading}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!username.trim() || isLoading}
            className={`w-full rounded-full font-medium py-3 transition-all duration-300 ${
              username.trim() && !isLoading
                ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                : 'bg-white/10 text-white/50 border border-white/10 cursor-not-allowed'
            }`}
            whileHover={username.trim() && !isLoading ? { scale: 1.02 } : {}}
            whileTap={username.trim() && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? 'Setting up...' : 'Continue'}
          </motion.button>
        </form>
      </div>

      <p className="text-xs text-white/40 pt-10">
        Choose a username that you'll be comfortable with. 
        <br />
        You can always change it later in settings.
      </p>
    </motion.div>
  )
}
