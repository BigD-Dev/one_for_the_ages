'use client'

import Link from 'next/link'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-dark-950 to-dark-900">
            <div className="text-center space-y-8 max-w-md">
                {/* Logo / Title */}
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold text-primary-400">
                        One for the Ages
                    </h1>
                    <p className="text-xl text-gray-300">
                        Celebrity Age Trivia
                    </p>
                </div>

                {/* Tagline */}
                <p className="text-gray-400 text-lg">
                    Guess ages, compete on leaderboards, master the ages!
                </p>

                {/* Game Mode Buttons */}
                <div className="space-y-4 pt-8">
                    <Link
                        href="/game/age-guess"
                        className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        🎯 Age Guess
                    </Link>

                    <Link
                        href="/game/whos-older"
                        className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        ⚖️ Who's Older?
                    </Link>

                    <Link
                        href="/game/daily"
                        className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        ⭐ Daily Challenge
                    </Link>

                    <Link
                        href="/game/reverse"
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        🔮 Reverse Mode
                    </Link>
                </div>

                {/* Bottom Links */}
                <div className="flex justify-center gap-6 pt-8 text-sm text-gray-500">
                    <Link href="/leaderboard" className="hover:text-primary-400 transition-colors">
                        Leaderboard
                    </Link>
                    <Link href="/profile" className="hover:text-primary-400 transition-colors">
                        Profile
                    </Link>
                    <Link href="/settings" className="hover:text-primary-400 transition-colors">
                        Settings
                    </Link>
                </div>
            </div>
        </main>
    )
}
