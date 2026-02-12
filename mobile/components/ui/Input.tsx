'use client'

import React, { useRef, useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
}

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
    onShake?: () => void
}

export const Input = ({ error, className = '', ...props }: InputProps) => {
    return (
        <input
            className={twMerge(
                "w-full px-4 py-3 bg-bg-surface border rounded-lg",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "transition-all duration-200",
                error ? "border-red-500 ring-red-500/20" : "border-border-subtle",
                className
            )}
            {...props}
        />
    )
}

const shakeVariants = {
    shake: {
        x: [0, -12, 10, -8, 6, -4, 2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' }
    },
    idle: { x: 0 }
}

export const NumericInput = ({ error, className = '', onShake, ...props }: NumericInputProps) => {
    const controls = useAnimation()
    const inputRef = useRef<HTMLInputElement>(null)

    const triggerShake = useCallback(() => {
        controls.start('shake')
        onShake?.()
    }, [controls, onShake])

    // Expose shake via imperative handle-like pattern
    React.useEffect(() => {
        if (error) {
            triggerShake()
        }
    }, [error, triggerShake])

    return (
        <motion.div
            variants={shakeVariants}
            animate={controls}
        >
            <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className={twMerge(
                    "w-full h-16 text-center text-4xl font-bold bg-bg-surface-active",
                    "rounded-2xl border transition-all duration-200 outline-none",
                    "placeholder:text-text-muted/30 tracking-wider",
                    error
                        ? "border-text-error text-text-error shadow-lg shadow-red-500/20"
                        : "border-border-active focus:border-primary focus:shadow-lg focus:shadow-primary/10",
                    className
                )}
                {...props}
            />
        </motion.div>
    )
}

// Shake helper hook for use outside the component
export const useInputShake = () => {
    const controls = useAnimation()

    const shake = useCallback(() => {
        controls.start({
            x: [0, -12, 10, -8, 6, -4, 2, 0],
            transition: { duration: 0.5, ease: 'easeInOut' }
        })
    }, [controls])

    return { controls, shake }
}
