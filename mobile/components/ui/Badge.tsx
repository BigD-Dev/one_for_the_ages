import { ReactNode } from 'react'

export const Badge = ({ children, variant = 'info', className = '' }: { children: ReactNode, variant?: 'info' | 'success' | 'warn' | 'streak', className?: string }) => {
    const styles = {
        info: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-text-success/10 text-text-success border-text-success/20',
        warn: 'bg-text-error/10 text-text-error border-text-error/20',
        streak: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
            {children}
        </span>
    )
}
