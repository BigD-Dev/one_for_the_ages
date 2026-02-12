import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
}

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
}

export const Input = ({ error, className = '', ...props }: InputProps) => {
    return (
        <input
            className={`
                w-full px-4 py-3 bg-bg-surface border rounded-lg
                text-text-primary placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                transition-all duration-200
                ${error ? 'border-red-500 ring-red-500/20' : 'border-border-subtle'}
                ${className}
            `}
            {...props}
        />
    )
}

export const NumericInput = ({ error, className = '', ...props }: NumericInputProps) => {
    return (
        <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`
        w-full h-16 text-center text-4xl font-bold bg-bg-surface-active
        rounded-2xl border transition-all duration-200 outline-none
        placeholder:text-text-muted/30 tracking-wider
        ${error
                    ? 'border-text-error text-text-error animate-shake'
                    : 'border-border-active focus:border-primary focus:shadow-lg focus:shadow-primary/10'
                }
        ${className}
      `}
            {...props}
        />
    )
}
