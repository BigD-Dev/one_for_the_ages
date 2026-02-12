'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { useAuthStore } from '@/store/useAuthStore'

export default function SplashScreen() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuthStore()

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLoading) {
                if (isAuthenticated) {
                    router.push('/')
                } else {
                    router.push('/welcome')
                }
            }
        }, 2500) // 2.5 second delay for splash screen

        return () => clearTimeout(timer)
    }, [router, isAuthenticated, isLoading])

    return (
        <AppShell className="flex items-center justify-center">
            <div className="text-center space-y-8 animate-fade-in-up">
                {/* Animated Logo */}
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-from to-primary-to bg-clip-text text-transparent animate-pulse">
                        OFTA
                    </h1>
                    <p className="text-sm text-text-muted font-medium tracking-wider uppercase animate-fade-in-up">
                        One for the Ages
                    </p>
                </div>

                {/* Animated Loading Line */}
                <div className="w-32 mx-auto">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent loading-line"></div>
                </div>
            </div>

            {/* Enhanced Background Effects */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
        </AppShell>
    )
}