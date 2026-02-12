'use client'

import { useEffect, useState } from 'react'

interface ScoreDisplayProps {
    score: number
    previousScore?: number
    variant?: 'default' | 'large' | 'compact'
    showAnimation?: boolean
    className?: string
    label?: string
}

const variantClasses = {
    default: {
        score: 'text-title',
        label: 'text-caption'
    },
    large: {
        score: 'text-headline',
        label: 'text-body'
    },
    compact: {
        score: 'text-body-large',
        label: 'text-overline'
    }
}

export const ScoreDisplay = ({
    score,
    previousScore = 0,
    variant = 'default',
    showAnimation = true,
    className = '',
    label = 'Score'
}: ScoreDisplayProps) => {
    const [displayScore, setDisplayScore] = useState(previousScore)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (score !== displayScore && showAnimation) {
            setIsAnimating(true)

            // Animate the score counting up
            const startScore = displayScore
            const difference = score - startScore
            const duration = Math.min(1000, Math.abs(difference) * 10) // Cap at 1 second
            const startTime = Date.now()

            const animateScore = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                const currentScore = Math.round(startScore + difference * easeOutQuart)

                setDisplayScore(currentScore)

                if (progress < 1) {
                    requestAnimationFrame(animateScore)
                } else {
                    setIsAnimating(false)
                }
            }

            requestAnimationFrame(animateScore)
        } else {
            setDisplayScore(score)
        }
    }, [score, displayScore, showAnimation])

    const classes = variantClasses[variant]

    return (
        <div className={`text-center ${className}`}>
            <div
                className={`
                    ${classes.score} font-bold text-primary
                    ${isAnimating ? 'text-glow' : ''}
                    transition-all duration-300
                `}
            >
                {displayScore.toLocaleString()}
                {score > previousScore && isAnimating && (
                    <span className="text-green-400 ml-1 animate-fade-in-up">
                        +{(score - previousScore).toLocaleString()}
                    </span>
                )}
            </div>
            {label && (
                <div className={`${classes.label} text-text-secondary uppercase tracking-wider`}>
                    {label}
                </div>
            )}
        </div>
    )
}