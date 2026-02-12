'use client'

import { ReactNode } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    className?: string
}

export const Card = ({ children, className = '', onClick, ...props }: CardProps) => {
    return (
        <div
            className={`bg-surface border border-border-subtle rounded-sharp ${onClick ? 'cursor-pointer active:opacity-80 transition-opacity duration-150' : ''} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    )
}
