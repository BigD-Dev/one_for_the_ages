'use client'

import React, { useEffect, useState } from 'react'

interface AnimatedCounterProps {
    value: number
    previousValue?: number
    duration?: number
    className?: string
}

export const AnimatedCounter = ({ value, previousValue = 0, duration = 800, className = '' }: AnimatedCounterProps) => {
    const [displayValue, setDisplayValue] = useState(previousValue)

    useEffect(() => {
        let startTime: number
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = timestamp - startTime

            if (progress < duration) {
                // Ease out quart
                const ease = 1 - Math.pow(1 - progress / duration, 4)
                const current = Math.floor(previousValue + (value - previousValue) * ease)
                setDisplayValue(current)
                animationFrame = requestAnimationFrame(animate)
            } else {
                setDisplayValue(value)
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrame)
    }, [value, previousValue, duration])

    return <span className={className}>{displayValue}</span>
}
