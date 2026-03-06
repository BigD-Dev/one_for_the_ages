'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, User } from 'lucide-react'

export const BottomNav = () => {
    const pathname = usePathname()

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { label: 'Profile', href: '/profile', icon: User },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-canvas/80 backdrop-blur-md border-t border-border-subtle h-20 flex items-center justify-around px-8 z-50 pb-safe">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            relative flex flex-col items-center gap-1
                            transition-all duration-300 ease-out
                            ${isActive
                                ? 'text-gold scale-105'
                                : 'text-text-muted opacity-60 hover:opacity-100 hover:text-text-primary scale-100'
                            }
                        `}
                    >
                        {/* Active indicator dot */}
                        <span
                            className={`
                                absolute -top-3 left-1/2 -translate-x-1/2
                                w-1 h-1 rounded-full bg-gold
                                transition-all duration-300
                                ${isActive ? 'opacity-100' : 'opacity-0'}
                            `}
                        />
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.5 : 2}
                            className="transition-all duration-300"
                        />
                        <span className={`
                            font-sans text-[10px] uppercase tracking-widest
                            transition-all duration-300
                            ${isActive ? 'font-bold' : 'font-medium'}
                        `}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
