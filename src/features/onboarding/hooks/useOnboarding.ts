import { useState, useEffect } from 'react'
import { useOnboardingStatus, useRegisterUser, useCurrentUser } from '@/api/services/auth-service'
import {
  checkOnboardingStatus,
  completeOnboarding,
  getCurrentUser,
  getDefaultPreferences
} from '../api/onboarding-api'
import type { OnboardingState, OnboardingData } from '../types/onboarding'

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    totalSteps: 3,
    data: {
      preferences: getDefaultPreferences()
    },
    isComplete: false,
    isLoading: true
  })

  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)

  // Use the new API hooks
  const registerUserMutation = useRegisterUser()

  // Check onboarding status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const isComplete = await checkOnboardingStatus()
        setNeedsOnboarding(!isComplete)
        setState(prev => ({ ...prev, isComplete, isLoading: false }))
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        setNeedsOnboarding(true)
        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to check setup status' }))
      }
    }

    checkStatus()
  }, [])

  const nextStep = (data: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
      data: { ...prev.data, ...data }
    }))
  }

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }))
  }

  const completeSetup = async () => {
    if (!state.data.username || !state.data.preferences) {
      throw new Error('Missing required onboarding data')
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      await completeOnboarding(state.data as OnboardingData)
      setState(prev => ({ ...prev, isComplete: true, isLoading: false }))
      setNeedsOnboarding(false)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete setup'
      }))
      throw error
    }
  }

  const resetOnboarding = () => {
    setState({
      currentStep: 0,
      totalSteps: 3,
      data: {
        preferences: getDefaultPreferences()
      },
      isComplete: false,
      isLoading: false
    })
  }

  return {
    ...state,
    needsOnboarding,
    nextStep,
    prevStep,
    completeSetup,
    resetOnboarding
  }
}

// Updated to use new API structure
export function useCurrentUser() {
  // Use the new API hook directly
  const { data: user, isLoading, refetch } = useCurrentUser()

  return {
    user: user ? {
      id: user.id,
      name: user.name,
      preferences: user.preferences
    } : null,
    isLoading,
    refetch
  }
}
