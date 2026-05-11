import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Resolve o erro de carregamento do PDF [cite: 287]
    include: ['pdfjs-dist'],
  },
})