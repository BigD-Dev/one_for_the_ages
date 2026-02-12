'use client'

import { useEffect, useState } from 'react'

interface ProgressRingProps {
    progress: number // 0-100
    size?: 'sm' | 'md' | 'lg' | 'xl'
    thickness?: number
    className?: string
    children?: React.ReactNode
    color?: 'primary' | 'success' | 'warning' | 'error'
    showPercentage?: boolean
    animated?: boolean
}

const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
}

const sizeValues = {
    sm: 48,
    md: 64,
    lg: 96,
    xl: 128
}

const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500'
}

export const ProgressRing = ({
    progress,
    size = 'md',
    thickness = 4,
    className = '',
    children,
    color = 'primary',
    showPercentage = false,
    animated = true
}: ProgressRingProps) => {
    const [animatedProgress, setAnimatedProgress] = useState(0)

    const sizeValue = sizeValues[size]
    const radius = (sizeValue - thickness * 2) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setAnimatedProgress(progress)
            }, 100)
            return () => clearTimeout(timer)
        } else {
            setAnimatedProgress(progress)
        }
    }, [progress, animated])

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <svg
                className="transform -rotate-90 w-full h-full"
                viewBox={`0 0 ${sizeValue} ${sizeValue}`}
            >
                {/* Background circle */}
                <circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    strokeWidth={thickness}
                    stroke="rgba(255, 255, 255, 0.1)"
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx={sizeValue / 2}
                    cy={sizeValue / 2}
                    r={radius}
                    strokeWidth={thickness}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
                    style={{
                        filter: 'drop-shadow(0 0 4px var(--primary-glow))'
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {children || (showPercentage && (
                    <span className="text-caption font-bold text-text-primary">
                        {Math.round(animatedProgress)}%
                    </span>
                ))}
            </div>
        </div>
    )
}