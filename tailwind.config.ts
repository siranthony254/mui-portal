import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E1F5EE', 100: '#C3EBD7', 200: '#87D7AF',
          300: '#4BC387', 400: '#1DAF6B', 500: '#1D9E75',
          600: '#0F6E56', 700: '#0F6E56', 800: '#085041', 900: '#04342C',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
