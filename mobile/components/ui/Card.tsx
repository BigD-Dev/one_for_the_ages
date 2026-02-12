'use client'

import { ReactNode } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    className?: string
}

export const Card = ({ children, className = '', onClick, ...props }: CardProps) => {
    return (
        <div
            className={`border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    )
}
