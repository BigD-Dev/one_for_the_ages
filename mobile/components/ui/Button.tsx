'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'icon' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    href?: string
    magnetic?: boolean
}

const MotionLink = motion.create(Link)

export const Button = ({ children, variant = 'primary', size = 'md', className = '', href, magnetic = false, ...props }: ButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Magnetic pull effect (desktop)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
    const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!magnetic || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        mouseX.set((e.clientX - centerX) * 0.15)
        mouseY.set((e.clientY - centerY) * 0.15)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
    }

    const base = "relative inline-flex items-center justify-center font-medium outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer overflow-hidden"

    const variants = {
        primary: "bg-gradient-to-r from-primary-from to-primary-to text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40",
        secondary: "bg-bg-surface-active text-text-secondary border border-border-subtle hover:text-text-primary rounded-xl",
        outline: "bg-transparent text-text-secondary border border-border-subtle hover:text-text-primary hover:border-primary/50 rounded-xl",
        icon: "bg-transparent text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-bg-surface-active",
        ghost: "bg-transparent text-text-muted hover:text-text-primary"
    }

    const sizes = {
        sm: "text-sm px-4 h-9",
        md: "text-base px-6 h-12",
        lg: "text-lg px-8 h-14 font-bold tracking-wide"
    }

    const iconSize = variant === 'icon' ? '' : sizes[size]
    const classes = twMerge(base, variants[variant], iconSize, className)

    const motionProps = {
        whileTap: { scale: 0.95 },
        whileHover: { scale: 1.02 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
        onMouseMove: handleMouseMove,
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: handleMouseLeave,
        style: magnetic ? { x: springX, y: springY } : undefined,
    }

    // Inner glow overlay for primary variant
    const innerGlow = variant === 'primary' && (
        <motion.span
            className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05), transparent)',
                opacity: isHovered ? 0.6 : 0,
            }}
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
    )

    if (href) {
        return (
            <MotionLink href={href} className={classes} {...motionProps}>
                {innerGlow}
                <span className="relative z-10 flex items-center justify-center">{children}</span>
            </MotionLink>
        )
    }

    return (
        <motion.button ref={ref} className={classes} {...motionProps} {...props}>
            {innerGlow}
            <span className="relative z-10 flex items-center justify-center">{children}</span>
        </motion.button>
    )
}
