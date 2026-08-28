import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Build optimizations
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libs into separate chunks for better caching
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor':   ['recharts'],
          'map-vendor':     ['leaflet', 'react-leaflet'],
          'socket-vendor':  ['socket.io-client'],
          'ui-vendor':      ['lucide-react', 'react-hot-toast'],
        }
      }
    }
  },

  server: {
    port: 5173,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    } : {}
  }
}))
