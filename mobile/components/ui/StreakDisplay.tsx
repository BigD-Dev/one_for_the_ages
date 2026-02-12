'use client'

import { useEffect, useState } from 'react'

interface StreakDisplayProps {
    streak: number
    previousStreak?: number
    variant?: 'default' | 'large' | 'compact'
    showAnimation?: boolean
    className?: string
    maxDisplayed?: number
}

const variantClasses = {
    default: {
        number: 'text-title',
        label: 'text-caption',
        fire: 'text-lg'
    },
    large: {
        number: 'text-headline',
        label: 'text-body',
        fire: 'text-2xl'
    },
    compact: {
        number: 'text-body-large',
        label: 'text-overline',
        fire: 'text-base'
    }
}

const getStreakColor = (streak: number) => {
    if (streak >= 10) return 'text-purple-400' // Epic streak
    if (streak >= 5) return 'text-orange-400'  // Good streak
    if (streak >= 3) return 'text-yellow-400'  // Starting streak
    return 'text-orange-400' // Default fire color
}

const getFireEmoji = (streak: number, maxDisplayed?: number) => {
    if (maxDisplayed && streak > maxDisplayed) {
        return '🔥'.repeat(maxDisplayed) + '+'
    }
    if (streak >= 15) return '🔥🔥🔥💜'
    if (streak >= 10) return '🔥🔥🔥'
    if (streak >= 5) return '🔥🔥'
    return '🔥'
}

export const StreakDisplay = ({
    streak,
    previousStreak = 0,
    variant = 'default',
    showAnimation = true,
    className = '',
    maxDisplayed = 3
}: StreakDisplayProps) => {
    const [displayStreak, setDisplayStreak] = useState(previousStreak)
    const [isAnimating, setIsAnimating] = useState(false)
    const [justIncreased, setJustIncreased] = useState(false)

    useEffect(() => {
        if (streak !== displayStreak) {
            if (showAnimation && streak > displayStreak) {
                setIsAnimating(true)
                setJustIncreased(true)

                const timer = setTimeout(() => {
                    setDisplayStreak(streak)
                    setTimeout(() => {
                        setIsAnimating(false)
                        setJustIncreased(false)
                    }, 300)
                }, 100)

                return () => clearTimeout(timer)
            } else {
                setDisplayStreak(streak)
                setJustIncreased(false)
            }
        }
    }, [streak, displayStreak, showAnimation])

    const classes = variantClasses[variant]
    const streakColor = getStreakColor(displayStreak)
    const fireEmoji = getFireEmoji(displayStreak, maxDisplayed)

    if (displayStreak === 0) {
        return null
    }

    return (
        <div className={`text-center ${className}`}>
            <div
                className={`
                    flex items-center justify-center gap-1
                    ${justIncreased ? 'animate-pulse scale-110' : ''}
                    transition-all duration-300
                `}
            >
                <span className={`${classes.number} font-bold ${streakColor}`}>
                    {displayStreak}
                </span>
                <span
                    className={`
                        ${classes.fire}
                        ${isAnimating ? 'animate-bounce' : ''}
                        transition-all duration-300
                    `}
                    style={{
                        filter: justIncreased ? 'drop-shadow(0 0 8px orange)' : 'none'
                    }}
                >
                    {fireEmoji}
                </span>
            </div>
            <div className={`${classes.label} text-text-secondary uppercase tracking-wider`}>
                Streak
            </div>
        </div>
    )
}