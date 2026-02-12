'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'icon' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    href?: string
    className?: string
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', href, ...props }: ButtonProps) => {
    const base = "relative inline-flex items-center justify-center font-medium outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer overflow-hidden group"

    const variants = {
        primary: "bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/25 border border-white/10",
        secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 rounded-xl",
        icon: "bg-transparent text-white/70 hover:text-white p-2 rounded-full hover:bg-white/5",
        ghost: "bg-transparent text-white/50 hover:text-white"
    }

    const sizes = {
        sm: "text-sm px-4 h-9",
        md: "text-base px-6 h-12",
        lg: "text-lg px-8 h-14 font-bold tracking-wide"
    }

    const iconSize = variant === 'icon' ? '' : sizes[size]
    const classes = `${base} ${variants[variant]} ${iconSize} ${className}`

    const content = (
        <>
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {/* Shine Effect for Primary */}
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
        </>
    )

    // Animation props
    const animation = {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.96 }
    }

    if (href) {
        return (
            <Link href={href} legacyBehavior>
                <motion.a className={classes} {...animation}>
                    {content}
                </motion.a>
            </Link>
        )
    }

    return (
        <motion.button className={classes} {...animation} {...props}>
            {content}
        </motion.button>
    )
}
