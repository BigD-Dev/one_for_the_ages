'use client'

import { useState } from 'react'

interface CelebrityImageProps {
    name: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    imageUrl?: string | null // For future when backend provides images
}

const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-4xl'
}

// Generate consistent color based on name
const getColorFromName = (name: string): string => {
    const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500',
        'from-indigo-500 to-purple-500',
        'from-pink-500 to-rose-500',
        'from-teal-500 to-blue-500',
        'from-yellow-500 to-orange-500'
    ]

    const hash = name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
    }, 0)

    return colors[Math.abs(hash) % colors.length]
}

// Extract initials from full name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .slice(0, 2) // Take first 2 initials
        .join('')
        .toUpperCase()
}

export const CelebrityImage = ({
    name,
    size = 'lg',
    className = '',
    imageUrl
}: CelebrityImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const initials = getInitials(name)
    const gradientClass = getColorFromName(name)

    // If image URL provided and loaded successfully
    if (imageUrl && imageLoaded && !imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-border-subtle ${className}`}>
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            </div>
        )
    }

    // Default to generated avatar
    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-white shadow-lg border border-border-subtle ${className}`}
            style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}
        >
            {initials}

            {/* Optional: Hidden img tag to attempt loading */}
            {imageUrl && !imageLoaded && !imageError && (
                <img
                    src={imageUrl}
                    alt={name}
                    className="hidden"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}
        </div>
    )
}