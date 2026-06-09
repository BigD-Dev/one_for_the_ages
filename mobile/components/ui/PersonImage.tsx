'use client'

import { useState, useEffect } from 'react'

interface PersonImageProps {
    name: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    rounded?: 'full' | 'sharp'
    className?: string
    imageUrl?: string | null
}

const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-full aspect-square text-6xl',
    full: 'w-full h-full text-6xl'
}

export const PersonImage = ({
    name,
    size = 'lg',
    rounded = 'full',
    className = '',
    imageUrl
}: PersonImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Reset load state whenever the URL changes (e.g. new question)
    useEffect(() => {
        setImageLoaded(false)
        setImageError(false)
    }, [imageUrl])

    const borderRadius = rounded === 'full' ? 'rounded-full' : 'rounded-sharp'
    const showImage = imageUrl && imageLoaded && !imageError

    return (
        <div className={`${sizeClasses[size]} ${borderRadius} overflow-hidden relative bg-surface border border-border-subtle ${className}`}>
            {/* Shimmer while loading */}
            {!showImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-white/5 to-surface animate-shimmer bg-[length:200%_100%]" />
            )}

            {imageUrl && !imageError && (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${showImage ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}

            {/* Fallback initials when no URL or error */}
            {(!imageUrl || imageError) && (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted/40 font-serif text-4xl">
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    )
}
