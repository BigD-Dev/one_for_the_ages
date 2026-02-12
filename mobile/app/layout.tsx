import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'One for the Ages',
    description: 'The Archive.',
    icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#121212', // Matches bg-canvas
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
            <body className="bg-canvas text-text-primary font-sans antialiased">{children}</body>
        </html>
    )
}
