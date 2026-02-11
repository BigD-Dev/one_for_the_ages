/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef7ee',
                    100: '#fdecd3',
                    200: '#fad5a5',
                    300: '#f7b76d',
                    400: '#f38f33',
                    500: '#f0710b',
                    600: '#e15706',
                    700: '#ba4108',
                    800: '#94340e',
                    900: '#782c0f',
                    950: '#411405',
                },
                dark: {
                    50: '#f6f6f7',
                    100: '#e1e3e5',
                    200: '#c3c6cc',
                    300: '#9da2ab',
                    400: '#787f8c',
                    500: '#5f6471',
                    600: '#4c505c',
                    700: '#40434c',
                    800: '#373941',
                    900: '#313338',
                    950: '#1a1a2e',
                },
            },
        },
    },
    plugins: [],
}
