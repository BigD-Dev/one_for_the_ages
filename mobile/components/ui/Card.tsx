'use client'

import { ReactNode, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

interface CardProps {
    children: ReactNode
    variant?: 'glass' | 'solid' | 'elevated' | 'interactive' | 'hero' | 'game'
    className?: string
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    tilt?: boolean
    layoutId?: string
}

export const Card = ({
    children,
    variant = 'glass',
    className = '',
    onClick,
    onMouseEnter,
    onMouseLeave,
    tilt = false,
    layoutId,
}: CardProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // 3D tilt values
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 300, damping: 30 })
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 })

    // Specular reflection position
    const shineX = useTransform(mouseX, [0, 1], [150, -50])
    const shineY = useTransform(mouseY, [0, 1], [150, -50])

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!tilt || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        setIsHovered(true)
        onMouseEnter?.()
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        setIsHovered(false)
        mouseX.set(0.5)
        mouseY.set(0.5)
        onMouseLeave?.()
    }

    const baseClasses = 'rounded-2xl transition-colors duration-300'

    const variantClasses = {
        glass: 'bg-bg-surface backdrop-blur-md border border-border-subtle',
        solid: 'bg-bg-secondary',
        elevated: `
            bg-bg-surface backdrop-blur-md
            shadow-lg shadow-black/20
            hover:shadow-xl hover:shadow-black/30
            hover:bg-bg-surface-active
        `,
        interactive: `
            bg-bg-surface backdrop-blur-md
            shadow-md shadow-black/10
            hover:shadow-lg hover:shadow-black/20
            hover:bg-bg-surface-active
            cursor-pointer
        `,
        hero: `
            bg-gradient-to-br from-bg-surface to-bg-secondary
            backdrop-blur-md
            shadow-2xl shadow-black/40
            overflow-hidden
        `,
        game: `
            bg-bg-surface backdrop-blur-md border border-border-subtle
            shadow-lg shadow-black/20
            border-l-4 border-l-primary
            hover:border-l-primary/80
        `
    }

    // Gradient border for elevated/interactive variants
    const gradientBorder = (variant === 'elevated' || variant === 'interactive' || variant === 'glass') && (
        <div
            className={twMerge(
                "absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
                padding: '1px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
            }}
        />
    )

    // Specular reflection shine layer
    const specularShine = tilt && isHovered && (
        <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{
                background: useTransform(
                    [shineX, shineY],
                    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`
                ),
            }}
        />
    )

    const interactiveClasses = onClick && variant !== 'interactive'
        ? 'cursor-pointer'
        : ''

    const classes = twMerge(
        baseClasses,
        variantClasses[variant],
        interactiveClasses,
        className
    )

    return (
        <motion.div
            ref={ref}
            className={`relative ${classes}`}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            layoutId={layoutId}
            style={tilt ? {
                rotateX,
                rotateY,
                transformPerspective: 1000,
                transformStyle: 'preserve-3d',
            } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {gradientBorder}
            {specularShine}
            {children}
        </motion.div>
    )
}
