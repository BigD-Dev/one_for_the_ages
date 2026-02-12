import { ReactNode } from 'react'

export const Badge = ({ children, variant = 'info', className = '' }: { children: ReactNode, variant?: 'info' | 'success' | 'warn' | 'streak', className?: string }) => {
    const styles = {
        info: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warn: 'bg-red-500/10 text-red-400 border-red-500/20',
        streak: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sharp text-xs font-semibold border ${styles[variant]} ${className}`}>
            {children}
        </span>
    )
}
