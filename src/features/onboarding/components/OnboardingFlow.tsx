import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router'
import { OnboardingLayout, OnboardingProgress } from './OnboardingLayout'
import { WelcomeStep } from './steps/WelcomeStep'
import { SettingsStep } from './steps/SettingsStep'
import { CompletionStep } from './steps/CompletionStep'
import { useOnboarding } from '../hooks/useOnboarding'

export function OnboardingFlow() {
  const navigate = useNavigate()
  const {
    currentStep,
    totalSteps,
    data,
    isLoading,
    error,
    nextStep,
    prevStep,
    completeSetup
  } = useOnboarding()

  const handleComplete = async () => {
    try {
      await completeSetup()
      // Redirect to main app
      navigate('/')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep
            onNext={nextStep}
            data={data}
            isLoading={isLoading}
          />
        )
      case 1:
        return (
          <SettingsStep
            onNext={nextStep}
            onBack={prevStep}
            data={data}
            isLoading={isLoading}
          />
        )
      case 2:
        return (
          <CompletionStep
            onNext={nextStep}
            onBack={prevStep}
            data={data}
            isLoading={isLoading}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <OnboardingLayout showCanvas={false}>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Setup Error</h1>
          <p className="text-white/60">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout>
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </OnboardingLayout>
  )
}
