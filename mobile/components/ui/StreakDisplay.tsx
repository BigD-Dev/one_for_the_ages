'use client'

interface StreakDisplayProps {
    streak: number
    variant?: 'default' | 'large' | 'compact'
    className?: string
}

export const StreakDisplay = ({
    streak,
    variant = 'default',
    className = '',
}: StreakDisplayProps) => {
    if (streak === 0) return null

    const sizeClass = variant === 'large' ? 'text-3xl' : variant === 'compact' ? 'text-lg' : 'text-2xl'

    return (
        <div className={`text-center ${className}`}>
            <div className="flex items-center justify-center gap-1">
                <span className={`${sizeClass} font-bold text-gold font-mono`}>
                    {streak}
                </span>
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
                Streak
            </div>
        </div>
    )
}
