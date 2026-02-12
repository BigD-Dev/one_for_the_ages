'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
    children: ReactNode
    className?: string
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.08,
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
        }
    }
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Stagger wrapper for child elements
interface StaggerChildrenProps {
    children: ReactNode
    className?: string
    staggerDelay?: number
}

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        }
    }
}

const childVariants = {
    initial: {
        opacity: 0,
        y: 16,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        }
    }
}

export const StaggerChildren = ({ children, className = '' }: StaggerChildrenProps) => {
    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
    return (
        <motion.div variants={childVariants} className={className}>
            {children}
        </motion.div>
    )
}

// Animated element that fades in when it enters the viewport
export const FadeIn = ({
    children,
    className = '',
    delay = 0,
    direction = 'up'
}: {
    children: ReactNode
    className?: string
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right'
}) => {
    const directionOffsets = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffsets[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
