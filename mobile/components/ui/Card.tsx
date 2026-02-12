import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    variant?: 'glass' | 'solid' | 'elevated' | 'interactive' | 'hero' | 'game'
    className?: string
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export const Card = ({ children, variant = 'glass', className = '', onClick, onMouseEnter, onMouseLeave }: CardProps) => {
    const baseClasses = 'rounded-2xl transition-all duration-300'

    const variantClasses = {
        glass: 'bg-bg-surface backdrop-blur-md border border-border-subtle',
        solid: 'bg-bg-secondary',
        elevated: `
            bg-bg-surface backdrop-blur-md border border-border-subtle
            shadow-lg shadow-black/20
            hover:shadow-xl hover:shadow-black/30
            hover:bg-bg-surface-active
        `,
        interactive: `
            bg-bg-surface backdrop-blur-md border border-border-subtle
            shadow-md shadow-black/10
            hover:shadow-lg hover:shadow-black/20
            hover:bg-bg-surface-active hover:border-border-active
            active:scale-[0.98] active:shadow-sm
            cursor-pointer
        `,
        hero: `
            bg-gradient-to-br from-bg-surface to-bg-secondary
            backdrop-blur-md border border-border-subtle
            shadow-2xl shadow-black/40
            overflow-hidden
        `,
        game: `
            bg-bg-surface backdrop-blur-md border border-border-subtle
            shadow-lg shadow-black/20
            border-l-4 border-l-primary
            hover:border-l-primary/80
        `
    }

    const interactiveClasses = onClick && variant !== 'interactive'
        ? 'active:scale-[0.98] active:border-border-active cursor-pointer'
        : ''

    return (
        <div
            className={`
                ${baseClasses}
                ${variantClasses[variant]}
                ${interactiveClasses}
                ${className}
            `}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>
    )
}
