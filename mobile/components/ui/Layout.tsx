'use client'

import { ReactNode } from 'react'

interface AppShellProps {
    children: ReactNode
    className?: string
    hideLogo?: boolean
}

export const AppShell = ({ children, className = '', hideLogo = false }: AppShellProps) => {
    return (
        <main className={`min-h-screen w-full max-w-md mx-auto ${className}`}>
            {!hideLogo && (
                <div className="absolute top-3 left-3 z-50 pointer-events-none select-none" style={{ mixBlendMode: 'screen' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/logo.png"
                        alt="OFTA"
                        width={54}
                        height={20}
                        className="opacity-50"
                    />
                </div>
            )}
            {children}
        </main>
    )
}
