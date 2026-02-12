import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    variant?: 'glass' | 'solid'
    className?: string
    onClick?: () => void
}

export const Card = ({ children, variant = 'glass', className = '', onClick }: CardProps) => {
    return (
        <div
            className={`
        rounded-2xl
        transition-all duration-300
        ${variant === 'glass' ? 'bg-bg-surface backdrop-blur-md border border-border-subtle' : 'bg-bg-secondary'}
        ${onClick ? 'active:scale-[0.98] active:border-border-active cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
