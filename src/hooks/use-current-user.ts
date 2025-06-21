import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "@/services/user-service"
import type { TUserProfile } from "@/types"

export function useCurrentUser() {
    const { data: user, isLoading, error } = useQuery<TUserProfile | null>({
        queryKey: ['user', 'current'],
        queryFn: async () => {
            const result = await getCurrentUser()
            if (!result.success) {
                if (result.error === 'No user found') {
                    return null
                }
                throw new Error(result.error || 'Failed to fetch user profile')
            }
            return result.data!
        },
        retry: false,
    })

    return { user, isLoading, error }
}

/**
 * useCurrentUser
 *
 * Fetches the current user profile from the database.
 *
 * Returns:
 * - user (TUserProfile): The user profile object.
 * - isLoading (boolean): Whether the user profile is currently loading.
 * - error (Error): The error object if the user profile fails to load.
 *  
 * Example usage:
 * 
 * const {user,isLoading} = useCurrentUser()
 * const currentPreferences = editMode ? editedPreferences : user.preferences
 * 
 * return {user.name}
*/
