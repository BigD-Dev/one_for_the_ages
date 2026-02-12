'use client'

import { ReactNode } from 'react'

interface AppShellProps {
    children: ReactNode
    theme?: 'default' | 'mystic' | 'golden'
    className?: string
}

export const AppShell = ({ children, theme = 'default', className = '' }: AppShellProps) => {
    return (
        <div data-theme={theme} className={`min-h-screen safe-h-screen bg-bg-primary text-text-primary ${className} overflow-hidden font-sans`}>
            <main className="flex flex-col h-full px-4 pt-4 pb-8 max-w-md mx-auto relative z-10">
                {children}
            </main>

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]" />
            </div>
        </div>
    )
}
