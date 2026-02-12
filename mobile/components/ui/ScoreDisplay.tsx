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

export const ScoreDisplay = ({
    score,
    previousScore = 0,
    variant = 'default',
    showAnimation = true,
    className = '',
    label = 'Score'
}: ScoreDisplayProps) => {
    const [displayScore, setDisplayScore] = useState(previousScore)

    useEffect(() => {
        if (score !== displayScore && showAnimation) {
            const startScore = displayScore
            const difference = score - startScore
            const duration = Math.min(1000, Math.abs(difference) * 10)
            const startTime = Date.now()

            const animateScore = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                setDisplayScore(Math.round(startScore + difference * easeOutQuart))

                if (progress < 1) {
                    requestAnimationFrame(animateScore)
                }
            }

            requestAnimationFrame(animateScore)
        } else {
            setDisplayScore(score)
        }
    }, [score, displayScore, showAnimation])

    const sizeClass = variant === 'large' ? 'text-5xl' : variant === 'compact' ? 'text-xl' : 'text-3xl'

    return (
        <div className={`text-center ${className}`}>
            <div className={`${sizeClass} font-bold text-primary font-mono`}>
                {displayScore.toLocaleString()}
            </div>
            {label && (
                <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
                    {label}
                </div>
            )}
        </div>
    )
}
