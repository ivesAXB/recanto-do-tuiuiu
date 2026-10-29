import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets VITE_BASE ("/recanto-do-tuiuiu/" on github.io, "/" with a custom domain).
  // Locally it stays "/".
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
