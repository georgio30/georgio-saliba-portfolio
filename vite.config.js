import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The island's chunk is mostly three.js (~130 KB gzipped) and only loads after first paint
    chunkSizeWarningLimit: 600,
  },
})
