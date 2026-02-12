'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AppShellProps {
    children: ReactNode
    theme?: 'default' | 'mystic' | 'golden'
    className?: string
}

// Lightweight floating particles using CSS
const FloatingParticles = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="floating-particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${6 + Math.random() * 8}s`,
                        width: `${2 + Math.random() * 3}px`,
                        height: `${2 + Math.random() * 3}px`,
                    }}
                />
            ))}
        </div>
    )
}

export const AppShell = ({ children, theme = 'default', className = '' }: AppShellProps) => {
    return (
        <div data-theme={theme} className={`min-h-screen safe-h-screen bg-bg-primary text-text-primary ${className} overflow-hidden font-sans relative`}>
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient animate-mesh" />

            {/* Film Grain Noise Overlay */}
            <div className="noise-overlay" />

            {/* Floating Particles */}
            <FloatingParticles />

            <motion.main
                className="flex flex-col h-full px-5 pt-6 pb-8 max-w-md mx-auto relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.main>
        </div>
    )
}
