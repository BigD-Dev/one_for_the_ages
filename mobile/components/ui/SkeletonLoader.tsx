'use client'

import { twMerge } from 'tailwind-merge'

interface SkeletonProps {
    className?: string
    width?: string | number
    height?: string | number
    rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export const Skeleton = ({ className = '', width, height, rounded = 'md' }: SkeletonProps) => {
    const roundedClasses = {
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-2xl',
        full: 'rounded-full',
    }

    return (
        <div
            className={twMerge('skeleton', roundedClasses[rounded], className)}
            style={{ width, height }}
        />
    )
}

// Pre-composed loading states for common patterns
export const GameLoadingSkeleton = () => (
    <div className="space-y-6 animate-fade-in-up">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
            <Skeleton width={60} height={36} />
            <div className="flex gap-4">
                <Skeleton width={80} height={36} />
                <Skeleton width={60} height={36} rounded="full" />
            </div>
        </div>

        {/* Progress bar */}
        <Skeleton width="100%" height={4} rounded="full" />

        {/* Celebrity card */}
        <div className="p-6 space-y-4">
            <div className="flex justify-center">
                <Skeleton width={128} height={128} rounded="full" />
            </div>
            <Skeleton width="60%" height={20} className="mx-auto" />
            <Skeleton width="80%" height={32} className="mx-auto" />
        </div>

        {/* Input area */}
        <Skeleton width="100%" height={64} rounded="lg" />
        <Skeleton width="100%" height={56} rounded="lg" />
    </div>
)
