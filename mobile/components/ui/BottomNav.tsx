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
        <nav className="fixed bottom-0 left-0 right-0 bg-canvas/80 backdrop-blur-md border-t border-border-subtle h-20 flex items-center justify-around px-8 z-50">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-gold' : 'text-text-muted opacity-60 hover:opacity-100'}`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="font-sans text-[10px] uppercase tracking-widest font-medium">
                            {item.label}
                        </span >
                    </Link>
                )
            })}
        </nav>
    )
}
