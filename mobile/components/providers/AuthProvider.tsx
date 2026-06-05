'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            const { setUser, registerUser, oftaUser } = useAuthStore.getState()
            if (firebaseUser) {
                setUser(firebaseUser)
                if (!oftaUser) {
                    await registerUser(firebaseUser)
                }
            } else {
                setUser(null)
            }
        })
        return unsubscribe
    }, [])

    return <>{children}</>
}
