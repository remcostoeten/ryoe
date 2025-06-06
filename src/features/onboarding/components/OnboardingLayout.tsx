import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utilities'
import { SimpleCanvasEffect } from '@/components/ui/SimpleCanvasEffect'

interface OnboardingLayoutProps {
  children: ReactNode
  className?: string
  showCanvas?: boolean
  canvasReverse?: boolean
}

export function OnboardingLayout({ 
  children, 
  className,
  showCanvas = true,
  // canvasReverse = false
}: OnboardingLayoutProps) {
  return (
    <div className={cn(
      'flex w-full flex-col min-h-screen bg-black relative',
      className
    )}>
      {/* Background Canvas Effect */}
      {showCanvas && (
        <div className="absolute inset-0 z-0">
          <SimpleCanvasEffect
            dotSize={6}
            animationSpeed={3}
            colorful={true}
          />
          {/* Enhanced gradient circle effect - more dimmed in the middle */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.95)_0%,_rgba(0,0,0,0.7)_30%,_rgba(0,0,0,0.4)_60%,_transparent_100%)]" />
          {/* Additional subtle green tint overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,40,34,0.3)_0%,_transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[150px] max-w-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function OnboardingProgress({ currentStep, totalSteps, className }: OnboardingProgressProps) {
  return (
    <div className={cn('flex items-center justify-center space-x-2 mb-8', className)}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <motion.div
          key={index}
          className={cn(
            'w-2 h-2 rounded-full transition-colors duration-300',
            index <= currentStep
              ? 'bg-gradient-to-r from-emerald-400 to-slate-500'
              : 'bg-white/20'
          )}
          initial={{ scale: 0.8 }}
          animate={{
            scale: index === currentStep ? 1.2 : 1,
            background: index <= currentStep
              ? 'linear-gradient(to right, #34d399, #64748b)'
              : 'rgba(255, 255, 255, 0.2)'
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  )
}
