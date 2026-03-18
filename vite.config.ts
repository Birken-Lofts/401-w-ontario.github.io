import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/401-w-ontario.github.io/',
  plugins: [react(), tailwindcss()],
})
