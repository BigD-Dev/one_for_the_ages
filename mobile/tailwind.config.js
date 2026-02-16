/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                canvas: '#121212',
                surface: '#1E1E1E',
                'surface-raised': '#1A1F22', // Slightly raised panel
                primary: '#1E7A8C', // Teal
                secondary: '#7B2CBF', // Muted Violet
                gold: '#C9A227',
                'text-primary': '#F2F2F2', // Off-white
                'text-muted': '#94A3B8',   // Cool Grey
                'border-subtle': '#2A2A2A', // Subtle Border
            },
            fontFamily: {
                serif: ['var(--font-serif)', 'Fraunces', 'serif'],
                sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
                montserrat: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
            },
            borderWidth: {
                hairline: '1px',
                sharp: '2px',
                DEFAULT: '2px',
            },
            borderRadius: {
                sharp: '2px',
            },
            keyframes: {
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'line-draw': {
                    from: { width: '0%' },
                    to: { width: '100%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                'fade-in': 'fade-in 150ms ease-out forwards',
                'line-draw': 'line-draw 1.2s ease-out forwards',
                shimmer: 'shimmer 2s linear infinite',
            },
        },
    },
    plugins: [],
}
