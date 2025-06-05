export interface UserPreferences {
  theme: 'dark' | 'light'
  mdxStoragePath: string
  storageType: 'local' | 'turso'
  autoSave: boolean
  backupPath?: string
}

export interface OnboardingData {
  username: string
  preferences: UserPreferences
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  data: Partial<OnboardingData>
  isComplete: boolean
  isLoading: boolean
  error?: string
}

export type OnboardingStep = 'welcome' | 'settings' | 'completion'

export interface OnboardingStepProps {
  onNext: (data: Partial<OnboardingData>) => void
  onBack?: () => void
  data: Partial<OnboardingData>
  isLoading?: boolean
}
