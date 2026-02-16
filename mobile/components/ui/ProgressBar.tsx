'use client'

interface ProgressBarProps {
    value: number
    max: number
    color?: string
}

export function ProgressBar({ value, max, color = 'bg-primary' }: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
        <div className="w-full bg-surface-raised h-2 rounded-full overflow-hidden border border-border-subtle">
            <div
                className={`h-full ${color} transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}
