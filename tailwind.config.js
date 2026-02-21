/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Rebary Brand Colors
        primary: {
          DEFAULT: '#0891B2', // Cyan blue
          light: '#06B6D4',
          dark: '#0E7490',
        },
        accent: {
          orange: '#FF9500',
          yellow: '#FFD600',
          green: '#7FB800',
          lightgreen: '#9ACD32',
          blue: '#0072CE',
          lightblue: '#00A8E8',
          red: '#E81D23',
          darkred: '#C41E3A',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
