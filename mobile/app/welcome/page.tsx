'use client'

import Link from 'next/link'
import { AppShell } from '@/components/ui/Layout'

export default function Welcome() {
    return (
        <AppShell className="bg-canvas relative overflow-hidden flex flex-col justify-between p-8">

            {/* Background: Subtle deep teal radial gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-canvas to-canvas pointer-events-none" />

            {/* Top: Logo */}
            <div className="pt-12 flex justify-center">
                <img
                    src="/images/logo.png"
                    alt="One for the Ages"
                    className="h-40 w-auto opacity-80"
                />
            </div>

            {/* Middle: Headlines */}
            <div className="space-y-4 text-center z-10">
                <h2 className="font-serif text-3xl text-text-primary leading-tight">
                    Everyone’s an expert...
                </h2>
                <h2 className="font-serif text-3xl text-text-primary leading-tight opacity-90 italic">
                    until the clock starts.
                </h2>
            </div>

            {/* Bottom: Actions */}
            <div className="space-y-6 pb-12 w-full max-w-xs mx-auto z-10 text-center">

                {/* GET STARTED Button */}
                <Link
                    href="/"
                    className="block w-full bg-primary text-white font-sans font-medium text-sm tracking-wide py-4 rounded-sharp hover:bg-primary/90 transition-colors uppercase"
                >
                    Get Started
                </Link>

                {/* Log In Link */}
                <div>
                    <Link
                        href="/login"
                        className="font-sans text-sm text-text-primary underline decoration-gold/50 underline-offset-4 hover:text-gold transition-colors"
                    >
                        Log In
                    </Link>
                </div>

                {/* Caption */}
                <p className="font-sans text-xs text-text-muted mt-8">
                    Upgrade anytime without losing progress.
                </p>

            </div>
        </AppShell>
    )
}
