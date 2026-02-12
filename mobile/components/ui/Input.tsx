'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
}

export const Input = ({ error, className = '', ...props }: InputProps) => {
    return (
        <input
            className={`w-full px-4 py-3 bg-surface border rounded-sharp text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-150 ${error ? 'border-red-500' : 'border-border-subtle'} ${className}`}
            {...props}
        />
    )
}
