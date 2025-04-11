/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          'avalon-blue': '#1e40af',
          'avalon-green': '#15803d',
          'avalon-gold': '#b45309',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        animation: {
          'skeleton': 'shimmer 2s infinite linear',
        },
        keyframes: {
          shimmer: {
            '0%': { backgroundPosition: '-1000px 0' },
            '100%': { backgroundPosition: '1000px 0' },
          },
        },
      },
    },
    plugins: [],
  }
  