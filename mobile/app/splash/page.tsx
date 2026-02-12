'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Splash() {
    const router = useRouter()
    const [statusText, setStatusText] = useState('Initialising session')

    // Animation state
    const [logoVisible, setLogoVisible] = useState(false)
    const [subtitleVisible, setSubtitleVisible] = useState(false)

    useEffect(() => {
        // Animation Sequence
        // 1. Logo fades in at 300ms
        setTimeout(() => setLogoVisible(true), 300)

        // 2. Subtitle fades in at 700ms (400ms after logo)
        setTimeout(() => setSubtitleVisible(true), 700)

        // Logic Sequence
        const startTime = Date.now()

        // Timeout/Failsafe: Force redirect after 3s if nothing happens
        const timeoutId = setTimeout(() => {
            console.warn("Splash timeout reached, redirecting to welcome")
            router.push('/welcome')
        }, 3000)

        let unsubscribe: (() => void) | undefined

        // Core Init Logic
        const initSession = async () => {
            // Prevent immediate execution on server/hydration mismatch
            if (!auth) {
                // Fallback if auth isn't ready (shouldn't happen on client usually if configured right)
                return
            }

            unsubscribe = onAuthStateChanged(auth, async (user) => {
                const MIN_DURATION = 1500 // 1.5s minimum for the "Time Capsule" feel

                if (user) {
                    setStatusText('Syncing daily challenge')

                    // Here we would typically:
                    // 1. Validate JWT (user.getIdToken())
                    // 2. Preload profile
                    // For now, we simulate a quick network check
                    await new Promise(r => setTimeout(r, 600))

                    setStatusText('Restoring streak')
                }

                // Ensure strict minimum duration for tone
                const elapsed = Date.now() - startTime
                if (elapsed < MIN_DURATION) {
                    await new Promise(r => setTimeout(r, MIN_DURATION - elapsed))
                }

                // Clear timeout checks
                clearTimeout(timeoutId)

                // Route
                if (user) {
                    router.push('/')
                } else {
                    router.push('/welcome')
                }
            })
        }

        initSession()

        return () => {
            if (unsubscribe) unsubscribe()
            clearTimeout(timeoutId)
        }
    }, [router])

    return (
        <div className="relative min-h-screen w-full bg-canvas overflow-hidden flex flex-col items-center justify-center">

            {/* 1. Background Layer */}
            {/* Deep charcoal with subtle vignetted radial gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/40 pointer-events-none" />

            {/* Optional: Faint Noise Texture (Simulated via CSS) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* 2. Primary Logo */}
            <div className={`transition-all duration-1000 ease-out transform ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative z-10">
                    <img
                        src="/images/logo.png"
                        alt="One for the Ages"
                        className="h-80 md:h-[400px] w-auto"
                    />
                    {/* Subtle Glow backing */}
                    <span className="absolute inset-0 blur-3xl bg-primary/20 -z-10 bg-opacity-20 scale-150"></span>
                </div>
            </div>

            {/* 3. Subtitle */}
            <div className={`mt-6 transition-all duration-1000 ease-out delay-100 ${subtitleVisible ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="font-serif text-text-primary text-sm md:text-base tracking-widest">
                    One for the Ages
                </p>
            </div>

            {/* 4. Status Indicator (Bottom) */}
            <div className="absolute bottom-12 flex items-center gap-2">
                <p className="font-sans text-xs text-text-muted tracking-widest uppercase opacity-60">
                    {statusText}
                </p>
                {/* Pulsing Dot */}
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse-slow opacity-80" />
            </div>

        </div>
    )
}
