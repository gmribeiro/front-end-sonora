import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



 // Load app-level env vars to node-level env vars.

 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
