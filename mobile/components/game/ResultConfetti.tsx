'use client'

import React, { useEffect } from 'react'

interface ConfettiProps {
    isActive: boolean
}

/**
 * Fires a celebratory confetti burst when isActive becomes true.
 * Uses canvas-confetti when available; silently no-ops otherwise.
 * Respects the user's prefers-reduced-motion setting via disableForReducedMotion.
 */
export const ResultConfetti = ({ isActive }: ConfettiProps) => {
    useEffect(() => {
        if (!isActive) return

        // Dynamically import canvas-confetti so the component degrades
        // gracefully if the package is absent or the import fails.
        import('canvas-confetti')
            .then((module) => {
                const confetti = module.default

                const count = 100
                const defaults = {
                    origin: { y: 0.6 },
                    colors: ['#1E7A8C', '#C9A227', '#F2F2F2', '#7B2CBF'],
                    disableForReducedMotion: true,
                    scalar: 0.8,
                    drift: 0.5,
                    ticks: 150,
                }

                function fire(particleRatio: number, opts: Record<string, unknown>) {
                    confetti({
                        ...defaults,
                        ...opts,
                        particleCount: Math.floor(count * particleRatio),
                    })
                }

                fire(0.25, { spread: 26, startVelocity: 55 })
                fire(0.2,  { spread: 60 })
                fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
                fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
                fire(0.1,  { spread: 120, startVelocity: 45 })
            })
            .catch(() => {
                // canvas-confetti unavailable — fail silently, no visual effect
            })
    }, [isActive])

    return null // canvas-confetti attaches directly to the document canvas
}
