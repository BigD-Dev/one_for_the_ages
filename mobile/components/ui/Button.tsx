'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'icon'
    href?: string
    className?: string
}

export const Button = ({ children, variant = 'primary', className = '', href, ...props }: ButtonProps) => {
    const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"

    let variantClass = "bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2" // primary
    if (variant === 'secondary') variantClass = "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 h-10 px-4 py-2"
    if (variant === 'icon') variantClass = "h-10 w-10"

    const combinedClass = `${baseClass} ${variantClass} ${className}`

    if (href) {
        return (
            <Link href={href} className={combinedClass}>
                {children}
            </Link>
        )
    }

    return (
        <button className={combinedClass} {...props}>
            {children}
        </button>
    )
}
