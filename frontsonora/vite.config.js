import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})