'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ArtifactCardProps {
    year?: string
    title: string
    subtitle?: string
    icon?: React.ReactNode
    variant?: 'hero' | 'standard' | 'wide'
    href: string
    className?: string
}

export const ArtifactCard = ({
    year,
    title,
    subtitle,
    icon,
    variant = 'standard',
    href,
    className = ''
}: ArtifactCardProps) => {
    const [isPressed, setIsPressed] = useState(false)

    // Interaction: "Do NOT scale or bounce. simply fade the opacity to 0.8 over 150ms."
    const interactionStyle = {
        opacity: isPressed ? 0.8 : 1,
        transition: 'opacity 150ms ease-out',
    }

    // Visuals: "Surface background, very subtle gold border (opacity 20%)."
    const baseClasses = `
    relative overflow-hidden bg-surface border border-gold/20 rounded-sharp p-6 
    flex flex-col justify-between group
    ${variant === 'hero' ? 'aspect-[4/3]' : ''}
    ${variant === 'standard' ? 'aspect-square' : ''}
    ${variant === 'wide' ? 'aspect-[3/1]' : ''}
    ${className}
  `

    return (
        <Link
            href={href}
            className={baseClasses}
            style={interactionStyle}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            <div className="flex justify-between items-start">
                {/* Icon or Year Badge */}
                {year && (
                    <span className="font-serif text-gold text-lg tracking-wider opacity-80">
                        {year}
                    </span>
                )}
                {icon && (
                    <div className="text-text-muted group-hover:text-gold transition-colors duration-300">
                        {icon}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                {/* Typography: Use Fraunces for Display/Titles */}
                <h3 className="font-serif text-text-primary text-xl leading-snug">
                    {title}
                </h3>

                {/* Typography: Use Inter for UI/Data/Subtitle */}
                {subtitle && (
                    <p className="font-sans text-text-muted text-sm tracking-wide">
                        {subtitle}
                    </p>
                )}
            </div>
        </Link>
    )
}
