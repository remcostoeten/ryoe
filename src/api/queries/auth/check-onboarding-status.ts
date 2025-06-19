import { checkOnboardingStatus } from '@/services/user-service'
import type { TServiceResult } from '@/services/types'

export async function checkOnboardingStatusQuery(): Promise<boolean> {
    const result = await checkOnboardingStatus()
    if (!result.success) {
        throw new Error(result.error || 'Failed to check onboarding status')
    }
    return result.data!
} 