'use client'

import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
    isActive: boolean
}

export const ResultConfetti = ({ isActive }: ConfettiProps) => {
    useEffect(() => {
        if (isActive) {
            const count = 100;
            const defaults = {
                origin: { y: 0.6 },
                colors: ['#1E7A8C', '#C9A227', '#F2F2F2', '#7B2CBF'],
                disableForReducedMotion: true,
                scalar: 0.8, // Smaller particles
                drift: 0.5,
                ticks: 150 // Fade slightly faster
            };

            function fire(particleRatio: number, opts: any) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });

            fire(0.2, {
                spread: 60,
            });

            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });

            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });

            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        }
    }, [isActive])

    return null // canvas-confetti attaches to document
}
