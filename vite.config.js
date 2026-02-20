import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/geoapify': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/geocode': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/overpass': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
