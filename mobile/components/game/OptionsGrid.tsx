'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Option {
    id: string | number
    label: string
    icon?: LucideIcon
    symbol?: string
}

interface OptionsGridProps {
    options: Option[]
    onSelect: (id: string | number) => void
    selectedId?: string | number | null
    correctId?: string | number | null
    disabled?: boolean
    className?: string
    accentColor?: 'teal' | 'violet'
}

export const OptionsGrid = ({
    options,
    onSelect,
    selectedId,
    correctId,
    disabled = false,
    className = '',
    accentColor = 'teal'
}: OptionsGridProps) => {
    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {options.map((option) => {
                const isSelected = selectedId === option.id
                const isCorrect = correctId === option.id
                const isWrong = isSelected && correctId !== null && !isCorrect
                const revealMode = correctId !== null

                let borderClass = 'border-border-subtle'
                if (revealMode) {
                    if (isCorrect) borderClass = 'border-green-500'
                    else if (isWrong) borderClass = 'border-red-500'
                    else borderClass = 'border-border-subtle opacity-40'
                } else if (isSelected) {
                    borderClass = accentColor === 'teal' ? 'border-primary' : 'border-secondary'
                }

                return (
                    <motion.button
                        key={option.id}
                        whileTap={!disabled ? { scale: 0.95 } : {}}
                        transition={{ duration: 0.15 }}
                        className={`
                            relative flex flex-col items-center justify-center 
                            p-4 h-24 rounded-sharp border-sharp transition-all duration-200
                            ${borderClass}
                            ${!disabled ? 'active:bg-surface-raised cursor-pointer' : 'cursor-default'}
                            bg-surface
                        `}
                        onClick={() => !disabled && onSelect(option.id)}
                        disabled={disabled}
                    >
                        {option.symbol && (
                            <span className="text-xl mb-1 text-text-primary">
                                {option.symbol}
                            </span>
                        )}
                        <span className="text-sm font-medium text-text-primary uppercase tracking-tight">
                            {option.label}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}
