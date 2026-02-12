'use client'

import { ReactNode } from 'react'

interface ImagePlaceholderProps {
    width?: string | number
    height?: string | number
    className?: string
    children?: ReactNode
    variant?: 'shimmer' | 'pulse' | 'gradient'
}

export const ImagePlaceholder = ({
    width = '100%',
    height = '100%',
    className = '',
    children,
    variant = 'shimmer'
}: ImagePlaceholderProps) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'shimmer':
                return 'bg-gradient-to-r from-bg-surface via-bg-surface-active to-bg-surface bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]'
            case 'pulse':
                return 'bg-bg-surface animate-pulse'
            case 'gradient':
                return 'bg-gradient-to-br from-bg-surface to-bg-secondary'
            default:
                return 'bg-bg-surface'
        }
    }

    return (
        <div
            className={`
                relative overflow-hidden
                ${getVariantClasses()}
                ${className}
            `}
            style={{ width, height }}
        >
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    )
}

// Add shimmer keyframe animation to globals.css if not present
export const shimmerKeyframes = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`