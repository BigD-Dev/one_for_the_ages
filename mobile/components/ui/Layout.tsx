'use client'

import { ReactNode } from 'react'

interface AppShellProps {
    children: ReactNode
    className?: string
}

export const AppShell = ({ children, className = '' }: AppShellProps) => {
    return (
        <main className={`min-h-screen max-w-md mx-auto ${className}`}>
            {children}
        </main>
    )
}
