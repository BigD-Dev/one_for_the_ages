'use client'

import { AppShell } from '@/components/ui/Layout'
import { ArtifactCard } from '@/components/ArtifactCard'
import { Sun, Hourglass, Scale, Star, Menu, User } from 'lucide-react'

export default function Home() {
    return (
        <AppShell className="bg-canvas">
            <div className="flex flex-col h-full relative space-y-8">

                {/* Header: Personal Greeting */}
                <header className="flex justify-between items-end pb-2 border-b border-border-subtle">
                    <div>
                        <p className="font-sans text-xs text-gold uppercase tracking-[0.2em] mb-1 opacity-80">
                            The Archive
                        </p>
                        <h1 className="font-serif text-3xl text-text-primary">
                            Good Evening.
                        </h1>
                    </div>
                    <button className="p-2 opacity-60 active:opacity-80 transition-opacity duration-150">
                        <User size={20} className="text-text-primary" />
                    </button>
                </header>

                {/* Bento Grid Layout */}
                <main className="grid grid-cols-2 gap-4">
                    {/* Hero: Daily Ritual */}
                    <div className="col-span-2">
                        <ArtifactCard
                            href="/game/daily"
                            variant="hero"
                            title="Daily Ritual"
                            subtitle="Play today's curation."
                            year="XXXX"
                            icon={<Sun size={24} />}
                        />
                    </div>

                    {/* Standard: Age Guess */}
                    <div className="col-span-1">
                        <ArtifactCard
                            href="/game/age-guess"
                            variant="standard"
                            title="Age Guess"
                            subtitle="Precision Mode"
                            icon={<Hourglass size={20} />}
                        />
                    </div>

                    {/* Standard: Who's Older */}
                    <div className="col-span-1">
                        <ArtifactCard
                            href="/game/whos-older"
                            variant="standard"
                            title="Who's Older"
                            subtitle="Versus Mode"
                            icon={<Scale size={20} />}
                        />
                    </div>

                    {/* Wide: Reverse / Zodiac */}
                    <div className="col-span-2">
                        <ArtifactCard
                            href="/game/reverse"
                            variant="wide"
                            title="Reverse / Zodiac"
                            subtitle="Astrological Timeline"
                            icon={<Star size={20} />}
                        />
                    </div>
                </main>

                {/* Floating Menu Pill */}
                <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
                    <button className="pointer-events-auto bg-surface border border-border-subtle text-text-primary px-6 py-3 rounded-full flex items-center gap-3 active:opacity-80 transition-opacity duration-150">
                        <span className="font-sans text-xs font-medium tracking-widest text-gold">MENU</span>
                        <Menu size={16} className="text-text-muted" />
                    </button>
                </div>

            </div>
        </AppShell>
    )
}
