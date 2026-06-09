'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            const { setUser, registerUser, oftaUser } = useAuthStore.getState()
            if (firebaseUser) {
                // Always refresh the token so API calls work after page reload
                const token = await firebaseUser.getIdToken()
                apiClient.setToken(token)
                setUser(firebaseUser)
                if (!oftaUser) {
                    await registerUser(firebaseUser)
                }
            } else {
                setUser(null)
                apiClient.clearToken()
            }
        })
        return unsubscribe
    }, [])

    return <>{children}</>
}
