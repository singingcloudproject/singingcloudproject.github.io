import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three.js + 3D helpers stay in the lazily loaded Studio chunk (only the home page loads them)
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
})
