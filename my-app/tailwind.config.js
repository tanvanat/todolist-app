/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <— สำคัญ
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        card: 'var(--card)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        primaryfg: 'var(--primary-fg)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}
