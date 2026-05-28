// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50:  '#fdf2f6',
                    100: '#fce7f0',
                    200: '#f9c8de',
                    300: '#f59bbf',
                    400: '#ee6096',
                    500: '#e23d76',
                    600: '#cc1f5a',
                    700: '#a8154a',
                    800: '#8c1540',
                    900: '#751538',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
            },
            fontSize: {
                base: ['16px', { lineHeight: '1.6' }],
            },
        },
    },
    plugins: [],
}