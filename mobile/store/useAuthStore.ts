// store/useAuthStore.ts
/**
 * Auth state management with Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from 'firebase/auth'
import { apiClient } from '@/lib/api-client'
import { getIdToken } from '@/lib/firebase'

interface AuthState {
    user: User | null
    oftaUser: any | null
    isAuthenticated: boolean
    isLoading: boolean

    setUser: (user: User | null) => void
    setOftaUser: (oftaUser: any) => void
    registerUser: (firebaseUser: User) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            oftaUser: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => {
                set({ user, isAuthenticated: !!user, isLoading: false })

                // Set API token
                if (user) {
                    getIdToken().then((token) => {
                        if (token) apiClient.setToken(token)
                    })
                } else {
                    apiClient.clearToken()
                }
            },

            setOftaUser: (oftaUser) => {
                set({ oftaUser })
            },

            registerUser: async (firebaseUser) => {
                try {
                    const token = await firebaseUser.getIdToken()
                    apiClient.setToken(token)

                    const oftaUser = await apiClient.register({
                        firebase_uid: firebaseUser.uid,
                        display_name: firebaseUser.displayName || undefined,
                        email: firebaseUser.email || undefined,
                        auth_provider: firebaseUser.isAnonymous ? 'anonymous' : 'email',
                    })

                    set({ oftaUser })
                } catch (error) {
                    console.error('Failed to register user:', error)
                }
            },

            logout: () => {
                set({ user: null, oftaUser: null, isAuthenticated: false })
                apiClient.clearToken()
            },
        }),
        {
            name: 'ofta-auth',
            partialize: (state) => ({
                oftaUser: state.oftaUser,
            }),
        }
    )
)
