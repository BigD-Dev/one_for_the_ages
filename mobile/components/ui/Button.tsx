'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'ghost' | 'text'
    href?: string
    className?: string
}

const variantStyles: Record<string, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-surface border border-border-subtle text-text-primary',
    ghost: 'bg-transparent text-text-muted',
    text: 'bg-transparent text-text-primary underline underline-offset-4',
}

export const Button = ({ children, variant = 'primary', className = '', href, ...props }: ButtonProps) => {
    const base = 'inline-flex items-center justify-center rounded-sharp text-sm font-medium px-4 py-3 active:opacity-80 transition-opacity duration-150 disabled:opacity-50 disabled:pointer-events-none'
    const combined = `${base} ${variantStyles[variant] || variantStyles.primary} ${className}`

    if (href) {
        return (
            <Link href={href} className={combined}>
                {children}
            </Link>
        )
    }

    return (
        <button className={combined} {...props}>
            {children}
        </button>
    )
}
