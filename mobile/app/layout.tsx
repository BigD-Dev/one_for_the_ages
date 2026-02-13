import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Montserrat } from 'next/font/google'
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

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['700'],
    variable: '--font-montserrat',
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
        <html lang="en" className={`${fraunces.variable} ${inter.variable} ${montserrat.variable}`}>
            <body className="bg-canvas text-text-primary font-montserrat font-bold antialiased">{children}</body>
        </html>
    )
}
