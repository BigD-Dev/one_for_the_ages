'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    variant?: 'glass' | 'solid'
    className?: string
    onClick?: () => void
}

export const Card = ({ children, variant = 'glass', className = '', onClick, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        relative overflow-hidden rounded-2xl
        ${variant === 'glass' ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/20' : 'bg-black/20'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            {...props}
        >
            {/* Specular Highlight (top edge) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>

            {/* Inner Glow (bottom corner) */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
        </motion.div>
    )
}
