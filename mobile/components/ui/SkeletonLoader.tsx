'use client'

interface SkeletonProps {
    className?: string
    width?: string | number
    height?: string | number
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
    return (
        <div
            className={`skeleton rounded-sharp ${className}`}
            style={{ width, height }}
        />
    )
}

export const GameLoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton width={60} height={36} />
            <Skeleton width={80} height={36} />
        </div>
        <Skeleton width="100%" height={4} />
        <div className="p-6 space-y-4">
            <div className="flex justify-center">
                <Skeleton width={128} height={128} className="rounded-full" />
            </div>
            <Skeleton width="60%" height={20} className="mx-auto" />
            <Skeleton width="80%" height={32} className="mx-auto" />
        </div>
        <Skeleton width="100%" height={64} />
        <Skeleton width="100%" height={56} />
    </div>
)
